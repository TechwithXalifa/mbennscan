-- MbënnScan : schéma de la base (Supabase, PostgreSQL + PostGIS)
-- Doit rester aligné avec contracts/schemas/. Toute modification passe par une PR « contract ».

create extension if not exists postgis;

-- ── Zones de calcul (mailles H3 ou quartiers) ───────────────────────────────
create table if not exists zones (
  id          text primary key,                       -- index H3 ou code quartier
  nom         text not null,                          -- ex. « Jaxaay, maille 12 »
  commune     text not null,
  geom        geometry(Polygon, 4326) not null,
  population  integer check (population >= 0),
  part_bati   real check (part_bati between 0 and 1)
);
create index if not exists zones_geom_idx on zones using gist (geom);

-- ── Indicateurs par zone et par hivernage ────────────────────────────────────
create table if not exists indicateurs_saison (
  zone_id          text not null references zones(id) on delete cascade,
  annee            smallint not null,
  images_valides   smallint not null check (images_valides >= 0),
  images_inondees  smallint not null check (images_inondees >= 0),
  frequence        real check (frequence between 0 and 1),   -- null si aucune image valide
  duree_moy_jours  real check (duree_moy_jours >= 0),
  classe_eau       text check (classe_eau in ('ruissellement','intermediaire','stagnation')),
  habitants_jours  real not null default 0 check (habitants_jours >= 0),
  primary key (zone_id, annee),
  check (images_inondees <= images_valides)
);

-- ── Synthèse 2020-2026 utilisée par la carte ─────────────────────────────────
create table if not exists syntheses (
  zone_id             text primary key references zones(id) on delete cascade,
  habitants_jours_an  real not null default 0 check (habitants_jours_an >= 0),
  priorite            text not null check (priorite in ('forte','moyenne','faible','nulle')),
  rang                integer check (rang >= 1),
  classe_eau          text check (classe_eau in ('ruissellement','intermediaire','stagnation')),
  confiance           text not null check (confiance in ('elevee','moyenne','faible')),
  batiments_touches   integer not null default 0,
  ecoles_touchees     integer not null default 0,
  ecoles_noms         text[] not null default '{}',
  routes_km           real not null default 0,
  maj                 timestamptz not null default now()
);

-- ── Épisodes de pluie et eau détectée ────────────────────────────────────────
create table if not exists evenements (
  id           serial primary key,
  date_pluie   date not null,
  pluie_mm     real,
  station      text,                 -- nom de station ou 'CHIRPS'
  date_image   date,                 -- première image radar exploitable après la pluie
  eau_geojson  jsonb                 -- FeatureCollection de polygones simplifiés
);

create table if not exists impacts_evenement (
  evenement_id       integer not null references evenements(id) on delete cascade,
  zone_id            text not null references zones(id) on delete cascade,
  surface_eau_pct    real not null check (surface_eau_pct between 0 and 100),
  habitants_touches  integer not null default 0,
  batiments_touches  integer not null default 0,
  ecoles_touchees    integer not null default 0,
  action_suggeree    text not null check (action_suggeree in ('pomper','recenser','visiter')),
  primary key (evenement_id, zone_id)
);

-- ── Balises et mesures ───────────────────────────────────────────────────────
create table if not exists balises (
  id                  text primary key check (id ~ '^bal-[0-9]{2}$'),
  nom                 text not null,
  geom                geometry(Point, 4326),
  hauteur_capteur_cm  real not null check (hauteur_capteur_cm > 0),
  seuil_alerte_cm     real,
  cle_api_hash        text not null           -- jamais exposée (voir la vue balises_publiques)
);

create table if not exists mesures (
  id           bigserial primary key,
  balise_id    text not null references balises(id) on delete cascade,
  ts           timestamptz not null default now(),   -- date de la mesure (réception - age_s)
  recu_le      timestamptz not null default now(),   -- heure de réception : sert à la limite 1/s
  distance_cm  real not null check (distance_cm between 20 and 600),
  niveau_cm    real,                          -- rempli par le trigger ci-dessous
  batterie_v   real,
  rssi         smallint
);
-- Base créée avant age_s : le script reste relançable.
alter table mesures add column if not exists recu_le timestamptz not null default now();
create index if not exists mesures_balise_ts_idx on mesures (balise_id, ts desc);
create index if not exists mesures_balise_recu_idx on mesures (balise_id, recu_le desc);

