# Résultats réels (dossier du 23 octobre)

Tous ces fichiers sortent d'Earth Engine (projet `sensat-hackathon`) avec les paramètres de `pipeline/config.py`, plus une taille minimale des taches d'eau de 0,1 ha (10 pixels de 10 m). Calculs du 21 et du 22 octobre 2026. Contient des données Copernicus Sentinel modifiées ; lieux © contributeurs OpenStreetMap (ODbL).

| Fichier | Contenu | Refaire |
| --- | --- | --- |
| `sequence_octobre_2026.jpg` | Eau nouvelle le 6, le 12 et le 18 octobre 2026 (pluies du 3 au 8 octobre), fond Sentinel-2 du 13 | `python -m pipeline.resultats` |
| `series_et_sensibilite.md` | Eau nouvelle par hivernage 2020-2026 et analyse de sensibilité (seuil, baisse, taille minimale) | `python -m pipeline.resultats` |
| `carte_validation_2020.jpg`, `carte_validation_2026.jpg` | Lieux signalés inondés et eau détectée (6 oct. 2020, 12 oct. 2026) | `python -m pipeline.validation` |
| `validation_lieux.md`, `validation_lieux.csv` | Pour chaque lieu : localisation OSM, type, eau nouvelle et eau présente dans 200 m à quatre dates | `python -m pipeline.validation` |
| `controle_optique_2020.jpg` | Sentinel-2 du 4 oct. 2020 et eau radar du 6 : le radar recouvre bien les lacs en crue | voir #12 |
| `taille_min_avant.jpg`, `taille_min_apres.jpg` | Effet de la taille minimale de 0,1 ha (6 oct. 2020, abords des lacs) | voir #12 |

## Ce qu'il faut retenir

- **Le satellite voit les étendues d'eau** : en 2020, le débordement des lacs de Mbeubeuss et de Malika atteint environ 0,9 à 1 km² d'eau nouvelle, et ce résultat tient quel que soit le réglage (0,87 à 1,02 km²).
- **Il ne voit pas l'eau dans les quartiers** à 10 m : sur 9 lieux signalés inondés et localisés dans OpenStreetMap, seuls les abords de Mbeubeuss montrent de l'eau. Réserve : les dates exactes des inondations signalées ne sont pas connues.
- **Octobre 2026** : peu d'eau nouvelle (0,11 à 0,14 km²), surtout au bord des lacs.
- **Angle mort de la méthode** : une mare qui reste en eau toute l'année (près d'Unité 17, 2019 à 2021) est rangée dans la référence sèche et n'est pas comptée. À corriger avec une référence fixe antérieure aux inondations.
- La baisse de l'eau nouvelle entre 2020 et 2026 ne peut pas être attribuée aux ouvrages : la pluie varie d'une année à l'autre et les lacs ont grossi entre 2021 et 2025.
