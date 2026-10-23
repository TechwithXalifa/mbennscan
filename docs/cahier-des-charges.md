# MbënnScan — Cahier des charges

Prototype pour le hackathon « Du satellite à la solution » (SENSAT-TRL), 20-22 octobre 2026 · Version 1.0 du 17 octobre 2026

## 1. Contexte et objectifs

MbënnScan mesure par satellite où l'eau des inondations est réellement restée dans la banlieue de Dakar, combien de temps, et chez combien d'habitants. Le produit sert deux moments : avant la saison des pluies (où investir, où préparer les moyens) et juste après une forte pluie (où l'eau est encore là). Une balise au sol complète le satellite par une mesure continue du niveau d'un bassin.

**Objectif du prototype (20-22 octobre 2026)** : une application web consultable sur téléphone, alimentée par des données satellitaires réelles sur le département de Keur Massar, avec une démonstration de balise en direct. Le jury doit pouvoir comprendre l'outil en 30 secondes.

**Objectif de la version cible (après le hackathon)** : couvrir Keur Massar, Pikine et Guédiawaye, mettre les données à jour automatiquement à chaque hivernage, et brancher de vraies balises dans des bassins de rétention.

### Périmètre

| Inclus dans le prototype | Hors périmètre du prototype |
| --- | --- |
| Carte des zones classées par priorité (rouge, orange, vert) | Alertes en temps réel par SMS ou WhatsApp |
| Fiche par zone avec historique 2020-2026 | Comptes utilisateurs et gestion des droits |
| Fiche d'urgence pour un événement (4 octobre 2026 ou août 2025) | Application mobile native (iOS, Android) |
| Comparateur avant / après ouvrages (Keur Massar Sud) | Prévision météo ou modèle prédictif |
| Balise de niveau d'eau avec affichage en direct | Données par ménage ou par personne |
| Page « Méthode » expliquant les calculs et les limites | Couverture hors région de Dakar |

### Glossaire

- **Zone** : unité de calcul et d'affichage. C'est un quartier si ses limites existent ; sinon une maille hexagonale H3 (voir section 4).
- **Hivernage** : saison des pluies, de juillet à octobre.
- **Image valide** : une image Sentinel-1 qui couvre la zone, sans défaut de qualité.
- **Fréquence observée** : part des images valides d'un hivernage où l'eau est détectée dans la zone.
- **Persistance** : nombre de jours estimés pendant lesquels l'eau reste après une pluie.
- **Habitants-jours sous l'eau** : somme, sur la zone, des habitants touchés multipliés par le nombre de jours d'eau. C'est l'indicateur principal.
- **Indice de confiance** : niveau de fiabilité de la mesure (élevé, moyen, faible).

## 2. Utilisateurs et fonctionnalités

### Profils d'utilisateurs

| Profil | Exemple | Ce qu'il veut savoir | Contexte d'usage |
| --- | --- | --- | --- |
| Décideur technique | Ingénieur DPGI, ONAS | Quelles zones prioriser, pomper ou drainer, un ouvrage a-t-il marché | Ordinateur au bureau, avant la saison |
| Responsable d'intervention | Officier BNSP, agent municipal | Où l'eau est encore là après une pluie, chez combien de personnes | Téléphone sur le terrain, réseau mobile faible |
| Élu ou cadre municipal | Maire, secrétaire municipal | Quels quartiers de ma commune sont les plus touchés | Téléphone ou réunion, sans compétence technique |
| Jury du hackathon | Ingénieurs SENSAT | Comment ça marche, est-ce crédible, est-ce faisable | Démonstration de 30 secondes à quelques minutes |

**Règle de conception** : tout doit être compréhensible par le maire. Si un écran demande de savoir ce qu'est une rétrodiffusion radar, il est raté.

### Fonctionnalités priorisées

| Priorité | Fonctionnalité |
| --- | --- |
| Indispensable | F1 · Carte des zones colorées par priorité, avec légende |
| Indispensable | F2 · Fiche zone : indicateurs clés, historique 2020-2026, type d'eau, confiance, date des images |
| Indispensable | F3 · Classement des 10 zones prioritaires |
| Indispensable | F4 · Vue « Après la pluie » pour un événement : eau détectée et zones touchées |
| Important | F5 · Balise : niveau d'eau en direct, courbe des dernières heures, état de la balise |
| Important | F6 · Comparateur avant / après ouvrages (Keur Massar Sud) |
| Important | F7 · Page « Méthode et limites » en langage simple |
| Souhaitable | F8 · Recherche d'une zone par son nom |
| Souhaitable | F9 · Export ou impression d'une fiche zone (PDF via impression) |
| Souhaitable | F10 · Fonctionnement hors ligne des dernières fiches consultées |
| Plus tard | Comptes, alertes automatiques, plusieurs balises réelles, autres villes |

### Récits utilisateurs et critères d'acceptation

- En tant qu'ingénieur de la DPGI, je veux voir les zones classées par priorité pour décider où placer les prochains ouvrages. **Accepté si** : la carte s'affiche en moins de 3 secondes, chaque zone a une couleur et une étiquette, et un clic ouvre sa fiche.
- En tant qu'officier des sapeurs-pompiers, je veux savoir où l'eau est encore présente après une pluie. **Accepté si** : la vue « Après la pluie » affiche la date de l'image, l'eau détectée, et la liste des zones triées par habitants touchés.
- En tant qu'ingénieur de l'ONAS, je veux savoir si l'eau d'une zone part vite ou stagne. **Accepté si** : la fiche affiche « Ruissellement », « Intermédiaire » ou « Stagnation durable », avec une phrase d'explication.
- En tant que maire, je veux comprendre la situation de ma commune sans formation. **Accepté si** : chaque chiffre de la fiche est accompagné d'une phrase en français courant.
- En tant que membre du jury, je veux voir la balise réagir en direct. **Accepté si** : le niveau affiché change en moins de 10 secondes après une variation réelle de l'eau.

## 3. Architecture et stack technique

**Principe** : tout ce qui est lourd se calcule à l'avance. Le traitement satellite tourne hors ligne et écrit ses résultats dans une base ; l'application ne fait que les afficher. Seule la balise envoie des données en direct. Ce choix rend l'application rapide sur un réseau mobile faible et évite tout serveur de calcul coûteux.

### Stack retenue

| Couche | Choix | Pourquoi |
| --- | --- | --- |
| Traitement satellite | Python 3.11, earthengine-api, geemap | Accès gratuit à toute l'archive Sentinel-1 et 2 sans rien télécharger |
| Traitement géographique | geopandas, rasterio, rasterstats, h3 | Agréger les pixels par zone, générer la grille H3 |
| Base de données | Supabase : PostgreSQL + PostGIS | Requêtes géographiques, API REST automatique, offre gratuite |
| Temps réel (balise) | Supabase Realtime | Le niveau de la balise s'affiche sans recharger la page |
| Ingestion balise | Supabase Edge Function (TypeScript) | Point d'entrée sécurisé par clé, sans serveur à gérer |
| Front-end | Next.js 14 (App Router), TypeScript | Rendu rapide, déploiement immédiat sur Vercel |
| Carte | MapLibre GL JS + fond de carte vectoriel OpenStreetMap (Protomaps ou OpenFreeMap) | Libre, gratuit, fluide sur mobile |
| Interface | Tailwind CSS + shadcn/ui, icônes Lucide | Composants accessibles, mise en page rapide |
| Graphiques | Recharts | Histogrammes et courbes simples, légers |
| Mobile | Application web progressive (PWA) | Installable sur l'écran d'accueil, cache hors ligne, pas de store |
| Firmware balise | ESP32, framework Arduino via PlatformIO | Matériel courant, bibliothèques HTTP et Wi-Fi intégrées |
| Hébergement | Vercel (web) + Supabase (base) | Gratuit pour le volume du prototype |
| Code | GitHub, un seul dépôt | Suivi des tâches, revue rapide entre les trois membres |

### Organisation du dépôt

```
mbennscan/
  pipeline/      # scripts Python : détection de l'eau, indicateurs, export
  web/           # application Next.js
  supabase/      # schéma SQL, migrations, edge functions
  firmware/      # code de la balise (PlatformIO)
  data/          # limites de zones, exports GeoJSON (non versionnés si lourds)
  docs/          # ce cahier des charges, script de démo
```

**Plan B si Supabase pose problème le jour J** : l'application lit des fichiers GeoJSON statiques placés dans `web/public/data`, et la balise écrit dans un petit serveur FastAPI. Le reste ne change pas.

## 4. Données et traitements satellitaires

### Sources de données

| Donnée | Collection ou source | Usage |
| --- | --- | --- |
| Radar Sentinel-1 GRD, mode IW, VV + VH, 10 m | Earth Engine `COPERNICUS/S1_GRD` | Détection de l'eau, 2020-2026 |
| Optique Sentinel-2, 10 m | Earth Engine `COPERNICUS/S2_SR_HARMONIZED` | Contrôle par temps clair (NDWI), bâti |
| Pluie journalière | `UCSB-CHG/CHIRPS/DAILY`, `NASA/GPM_L3/IMERG_V07`, relevés ANACIM si disponibles | Dater les épisodes de forte pluie |
| Relief, 30 m | `COPERNICUS/DEM/GLO30` | Cuvettes, masque des pentes |
| Eau permanente | `JRC/GSW1_4/GlobalSurfaceWater` | Exclure lacs et mer |
| Population, 100 m | WorldPop (dernière année disponible, à vérifier), recalé sur le recensement RGPH-5 si possible | Habitants par pixel |
| Bâtiments | Google Open Buildings v3 | Bâtiments touchés, densité du bâti |
| Écoles, routes, noms de lieux | OpenStreetMap (Geofabrik ou Overpass) | Exposition, noms des zones |
| Limites administratives | Communes du Sénégal (HDX, jeu COD-AB) | Découpage par commune |
| Cartes de risque modélisées | Géoportail du PGIIS (sur demande) | Comparaison, pas de calcul |

### Découpage en zones

Les limites officielles des quartiers ne sont pas disponibles en libre accès. Le calcul se fait donc sur une grille hexagonale H3 de résolution 9 (environ 0,1 km² par maille), découpée par commune. Chaque maille reçoit le nom du lieu OpenStreetMap le plus proche (ex. « Jaxaay, maille 12 »). Si des limites de quartiers sont obtenues, elles remplacent la grille sans changer le reste du traitement.

### Chaîne de traitement

1. **Épisodes de pluie** : pour chaque hivernage de 2020 à 2026, liste des jours où la pluie dépasse un seuil paramétrable sur la zone d'étude (30 mm en 24 heures par défaut), plus le 4 octobre 2026 imposé.
2. **Préparation radar** : images Sentinel-1 en mode IW avec VV et VH, filtre de chatoiement (médiane 3 × 3 ou Lee raffiné). Chaque image n'est comparée qu'à des images de la même orbite relative, pour éviter les écarts de géométrie.
3. **Référence sèche** : par orbite et par année, médiane des images de février à mai.
4. **Détection de l'eau** : un pixel est inondé si son VV est sous un seuil et a baissé d'au moins 3 dB par rapport à la référence sèche. Le seuil est calculé par la méthode d'Otsu sur chaque image, borné entre -22 et -14 dB ; à défaut, -18 dB. Sont masqués : eau permanente (occurrence JRC supérieure à 50 %), pentes de plus de 5 degrés.
5. **Correction de la cadence** : selon les années, Sentinel-1 passait tous les 6 ou tous les 12 jours. Pour chaque zone et chaque hivernage : fréquence = images où la zone est inondée ÷ images valides. Une zone est « inondée » sur une image si au moins 5 % de sa surface valide est en eau (seuil paramétrable).
6. **Persistance** : après chaque épisode, on suit les images successives. La durée estimée d'un pixel est le milieu entre la dernière date où il est inondé et la première où il est sec. Classes par zone : moins de 6 jours « Ruissellement », 6 à 12 jours « Intermédiaire », 12 jours ou plus « Stagnation durable ». La précision dépend de la cadence (plus ou moins 3 à 6 jours) et doit être affichée.
7. **Habitants-jours sous l'eau** : la population WorldPop est répartie sur les pixels de 10 m. Pour un épisode : somme de (habitants du pixel × durée d'eau du pixel). Par zone : moyenne annuelle sur 2020-2026.
8. **Classement** : zones sans eau observée en gris ; les autres réparties en tiers : priorité forte (rouge), moyenne (orange), faible (vert). Pas de score composite.
9. **Exposition** : nombre de bâtiments Open Buildings qui touchent l'eau, écoles OpenStreetMap dans l'eau ou à moins de 50 m, kilomètres de route inondés.
10. **Indice de confiance** : combinaison de la part de surface bâtie (le radar voit mal entre les murs), du nombre d'images valides, et de l'accord avec les validations. Trois niveaux : élevé, moyen, faible. Les règles exactes sont écrites dans `pipeline/confidence.py` et affichées sur la page Méthode.
11. **Avant / après ouvrages** : comparaison 2020-2022 contre 2024-2026 sur Keur Massar Sud. Comme la pluie varie d'une année à l'autre, la comparaison se fait aussi en habitants-jours par millimètre de pluie, ou sur des épisodes de pluie comparable.
12. **Validation** : comparaison avec les inondations connues (Keur Massar 2020-2022, octobre 2025, octobre 2026), photos de presse géolocalisées, contrôle Sentinel-2 par temps clair. Le taux d'accord est publié sur la page Méthode.

