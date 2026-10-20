# MbënnScan

**Mesurer par satellite où l'eau reste, et combien de temps, pour agir avant la pluie et juste après.**

Prototype de l'équipe **fflush** pour le hackathon national « Du satellite à la solution » (SENSAT-TRL), octobre 2026. Zone pilote : département de Keur Massar, puis Pikine et Guédiawaye (région de Dakar).

## Ce que fait l'application

- **Avant la saison** : une carte des zones classées par priorité selon les « habitants-jours sous l'eau » observés par le radar Sentinel-1 de 2020 à 2026, et une fiche par zone (fréquence, durée de l'eau, ruissellement ou nappe probable, bâtiments et écoles touchés).
- **Après une pluie** : où l'eau est encore présente et chez combien d'habitants.
- **Balise** : le niveau d'un bassin mesuré en continu par un capteur à ultrasons sur ESP32.

## Démarrer

| Je travaille sur | Lire |
| --- | --- |
| tout le projet | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| les formats de données | [`contracts/README.md`](contracts/README.md) |
| le traitement satellite | [`pipeline/README.md`](pipeline/README.md) |
| l'application | [`web/README.md`](web/README.md) |
| la base de données | [`supabase/README.md`](supabase/README.md) |
| la balise | [`firmware/README.md`](firmware/README.md) |

```bash
pip install jsonschema
python scripts/validate_contracts.py
```

## Équipe

- Khalifa Babacar DIOUF — référent, pipeline satellite et indicateurs
- Serigne Abdoul Aziz NDIAYE — application web et design
- Seydina Aboubacry KANE — balise et ingestion des mesures

## Données et licences

Contient des données Copernicus Sentinel modifiées (2020-2026). © les contributeurs d'OpenStreetMap (ODbL). Population : WorldPop (CC BY 4.0). Bâtiments : Google Open Buildings (CC BY 4.0 / ODbL). Pluie : CHIRPS, GPM IMERG. Eau permanente : JRC Global Surface Water.
