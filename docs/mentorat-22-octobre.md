# Point de mentorat du 22 octobre — équipe fflush, MbënnScan

## 1. Le problème et l'utilisateur

Dans la banlieue de Dakar (Keur Massar, Pikine, Guédiawaye), l'eau des fortes pluies reste parfois des semaines. Les services (DPGI, ONAS, sapeurs-pompiers, mairies) doivent choisir où intervenir avant la saison et juste après une pluie. Il leur manque une vue d'ensemble, datée et répétable, de **où l'eau stagne et combien de temps**.

**Notre idée** : MbënnScan repère par satellite les étendues d'eau qui persistent après les pluies (débordement des lacs, cuvettes inondées), mesure combien de temps elles restent et combien d'habitants vivent à leur contact. L'eau dans les rues et les cours est trop étroite pour les images à 10 m : une balise au sol et les relevés des services pourraient compléter.

## 2. Ce qu'on a fait

- **Données** : Sentinel-1 (radar, voit à travers les nuages), Sentinel-2 (contrôle optique), GPM IMERG et CHIRPS (pluie), JRC Global Surface Water, Copernicus DEM, OpenStreetMap. Traitement dans Google Earth Engine, code Python versionné.
- **Méthode** : un pixel de 10 m est « eau nouvelle » s'il est sombre au radar (seuil d'Otsu borné), s'il a baissé d'au moins 3 dB par rapport à la saison sèche (même orbite), s'il n'était pas déjà de l'eau en saison sèche, et s'il appartient à une tache d'au moins 0,1 ha.
- **Épisode étudié** : pluies du 3 au 8 octobre 2026 (227 mm selon GPM, données provisoires) ; images du 6, 12 et 18 octobre. Comparaison avec 2020, année de grandes inondations.

## 3. Résultats

| | Eau nouvelle (Keur Massar) | Ce qu'on en tire |
| --- | --- | --- |
| Octobre 2020 | 0,9 à 1 km² | Débordement des lacs de Mbeubeuss et de Malika, confirmé par Sentinel-2 ; stable quel que soit le réglage (0,87 à 1,02 km²) |
| Octobre 2026 | 0,11 / 0,14 / 0,13 km² (6, 12, 18 oct.) | Peu d'eau à découvert, surtout au bord des lacs |
| Validation | 1 lieu sur 8 | 15 lieux signalés inondés, 8 localisés dans OSM (7 introuvables) : seuls les abords de Mbeubeuss montrent de l'eau |

Cartes : `docs/resultats/` (séquence d'octobre 2026, carte de validation 2020, contrôle optique 2020).

## 4. Limites et difficultés

- **À 10 m, le satellite ne voit pas l'eau dans les rues et les cours**, ni au radar ni en optique. Il voit les étendues d'eau.
- **Les dates des inondations signalées ne sont pas connues** : un « non » peut venir d'une eau déjà repartie le jour de l'image.
- **Angle mort** : une mare en eau toute l'année entre dans la référence sèche et n'est pas comptée (cas près d'Unité 17, 2019-2021).
- **Pluie d'octobre 2026 provisoire** (GPM) ; CHIRPS s'arrête au 30 septembre.
- **Habitants au contact de l'eau** : méthode prête (WorldPop, Open Buildings), calcul à finaliser.
- L'application et la balise fonctionnent sur des données marquées `[FICTIF]` ; elles illustrent le concept.

## 5. Questions pour les mentors

1. Avez-vous connaissance de **lieux et de dates d'inondation documentés** (DPGI, presse) à Keur Massar, pour une validation datée ?
2. Pour la stagnation qui dure toute l'année : une **référence fixe antérieure à 2020** vous paraît-elle la bonne correction ?
3. Le message « étendues d'eau, pas les rues » vous paraît-il **utile pour un service comme la DPGI**, ou faut-il le présenter autrement ?
4. Une **donnée radar à plus haute résolution** (programmes de données ouvertes Capella, Umbra) est-elle envisageable dans le cadre du défi ?

## 6. Plan jusqu'au 23 octobre

- Note de concept (3 à 5 pages), cartes et tableaux finaux, éléments de reproduction, inventaire des sources (avec les outils d'IA utilisés et les contributions de chacun), support de présentation.
- Gel des fonctionnalités le 22 à 16 h ; ensuite, uniquement relecture et mise en forme.