### Sorties du pipeline

- Table des zones avec leurs indicateurs (écrite dans Supabase).
- Pour chaque épisode affiché : polygones de l'eau détectée, simplifiés à 10 m, en GeoJSON.
- Fichier `run_meta.json` : date du calcul, paramètres utilisés, liste des images, pour pouvoir refaire le calcul à l'identique.

## 5. Modèle de données et API

> **Référence à jour** : le schéma ci-dessous est celui de la version 1.0. Le schéma appliqué est [`supabase/schema.sql`](../supabase/schema.sql), aligné sur [`contracts/schemas/`](../contracts/schemas/). Il ajoute notamment `syntheses.ecoles_noms`, `evenements.station`, `impacts_evenement.action_suggeree`, des contraintes de bornes et la vue `balises_publiques`. En cas d'écart, ce sont les contrats qui font foi.

### Schéma de la base (PostgreSQL + PostGIS)

```sql
-- Zones de calcul (mailles H3 ou quartiers)
create table zones (
  id            text primary key,          -- index H3 ou code quartier
  nom           text not null,             -- ex. « Jaxaay, maille 12 »
  commune       text not null,
  geom          geometry(Polygon, 4326) not null,
  population    integer,                   -- habitants estimés
  part_bati     real                       -- 0 à 1
);

-- Indicateurs par zone et par hivernage
create table indicateurs_saison (
  zone_id         text references zones(id),
  annee           smallint,
  images_valides  smallint,
  images_inondees smallint,
  frequence       real,                    -- images_inondees / images_valides
  duree_moy_jours real,
  classe_eau      text check (classe_eau in ('ruissellement','intermediaire','stagnation')),
  habitants_jours real,
  primary key (zone_id, annee)
);

-- Synthèse 2020-2026 utilisée par la carte
create table syntheses (
  zone_id            text primary key references zones(id),
  habitants_jours_an real,
  priorite           text check (priorite in ('forte','moyenne','faible','nulle')),
  rang               integer,
  classe_eau         text,
  confiance          text check (confiance in ('elevee','moyenne','faible')),
  batiments_touches  integer,
  ecoles_touchees    integer,
  routes_km          real,
  maj                timestamptz default now()
);

-- Épisodes de pluie et eau détectée
create table evenements (
  id            serial primary key,
  date_pluie    date not null,
  pluie_mm      real,
  date_image    date,                      -- première image radar après la pluie
  eau_geojson   jsonb                      -- polygones simplifiés
);

create table impacts_evenement (
  evenement_id      integer references evenements(id),
  zone_id           text references zones(id),
  surface_eau_pct   real,
  habitants_touches integer,
  batiments_touches integer,
  ecoles_touchees   integer,
  primary key (evenement_id, zone_id)
);

-- Balises et mesures
create table balises (
  id               text primary key,
  nom              text,
  geom             geometry(Point, 4326),
  hauteur_capteur_cm real not null,        -- distance capteur - fond à vide
  seuil_alerte_cm  real,
  cle_api_hash     text not null
);

create table mesures (
  id          bigserial primary key,
  balise_id   text references balises(id),
  ts          timestamptz not null default now(),
  distance_cm real not null,
  niveau_cm   real,                        -- rempli par trigger : hauteur_capteur_cm - distance_cm
  batterie_v  real,
  rssi        smallint
);
create index on mesures (balise_id, ts desc);
```

