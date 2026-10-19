# pipeline/ — traitement satellite (Khalifa)

Transforme l'archive Sentinel-1 (2020-2026) en indicateurs par zone, conformes aux contrats.

## Installation

```bash
cd pipeline
python -m venv .venv && source .venv/bin/activate
pip install earthengine-api geemap geopandas rasterio rasterstats h3 supabase python-dotenv jsonschema ruff
earthengine authenticate          # compte Google enregistré pour Earth Engine (non commercial)
cp .env.example .env              # remplir EE_PROJECT, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

Créer ensuite un `pyproject.toml` avec ces dépendances pour que tout le monde installe la même chose.

## Organisation proposée

```
pipeline/
  config.py        paramètres (seuils, résolution H3, périodes) → recopiés dans run_meta.json
  zones.py         grille H3 résolution 9 sur data/zone_etude.geojson, nommage par lieu OSM
  episodes.py      liste des pluies ≥ 30 mm (CHIRPS / GPM) + 4 octobre 2026
  eau.py           détection de l'eau Sentinel-1 (même orbite relative, Otsu borné, baisse ≥ 3 dB, masques)
  indicateurs.py   fréquence corrigée, persistance, habitants-jours, classement en tiers, confiance
  exposition.py    bâtiments (Open Buildings), écoles et routes (OSM)
  export.py        écrit pipeline/out/*.json puis Supabase
  out/             sorties (non versionnées)
```

## Ordre de travail

1. Vérifier les images disponibles autour du 4 octobre 2026 (sinon août 2025).
2. Détection de l'eau sur un épisode → `evenements.json` + `impacts_evenement_<id>.json`.
3. Série 2020-2026 → `indicateurs_saison`, puis `zones.json` et les fiches.
4. Avant d'écrire dans Supabase : `python scripts/validate_contracts.py --dir pipeline/out`.

Méthode détaillée : cahier des charges, section 4.
