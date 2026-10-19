# Contrats de données

Les contrats sont **la frontière entre le pipeline, la base, la balise et l'application**. Chacun peut avancer de son côté tant qu'il respecte ces formats.

## Qui produit, qui consomme

| Contrat | Produit par | Lu par | Écran |
| --- | --- | --- | --- |
| `zones.schema.json` | pipeline → Supabase (`rpc/zones_geojson`) | web | E1 carte, top 10 |
| `zone_detail.schema.json` | Supabase (zones + syntheses + indicateurs_saison) | web | E2 fiche zone |
| `evenements.schema.json` | pipeline → Supabase | web | E3 après une pluie |
| `impacts_evenement.schema.json` | pipeline → Supabase | web | E3 liste et fiches d'urgence |
| `balises.schema.json` | saisie manuelle → Supabase | web | E5 balise |
| `mesure_entrante.schema.json` | firmware de la balise | Edge Function `mesure` | — |
| `mesures.schema.json` | Edge Function → Supabase | web (REST + Realtime) | E5 balise |
| `run_meta.schema.json` | pipeline | page Méthode, reproductibilité | E6 |

## Données factices (`mocks/`)

- Toutes les valeurs sont **inventées**. Les noms commencent par `[FICTIF]` pour qu'on ne les confonde jamais avec de vrais résultats, y compris pendant la démo.
- Elles couvrent volontairement des cas limites : une zone sans eau (`priorite: "nulle"`), une année sans image valide (2024 dans `zone_detail_mock-01.json`), un épisode sans image exploitable (id 2).
- L'application doit fonctionner entièrement sur ces mocks avec `NEXT_PUBLIC_USE_MOCKS=true`.

## Vérifier

```bash
pip install jsonschema
python scripts/validate_contracts.py                  # les mocks
python scripts/validate_contracts.py --dir pipeline/out  # une vraie sortie du pipeline
```

La CI lance la première commande sur chaque pull request.

## Changer un contrat

1. Ouvrir une issue « Contrat » qui explique le besoin.
2. Une seule pull request qui modifie **ensemble** : le schéma, les mocks, `supabase/schema.sql` si besoin, et le code des deux côtés (ou une issue de suivi pour l'autre côté).
3. Relecture et accord obligatoires de l'autre personne concernée (pipeline ↔ web, balise ↔ web).
4. Ajouter une ligne dans `docs/DECISIONS.md`.

Règles de nommage : champs en **français, snake_case, sans accents** (comme les colonnes SQL). Valeurs d'énumération en minuscules sans accents (`elevee`, `intermediaire`). Dates ISO 8601, coordonnées en WGS84 (EPSG:4326), ordre `[lon, lat]`.