Note : pour `niveau_cm`, utiliser un trigger qui lit `hauteur_capteur_cm` dans `balises` (une colonne générée ne peut pas lire une autre table).

### Sécurité des données (Row Level Security)

- Toutes les tables sont en lecture seule pour le public (clé anonyme Supabase).
- Écriture des indicateurs : uniquement avec la clé de service, depuis le pipeline.
- Écriture des mesures : uniquement via l'Edge Function, qui vérifie la clé de la balise.

### API utilisée par l'application

| Besoin | Appel |
| --- | --- |
| Carte des zones (GeoJSON) | `rpc/zones_geojson` : fonction SQL qui renvoie zones + synthèse, géométries simplifiées |
| Top 10 | `GET /syntheses?order=rang.asc&limit=10&select=*,zones(nom,commune)` |
| Fiche d'une zone | `GET /zones?id=eq.{id}&select=*,syntheses(*),indicateurs_saison(*)` |
| Liste des événements | `GET /evenements?select=id,date_pluie,pluie_mm,date_image&order=date_pluie.desc` |
| Impacts d'un événement | `GET /impacts_evenement?evenement_id=eq.{id}&order=habitants_touches.desc` |
| Dernières mesures d'une balise | `GET /mesures?balise_id=eq.{id}&order=ts.desc&limit=500` |
| Mesures en direct | Abonnement Supabase Realtime sur `mesures`, filtre `balise_id=eq.{id}` |
| Envoi d'une mesure (balise) | `POST /functions/v1/mesure` (voir ci-dessous) |

