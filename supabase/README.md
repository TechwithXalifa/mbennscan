# supabase/

Base de données PostgreSQL + PostGIS, API REST automatique, temps réel pour la balise.

## Installer le schéma

1. Créer un projet sur supabase.com (région la plus proche : Europe).
2. *SQL Editor* → coller `schema.sql` → *Run*. Le script peut être relancé sans erreur.
3. Récupérer dans *Project Settings → API* : l'URL, la clé `anon` (pour `web/.env.local`) et la clé `service_role` (pour `pipeline/.env` uniquement).

Le schéma a été testé sur PostgreSQL 16 + PostGIS 3 avec les mocks : `zones_geojson()` renvoie un résultat conforme à `contracts/schemas/zones.schema.json`, le trigger calcule `niveau_cm`, le rôle `anon` lit tout sauf la clé des balises et ne peut rien écrire.

## Ce qui est exposé

| Lecture côté web | Contrat |
| --- | --- |
| `rpc/zones_geojson` | `zones.schema.json` |
| `zones`, `syntheses`, `indicateurs_saison` | `zone_detail.schema.json` (assemblé côté web) |
| `evenements`, `impacts_evenement` | `evenements.schema.json`, `impacts_evenement.schema.json` |
| `balises_publiques` (vue sans la clé) | `balises.schema.json` |
| `mesures` + Realtime | `mesures.schema.json` |

## À faire

- [x] Edge Function `functions/mesure/index.ts` (Aboubacry) : vérifier `Authorization: Bearer <clé>` contre `balises.cle_api_hash` (SHA-256), valider le corps avec `mesure_entrante.schema.json`, insérer avec la clé `service_role`, limiter à une mesure par seconde. Réponses 201 / 400 / 401 / 429.
- [ ] Script d'enregistrement d'une balise (génère la clé, stocke son hachage).