create or replace function calcul_niveau() returns trigger language plpgsql as $$
begin
  select b.hauteur_capteur_cm - new.distance_cm into new.niveau_cm
  from balises b where b.id = new.balise_id;
  return new;
end $$;

drop trigger if exists mesures_niveau on mesures;
create trigger mesures_niveau before insert or update of distance_cm on mesures
  for each row execute function calcul_niveau();

-- Vue sans la clé, conforme à contracts/schemas/balises.schema.json
create or replace view balises_publiques with (security_invoker = true) as
  select id, nom, st_x(geom) as lon, st_y(geom) as lat, hauteur_capteur_cm, seuil_alerte_cm
  from balises;

-- ── Fonction lue par l'écran E1 (contrat zones.schema.json) ──────────────────
create or replace function zones_geojson() returns jsonb language sql stable as $$
  select jsonb_build_object(
    'type', 'FeatureCollection',
    'features', coalesce(jsonb_agg(
      jsonb_build_object(
        'type', 'Feature',
        'geometry', st_asgeojson(st_simplifypreservetopology(z.geom, 0.00005), 6)::jsonb,
        'properties', (to_jsonb(s) - 'zone_id') || jsonb_build_object(
          'id', z.id, 'nom', z.nom, 'commune', z.commune,
          'population', z.population, 'part_bati', z.part_bati)
      ) order by s.rang nulls last), '[]'::jsonb)
  )
  from zones z
  join syntheses s on s.zone_id = z.id;
$$;

-- ── Sécurité : lecture publique, écriture réservée ───────────────────────────
-- Le pipeline écrit avec la clé service_role (qui contourne RLS).
-- L'Edge Function « mesure » écrit dans mesures après avoir vérifié la clé de la balise.
alter table zones              enable row level security;
alter table indicateurs_saison enable row level security;
alter table syntheses          enable row level security;
alter table evenements         enable row level security;
alter table impacts_evenement  enable row level security;
alter table balises            enable row level security;
alter table mesures            enable row level security;

drop policy if exists "lecture publique" on zones;
create policy "lecture publique" on zones              for select using (true);
drop policy if exists "lecture publique" on indicateurs_saison;
create policy "lecture publique" on indicateurs_saison for select using (true);
drop policy if exists "lecture publique" on syntheses;
create policy "lecture publique" on syntheses          for select using (true);
drop policy if exists "lecture publique" on evenements;
create policy "lecture publique" on evenements         for select using (true);
drop policy if exists "lecture publique" on impacts_evenement;
create policy "lecture publique" on impacts_evenement  for select using (true);
drop policy if exists "lecture publique" on mesures;
create policy "lecture publique" on mesures            for select using (true);
-- balises : pas de lecture publique de la table (clé hachée) ; lire balises_publiques.
revoke select on balises from anon, authenticated;
grant select (id, nom, geom, hauteur_capteur_cm, seuil_alerte_cm) on balises to anon, authenticated;
drop policy if exists "lecture publique sans cle" on balises;
create policy "lecture publique sans cle" on balises for select using (true);

-- Droits explicites (Supabase les donne par défaut, mais on ne compte pas dessus)
grant usage on schema public to anon, authenticated;
grant select on zones, indicateurs_saison, syntheses, evenements, impacts_evenement, mesures
  to anon, authenticated;
grant select on balises_publiques to anon, authenticated;
grant execute on function zones_geojson() to anon, authenticated;
revoke insert, update, delete on all tables in schema public from anon, authenticated;

-- ── Temps réel pour l'écran E5 ───────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'mesures') then
    alter publication supabase_realtime add table mesures;
  end if;
end $$;