### Contrat d'envoi d'une mesure

```http
POST /functions/v1/mesure
Authorization: Bearer <clé de la balise>
Content-Type: application/json

{ "balise_id": "bal-01", "distance_cm": 37.4, "batterie_v": 3.92, "rssi": -61 }
```

Réponses : `201` mesure enregistrée · `400` champ manquant ou valeur hors bornes (distance entre 20 et 600 cm) · `401` clé invalide · `429` plus d'une mesure par seconde.

## 6. Design : principes, identité, composants

### Six principes

1. **Lisible par un maire.** Chaque chiffre est accompagné d'une phrase en français courant. Aucun terme technique (dB, rétrodiffusion, H3) dans l'interface, sauf sur la page Méthode.
2. **Le téléphone d'abord.** On conçoit l'écran de 375 px de large, sur réseau 3G, puis on l'élargit. Cibles tactiles de 44 px minimum.
3. **La carte est l'écran.** Elle occupe toute la surface ; tout le reste s'ouvre dans un panneau par-dessus, sans quitter la carte.
4. **La couleur n'est jamais seule.** Chaque niveau de priorité a aussi une étiquette écrite et une forme de badge ; la confiance a aussi des hachures. Un daltonien doit tout comprendre.
5. **Honnête sur la donnée.** La date de l'image et le niveau de confiance sont visibles partout où un chiffre apparaît.
6. **Sobre et institutionnel.** Le public, ce sont des services de l'État et des mairies : un outil sérieux, qui inspire confiance. Le verre dépoli est réservé aux éléments posés sur la carte ; les animations décrivent un changement d'état et restent courtes ; pas de dégradé décoratif.

### Identité

- **Nom** : MbënnScan, toujours écrit avec le tréma et la majuscule au S.
- **Logo** : logotype en Inter Semibold, « Mbënn » en encre, « Scan » en bleu primaire. Pictogramme : un hexagone (rappel des mailles de calcul) contenant une vague d'eau. Version monochrome pour les petites tailles et le favicon.
- **Ton** : vouvoiement, phrases courtes, verbes d'action. Exemples :
  - « L'eau est restée en moyenne 14 jours après les fortes pluies. »
  - « Priorité forte : cette zone fait partie du tiers le plus touché. »
  - « Mesure moins fiable : bâti très dense. À vérifier sur le terrain. »
  - « Image radar du 6 octobre 2026, deux jours après la pluie. »

### Couleurs

| Rôle | Jeton | Valeur | Usage |
| --- | --- | --- | --- |
| Encre | `--ink` | `#101828` | Texte principal |
| Encre secondaire | `--ink-2` | `#475467` | Textes d'appoint, légendes |
| Fond | `--bg` | `#F7F8FA` | Arrière-plan des pages |
| Surface | `--surface` | `#FFFFFF` | Panneaux, cartes d'information |
| Bordure | `--line` | `#E4E7EC` | Séparateurs, contours |
| Primaire | `--primary` | `#0E5A8A` | Boutons, liens, zone sélectionnée |
| Primaire survol | `--primary-strong` | `#0A4670` | Survol, état actif |
| Eau détectée | `--water` | `#2E90FA`, opacité 55 % | Couche de l'eau sur la carte |
| Contour de l'eau | `--water-line` | `#175CD3` | Bord des polygones d'eau |
| Priorité forte | `--prio-high` | `#D92D20` | Zones, badge « Priorité forte » |
| Priorité moyenne | `--prio-mid` | `#F79009` | Zones, badge « Priorité moyenne » |
| Priorité faible | `--prio-low` | `#3BA55C` | Zones, badge « Priorité faible » |
| Sans eau observée | `--prio-none` | `#D0D5DD` | Zones sans eau détectée |
| Balise en ligne | `--ok` | `#12B76A` | Pastille d'état |
| Balise hors ligne | `--off` | `#98A2B3` | Pastille d'état |

**Règles** : les couleurs de priorité ne servent qu'à la priorité ; le bleu de l'eau ne sert qu'à l'eau. Le texte posé sur une couleur de priorité est toujours en encre ou en blanc avec un contraste d'au moins 4,5:1. Mode clair uniquement pour le prototype : il se lit mieux en plein soleil.

> Mise à jour du 22 octobre (refonte, `docs/DECISIONS.md`) : thème **sombre par défaut**, clair au choix ; la balise affiche son état en toutes lettres (« En ligne », « Muette ») au lieu d'une pastille ; priorité en ronds de couleur toujours suivis de leur libellé. Les jetons à jour sont dans `web/DESIGN-SYSTEM.md`.

### Typographie

Police unique : Inter (Google Fonts), qui gère le tréma et les accents. Chiffres tabulaires (`font-variant-numeric: tabular-nums`) partout où des nombres sont comparés.

| Style | Taille / interligne | Graisse | Usage |
| --- | --- | --- | --- |
| Chiffre clé | 32 / 40 | 600 | Valeur principale d'une fiche |
| Titre 1 | 24 / 32 | 600 | Nom de la zone, titre de page |
| Titre 2 | 20 / 28 | 600 | Sections d'une fiche |
| Titre 3 | 16 / 24 | 600 | Intitulés de cartes d'information |
| Texte | 16 / 24 | 400 | Corps (jamais moins de 16 sur mobile) |
| Petit | 14 / 20 | 400 | Légendes, dates d'image |
| Mention | 12 / 16 | 500 | Sources, attribution de la carte |

### Espacements et formes

- Grille de 4 px ; espacements usuels 8, 12, 16, 24, 32.
- Rayons : 8 px (boutons, badges), 12 px (panneaux), 999 px (pastilles).
- Une seule ombre, réservée aux éléments flottant au-dessus de la carte : `0 4px 16px rgba(16,24,40,.12)`.
- Points de rupture : mobile jusqu'à 639 px, tablette 640 à 1023 px, ordinateur 1024 px et plus.
- Icônes : Lucide, 20 px, trait de 1,75.

### Style de la carte

- Fond vectoriel clair et désaturé (type Positron), pour que les couleurs de priorité ressortent.
- Zones : remplissage à 60 % d'opacité, contour blanc de 1 px ; au survol, contour encre ; zone sélectionnée, contour primaire de 3 px.
- Confiance faible : hachures diagonales sur la zone et contour en pointillés. Confiance moyenne : hachures légères.
- Couche de l'eau au-dessus des zones, activable par un bouton.
- Vue de départ : département de Keur Massar, niveau de zoom 12.
- Attribution toujours visible en bas à droite : © OpenStreetMap, Copernicus, WorldPop.

### Bibliothèque de composants

| Composant | Description |
| --- | --- |
| Badge de priorité | Pastille arrondie : point de couleur + texte « Priorité forte / moyenne / faible » ou « Pas d'étendue d'eau visible par satellite » |
| Indicateur de confiance | Trois points remplis selon le niveau + mot « Élevée / Moyenne / Faible » ; une infobulle explique pourquoi |
| Carte de chiffre clé | Valeur en grand, intitulé, phrase d'explication, icône « i » qui ouvre une infobulle |
| Sélecteur de mode | Contrôle segmenté en haut : « Avant la saison » · « Après une pluie » · « Balise » |
| Panneau (ordinateur) | Colonne de 400 px à droite de la carte, défilante, fermable |
| Feuille du bas (mobile) | Trois hauteurs : aperçu de 140 px, moitié d'écran, plein écran ; poignée de glissement |
| Légende | En bas à gauche sur ordinateur ; repliée en pastille « Légende » sur mobile |
| Histogramme des hivernages | Barres 2020 à 2026, valeur écrite au-dessus de chaque barre, année manquante hachurée avec la mention « données insuffisantes » |
| Comparateur avant / après | Curseur vertical à glisser sur la carte, étiquettes « 2020-2022 » et « 2024-2026 » |
| Jauge de balise | Réservoir vertical qui se remplit, niveau en cm en grand, ligne de seuil d'alerte, « mis à jour il y a 4 s » |
| Bandeau de fraîcheur | « Image radar Sentinel-1 du 6 octobre 2026 » sous chaque vue qui en dépend |
| Barre de recherche | Recherche par nom de lieu, suggestions dès 2 lettres |

### États à prévoir pour chaque écran

- **Chargement** : squelettes gris aux formes du contenu, jamais un écran blanc.
- **Vide** : « Aucune eau détectée dans cette zone sur cette image. » plutôt qu'un tableau vide.
- **Erreur réseau** : message + bouton « Réessayer » ; les données déjà chargées restent affichées.
- **Hors ligne** : bandeau « Vous êtes hors ligne : données du 17 octobre affichées. »
- **Balise muette depuis plus de 2 minutes** : pastille grise et texte « Dernière mesure il y a 5 min ».

## 7. Design : écrans et parcours

### Plan du site

| Écran | Adresse | Accès |
| --- | --- | --- |
| E1 · Carte « Avant la saison » | `/` | Écran d'accueil |
| E2 · Fiche zone | `/zone/[id]` | Clic sur une zone ou dans un classement ; lien partageable |
| E3 · « Après une pluie » | `/apres/[evenement]` | Sélecteur de mode |
| E4 · Avant / après ouvrages | `/avant-apres` | Lien depuis la fiche de Keur Massar Sud et menu |
| E5 · Balise | `/balise/[id]` | Sélecteur de mode |
| E6 · Méthode et limites | `/methode` | Lien « Méthode » de la barre du haut, liens « i » des fiches |

### Barre du haut (tous les écrans)

Hauteur 56 px, fond blanc, bordure basse. À gauche le logo ; au centre le sélecteur de mode (sur mobile, il passe sous la barre, en pleine largeur) ; à droite la recherche (une loupe sur mobile) et le lien « Méthode ».

### E1 · Carte « Avant la saison »

**But** : voir en un coup d'œil où l'eau reste le plus, et chez combien de personnes.

- Carte plein écran, zones colorées par priorité, légende en bas à gauche.
- **Ordinateur** : panneau de droite « Zones à traiter en premier », sous-titre « Keur Massar · hivernages 2020-2026 ». Liste des 10 premières zones ; chaque ligne montre le rang, le nom, la commune, le badge de priorité, les habitants-jours par an et une icône du type d'eau. Filtres en pastilles par commune au-dessus de la liste.
- **Mobile** : feuille du bas en aperçu, « 10 zones à traiter en premier » et la première ligne ; on la remonte pour voir la liste.
- **Interactions** : survol d'une zone, infobulle avec nom et badge ; clic ou toucher, ouverture de la fiche (E2) et contour primaire sur la zone ; un clic dans la liste centre la carte sur la zone.

### E2 · Fiche zone

S'ouvre dans le panneau (ordinateur) ou la feuille du bas à mi-hauteur (mobile). Ordre de lecture, de haut en bas :

1. **En-tête** : nom de la zone (Titre 1), commune, badge de priorité, rang (« 3e sur 412 zones »), indicateur de confiance.
2. **Phrase de synthèse**, générée à partir des données : « Entre 2020 et 2026, l'eau est apparue dans 38 % des passages du satellite pendant l'hivernage, et elle est restée en moyenne 14 jours. Environ 2 300 habitants vivent dans les parties touchées. » *Les valeurs de cet exemple sont fictives.*
3. **Quatre chiffres clés** en grille 2 × 2 : habitants-jours par an, fréquence observée, durée moyenne de l'eau, type d'eau. Chaque carte a sa phrase d'explication.
4. **Histogramme des hivernages** 2020 à 2026 : habitants-jours par année, avec bascule vers la fréquence.
5. **Ce qui est touché** : bâtiments (nombre), écoles (noms), routes (km).
6. **Ce que ça suggère**, selon le type d'eau :
   - Ruissellement : « L'eau part en quelques jours : le drainage est la piste principale. »
   - Stagnation durable : « L'eau reste plus de 12 jours : une remontée de nappe est probable. Pomper seul risque d'être insuffisant ; une vérification avec la DGPRE est recommandée. »
   - Intermédiaire : « Situation mixte : à examiner sur le terrain. »
7. **Fiabilité** : nombre d'images valides, date du calcul, raison si la confiance est faible, lien vers la page Méthode.
8. **Actions** : « Partager » (copie le lien), « Imprimer la fiche » (mise en page dédiée, une page A4), « Voir après la pluie du 4 octobre ».

### E3 · « Après une pluie »

**But** : savoir où l'eau est encore présente, chez combien de personnes, juste après un épisode.

- Sélecteur d'épisode en haut du panneau : « 4 octobre 2026 · 111 mm à Keur Massar », etc.
- Bandeau de fraîcheur obligatoire : « Image radar du 6 octobre, 2 jours après la pluie. L'eau a pu baisser entre-temps. »
- Carte : polygones bleus de l'eau détectée ; les zones ne sont plus remplies, seulement contourées, pour que le bleu reste lisible.
- Bilan en trois chiffres : surface en eau (hectares), habitants dans l'eau (arrondi à la centaine), écoles touchées.
- Liste des zones triées par habitants touchés, titrée « À visiter en priorité ». Chaque ligne ouvre une fiche d'urgence courte : surface en eau, habitants, bâtiments, écoles, action suggérée (pomper, recenser, visiter).

### E4 · Avant / après ouvrages

- Carte plein écran avec curseur de comparaison vertical : à gauche la fréquence 2020-2022, à droite 2024-2026, sur Keur Massar Sud.
- Panneau : habitants-jours par an avant et après, la même chose rapportée aux millimètres de pluie, et un avertissement : « Les pluies n'ont pas été les mêmes d'une année à l'autre. Cette comparaison donne une tendance, pas une preuve. »

### E5 · Balise

Écran en cartes, sans grande carte géographique.

- Jauge du réservoir avec le niveau en grand (« 42 cm »), la ligne du seuil d'alerte, la pastille d'état et « mis à jour il y a 4 s ».
- Courbe du niveau sur la dernière heure, bascule vers 24 heures.
- Informations : nom de la balise, position sur une mini-carte, tension de batterie, qualité du signal.
- **Mode présentation** : bouton « Plein écran », qui affiche seulement la jauge et le chiffre en très grand, pour la démo devant le jury.
- Quand le niveau dépasse le seuil : la jauge passe en rouge et un texte « Seuil dépassé » apparaît (pas de son).

### E6 · Méthode et limites

Page de lecture en une colonne de 680 px maximum : les étapes du calcul en cinq blocs illustrés, l'indicateur expliqué avec un exemple, les limites (radar en ville, cadence, nappe), les sources et licences, l'équipe. C'est la seule page où les termes techniques sont permis, chacun expliqué.

### Parcours de démonstration (30 secondes)

1. **0-8 s** : E1, la carte de Keur Massar. « Voici où l'eau est restée le plus depuis 2020. »
2. **8-16 s** : clic sur la première zone du classement, E2. « Ici, l'eau reste 14 jours : ce n'est pas un problème de pompe, c'est probablement la nappe. »
3. **16-23 s** : bascule sur « Après une pluie », épisode du 4 octobre. « Deux jours après la pluie record, voici où l'eau était encore, et chez combien de personnes. »
4. **23-30 s** : mode Balise en plein écran ; un membre verse de l'eau dans le bac, le niveau monte. « Le satellite voit toute la banlieue ; la balise voit un bassin en continu. »

## 8. Balise au sol : matériel et firmware

**Objectif du prototype** : mesurer le niveau d'eau d'un bac et l'afficher en direct dans l'application. Ce n'est pas encore une balise de terrain : c'est la démonstration du principe.

### Matériel

| Élément | Référence suggérée | Remarque |
| --- | --- | --- |
| Microcontrôleur | ESP32 DevKit (ESP32-WROOM-32) | Wi-Fi intégré |
| Capteur de distance | JSN-SR04T (ultrasons, étanche) ou A02YYUW (sortie série, plus stable) | Zone aveugle d'environ 20 à 25 cm sous le capteur |
| Adaptation de tension | Pont diviseur sur la broche « echo » si le capteur sort du 5 V | L'ESP32 accepte 3,3 V maximum |
| Alimentation (démo) | Batterie USB externe | Simple et suffisante |
| Alimentation (terrain, plus tard) | Accumulateur 18650, module de charge TP4056, petit panneau solaire 6 V | Mesure de la tension par pont diviseur |
| Boîtier | Boîte IP65 avec presse-étoupes | Capteur fixé à la verticale, face à l'eau |
| Montage de démo | Bac ou seau d'au moins 50 cm de haut, support au-dessus | Le capteur doit rester au moins 25 cm au-dessus du niveau maximal |

### Comportement du firmware

1. Connexion au Wi-Fi ; en l'absence de réseau connu, ouverture d'un portail de configuration (bibliothèque WiFiManager).
2. Toutes les 5 secondes en démo (60 secondes sur le terrain) : 5 mesures successives, on garde la médiane pour éliminer les échos parasites.
3. Rejet des valeurs hors bornes (moins de 20 cm ou plus de 600 cm).
4. Envoi en HTTPS de `distance_cm`, `batterie_v` et `rssi` vers `/functions/v1/mesure`, avec la clé de la balise.
5. Si l'envoi échoue : jusqu'à 50 mesures gardées en mémoire, renvoyées dès le retour du réseau, avec une attente croissante entre les essais.
6. LED d'état : clignotement lent quand tout va bien, rapide en cas d'erreur réseau.
7. Plus tard, sur le terrain : veille profonde entre deux mesures pour économiser la batterie.

Les identifiants Wi-Fi et la clé d'API sont dans un fichier `secrets.h` jamais versionné (modèle fourni : `secrets.example.h`). Pour le prototype, le certificat de Supabase est épinglé dans le code plutôt que de désactiver la vérification HTTPS.

### Étalonnage

- Mesurer à vide la distance capteur - fond du bac : c'est `hauteur_capteur_cm`, enregistrée dans la table `balises`.
- Niveau d'eau = `hauteur_capteur_cm` - distance mesurée.
- Vérifier avec une règle à trois niveaux d'eau : écart toléré de 1 cm.

### Critères d'acceptation

- Le niveau affiché dans l'application change moins de 10 secondes après une variation réelle.
- Écart avec la règle inférieur ou égal à 1 cm sur trois niveaux.
- 30 minutes de fonctionnement continu sans redémarrage.
- Une vidéo de secours de 30 secondes est enregistrée, au cas où le réseau ferait défaut pendant la présentation.

### Évolutions après le hackathon

Passage à une liaison LoRa vers une passerelle, pour les bassins sans Wi-Fi ; à terme, relais des mesures par un satellite de collecte de données, dans l'esprit de la filière GAINDESAT.

## 9. Exigences non fonctionnelles

### Performance

- Première carte affichée en moins de 3 secondes en 4G, moins de 6 secondes en 3G.
- JavaScript initial inférieur à 250 Ko compressé ; la bibliothèque de carte est chargée à part.
- Géométries des zones simplifiées, fichier inférieur à 1 Mo ; au-delà, passer en tuiles vectorielles (PMTiles).
- Score Lighthouse mobile : performance 80 ou plus, accessibilité 90 ou plus.

### Compatibilité

Chrome Android (deux dernières versions), Safari iOS 15 et plus, Chrome, Firefox et Edge sur ordinateur. Test obligatoire sur un téléphone Android d'entrée de gamme (2 Go de mémoire).

### Application installable et hors ligne

Manifeste et icônes pour l'installation sur l'écran d'accueil. Un service worker garde en cache l'interface et les dernières données consultées (stratégie « afficher le cache, puis mettre à jour »).

### Accessibilité (objectif WCAG 2.1 niveau AA)

- Contrastes d'au moins 4,5:1 pour le texte.
- La liste des zones est l'alternative accessible à la carte : tout ce que montre la carte se retrouve dans la liste.
- Navigation complète au clavier dans les listes, panneaux et sélecteurs ; focus toujours visible.
- Libellés pour les lecteurs d'écran sur les boutons à icône.
- Animations réduites si l'utilisateur l'a demandé dans son système.

### Langue et formats

Interface en français. Dates au format « 6 octobre 2026 ». Nombres au format français (espace pour les milliers, virgule décimale) via `Intl.NumberFormat('fr-FR')`. Habitants toujours arrondis (à la dizaine ou à la centaine) pour ne pas suggérer une précision fausse.

### Données personnelles

Aucune donnée personnelle n'est collectée ni affichée : tous les résultats sont agrégés par zone. Pas de cookies de suivi ; si une mesure d'audience est nécessaire, un outil sans cookies.

### Sécurité

- Clé anonyme Supabase en lecture seule, protégée par les règles RLS.
- Clé de service uniquement dans l'environnement du pipeline, jamais dans le code du front-end.
- Clé de chaque balise stockée hachée ; limitation à une mesure par seconde.
- Secrets dans des variables d'environnement (`.env.local`, jamais versionné) ; HTTPS partout.

### Licences et mentions obligatoires

| Donnée | Licence | Mention à afficher |
| --- | --- | --- |
| Sentinel-1 et 2, Copernicus DEM | Données Copernicus, libres | « Contient des données Copernicus Sentinel modifiées (2020-2026) » |
| OpenStreetMap | ODbL | « © les contributeurs d'OpenStreetMap » |
| WorldPop | CC BY 4.0 | « Population : WorldPop » |
| Google Open Buildings | CC BY 4.0 et ODbL | « Bâtiments : Google Open Buildings » |
| CHIRPS, GPM IMERG, JRC Global Surface Water | Libres, citation demandée | Citées sur la page Méthode |

Les mentions apparaissent dans l'attribution de la carte et sur la page Méthode.

### Qualité du code

- TypeScript en mode strict, ESLint et Prettier pour le web ; Ruff pour le Python.
- Tests du pipeline sur une petite zone aux valeurs connues.
- Un test de bout en bout (Playwright) du parcours de démonstration.
- Chaque calcul est reproductible grâce au fichier `run_meta.json`.

## 10. Organisation, planning et livrables

### Rôles

| Membre | Responsabilité principale | Livre |
| --- | --- | --- |
| Khalifa Babacar DIOUF | Pipeline satellite et indicateurs ; coordination | `pipeline/`, données dans Supabase, page Méthode |
| Serigne Abdoul Aziz NDIAYE | Application web, design, déploiement | `web/`, application en ligne |
| Seydina Aboubacry KANE | Balise, firmware, ingestion des mesures | `firmware/`, Edge Function, écran Balise avec Aziz |

La façon de travailler ensemble (intégration, relecture, points quotidiens) est décrite dans [`methode-de-travail.md`](methode-de-travail.md).

### Avant le hackathon (18-19 octobre)

- Créer les comptes : Google Earth Engine (usage non commercial), Supabase, Vercel, GitHub.
- Vérifier qu'une image Sentinel-1 exploitable existe sur Keur Massar juste après le 4 octobre 2026 ; sinon, retenir l'épisode d'août 2025.
- Réunir le matériel de la balise et tester une première mesure.
- Créer le dépôt avec la structure de la section 3 et le schéma SQL de la section 5.
- Adapter le plan dès réception de la note d'orientation et des données envoyées par SENSAT le 19 octobre.

### Planning des trois jours

| Jour | Khalifa (pipeline) | Aziz (web) | Aboubacry (balise) |
| --- | --- | --- | --- |
| 20 oct. | Zone d'étude, grille H3, liste des épisodes ; détection de l'eau pour le 4 octobre 2026 et août 2025 ; premier GeoJSON | Squelette Next.js, jetons de design, carte avec données factices ; mise en page E1 et E2 | Mesure + Wi-Fi + envoi ; table `mesures`, Edge Function |
| 21 oct. | Série 2020-2026, correction de cadence, persistance, habitants-jours, classement ; écriture dans Supabase | Branchement des vraies données ; E2 complet ; E3 | Temps réel et écran E5 avec Aziz ; étalonnage ; vidéo de secours |
| 22 oct. | Avant / après Keur Massar Sud, indice de confiance, validation ; texte de la page Méthode | E4, application installable, finitions, tests sur téléphone | Test de 30 minutes, montage de démo |

**Gel des fonctionnalités le 22 octobre à 16 h** : ensuite, uniquement corrections, répétition de la démo et préparation de la présentation. Envoi au plus tard le **22 octobre à 23 h 59** (date du formulaire, plus stricte que celle de l'appel).

### Livrables

1. Application en ligne (adresse Vercel) et code source sur GitHub.
2. Données calculées sur Keur Massar, au minimum, et fichier `run_meta.json`.
3. Balise fonctionnelle et vidéo de démonstration de 30 secondes.
4. Support de présentation pour le jury.
5. Ce cahier des charges, mis à jour avec ce qui a réellement été fait.

### Définition de « terminé »

Une fonctionnalité est terminée quand elle marche sur téléphone, avec les vraies données, avec ses états de chargement, d'erreur et de vide, et qu'un autre membre de l'équipe l'a essayée.

### Critères d'acceptation du prototype

- Le parcours de démonstration de la section 7 se déroule en 30 secondes sans accroc, sur téléphone comme sur ordinateur.
- Toutes les valeurs affichées viennent des données réelles ; les maquettes avec des valeurs fictives sont signalées comme telles.
- La date de l'image et le niveau de confiance sont visibles sur chaque fiche.
- Les mentions de licence sont présentes.

### Risques et parades

| Risque | Parade |
| --- | --- |
| Pas d'image radar exploitable après le 4 octobre | Épisode d'août 2025, même méthode |
| Earth Engine lent ou quota atteint | Zone d'étude réduite à Keur Massar ; exports préparés la veille |
| Limites de quartiers introuvables | Grille H3 nommée par le lieu le plus proche |
| Supabase indisponible | Plan B : fichiers GeoJSON statiques et petit serveur FastAPI |
| Balise en panne ou réseau coupé pendant la présentation | Vidéo de secours ; démo du reste de l'application en mode hors ligne |
| Population WorldPop ancienne | Mention sur la page Méthode ; recalage sur le RGPH-5 si possible |
| Manque de temps | Respect de l'ordre des priorités de la section 2 : les fonctionnalités « Indispensable » d'abord |
