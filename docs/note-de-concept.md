# MbënnScan — Note de concept

**Équipe fflush** · Khalifa Babacar DIOUF, Serigne Abdoul Aziz NDIAYE, Seydina Aboubacry KANE
Earth Observation Data Challenge, TRL Space × SENSAT, octobre 2026

> Premier jet du 22 octobre, à relire par l'équipe. Tous les chiffres viennent de `docs/resultats/`.

## 1. Le problème

Dans la banlieue de Dakar, et en particulier dans le département de Keur Massar, les fortes pluies de l'hivernage laissent de l'eau qui stagne parfois des semaines. Les lacs et les zones basses débordent sur les quartiers voisins ; des familles vivent au contact d'une eau qui ne s'évacue pas. Le problème revient chaque année, mais aucune carte ne dit, de façon datée et comparable d'une année à l'autre, **où l'eau est restée, combien de temps et chez combien d'habitants**.

## 2. Pour qui, et pour quelle décision

**Utilisateurs visés** : la Direction de la prévention et de la gestion des inondations (DPGI), l'ONAS, les sapeurs-pompiers et les mairies. Nous les citons comme utilisateurs potentiels : aucune de ces institutions n'a validé le projet.

**Décisions à mieux préparer :**
- **avant la saison des pluies** : où concentrer les moyens (pompage, curage, ouvrages) ;
- **juste après une forte pluie** : quels secteurs visiter en priorité, et où l'eau risque de rester.

**À leur demander** : le territoire prioritaire, la fréquence de suivi utile (après chaque forte pluie ou une fois par saison), la forme souhaitée (carte imprimée, couche SIG, tableau), et leurs relevés de terrain pour valider.

## 3. L'idée de solution

MbënnScan repère par satellite les étendues d'eau qui persistent après les pluies (débordement des lacs, cuvettes inondées), mesure combien de temps elles restent et combien d'habitants vivent à leur contact. L'eau dans les rues et les cours est trop étroite pour les images à 10 m : une balise au sol et les relevés des services pourraient compléter.

**Comment un service l'utiliserait :**
1. **Après une forte pluie**, il ouvre la carte de l'épisode : étendues d'eau détectées sur la première image radar, date de l'image, secteurs touchés.
2. **Au fil des passages du satellite** (tous les 6 à 12 jours), il voit si l'eau se retire ou stagne : une eau qui reste plus de 12 jours signale une remontée probable de la nappe, où pomper seul risque d'être insuffisant.
3. **Avant la saison** (prévu), il consulte le classement des zones selon les habitants exposés de 2020 à 2026, et l'imprime pour les réunions.
4. **Là où le satellite ne voit pas**, une balise mesure en continu le niveau d'eau d'un bassin ou d'un point bas.

Nous avons esquissé ces écrans dans une application web, consultable sur téléphone et ordinateur : **https://mbennscan-seven.vercel.app** (carte, fiche de zone, écran « après une pluie », balise en direct). **Ces écrans sont une maquette** : ils fonctionnent aujourd'hui sur des données fictives, marquées `[FICTIF]`. Les résultats réels sont ceux de la section 5.

## 4. Les données

| Donnée | Usage | Résolution, période | Licence |
| --- | --- | --- | --- |
| Sentinel-1 GRD (radar, VV) | Détection de l'eau, de jour comme de nuit, malgré les nuages | 10 m, 2017-2026, orbite 133 | Copernicus, libre |
| Sentinel-2 (optique) | Contrôle visuel par temps clair | 10 m, 4 oct. 2020, 13 oct. 2026 | Copernicus, libre |
| GPM IMERG, CHIRPS | Dater les fortes pluies | ~10 km et ~5 km, journalier | NASA ; domaine public |
| JRC Global Surface Water | Exclure l'eau permanente | 30 m | libre, citation |
| Copernicus DEM GLO-30 | Exclure les pentes et la mer | 30 m | Copernicus, libre |
| ESA WorldCover | Distinguer le tissu bâti (validation) | 10 m, 2021 | CC BY 4.0 |
| OpenStreetMap | Localiser les lieux signalés inondés | — | ODbL |

Le traitement est fait dans Google Earth Engine (usage non commercial) avec un code Python ouvert et versionné.

## 5. Ce que nous avons réalisé

**Méthode.** Un pixel de 10 m est compté « eau nouvelle » s'il est sombre au radar (seuil d'Otsu calculé sur l'image, borné entre -22 et -14 dB), s'il a baissé d'au moins 3 dB par rapport à la médiane de la saison sèche (février à mai, même orbite), s'il n'était pas déjà de l'eau en saison sèche, hors eau permanente et pentes fortes, et s'il appartient à une tache d'au moins 0,1 ha (10 pixels qui se touchent).

**Exemple 1 : octobre 2020, une inondation connue.** Le 6 octobre 2020, le radar détecte environ 0,94 km² d'eau nouvelle sur Keur Massar, essentiellement le débordement des lacs de Mbeubeuss et de Malika sur les terrains voisins. L'image optique du 4 octobre, sans nuages, montre les mêmes étendues sombres. *Carte : `controle_optique_2020.jpg`.*

**Exemple 2 : l'épisode du 3 au 8 octobre 2026.** Les pluies (76 mm le 4, 81 mm le 7, 41 mm le 8 selon GPM, données provisoires) laissent peu d'eau à découvert : 0,11 km² le 6 octobre, 0,14 km² le 12 (4 jours après les dernières fortes pluies), 0,13 km² le 18 (10 jours après), surtout au bord des lacs. *Carte : `sequence_octobre_2026.jpg`.*

**Exemple 3 : sept hivernages comparés.** L'eau nouvelle maximale par saison passe de 0,95 km² en 2020 à 0,17 km² en 2026 (série dans `series_et_sensibilite.md`). Cette baisse ne peut pas être attribuée aux ouvrages : la pluie varie d'une année à l'autre et les lacs ont grossi entre 2021 et 2025.

## 6. Contrôle des résultats

- **Contrôle optique** : en 2020, l'eau radar recouvre bien les étendues d'eau visibles sur Sentinel-2.
- **Sensibilité** : en faisant varier le seuil (-16 à -20 dB), la baisse minimale (2 à 4 dB) et la taille minimale (0,05 à 0,2 ha), l'eau nouvelle de 2020 reste entre 0,87 et 1,02 km². Le résultat principal ne dépend pas des réglages.
- **Validation par des lieux signalés inondés** : 15 lieux cités ; 8 localisés dans OpenStreetMap (Jaxaay en deux secteurs), les 7 autres introuvables et non placés. L'eau est détectée aux abords de Mbeubeuss (22 ha en 2020), **mais pas dans les 7 lieux de quartier** (Parcelles Assainies, Jaxaay, Camille Basse, Darou Missette), à aucune des quatre dates testées. *Carte : `carte_validation_2020.jpg`.*

## 7. Limites

- **Le satellite à 10 m ne voit pas l'eau dans les rues et les cours.** Ni le radar ni l'optique ne la distinguent : un pixel mélange toit, mur et rue. MbënnScan mesure les étendues d'eau, pas l'inondation de chaque maison.
- **Les dates des inondations signalées ne sont pas connues** : un « pas d'eau » peut aussi venir d'une eau déjà repartie le jour de l'image.
- **Une eau qui reste toute l'année** entre dans la référence sèche et n'est pas comptée comme inondation (cas observé près d'Unité 17, 2019-2021).
- **La durée de l'eau** dépend du rythme des passages du satellite : elle est connue à 3 à 6 jours près.
- **« Stagnation durable » signale une remontée de nappe probable**, à confirmer avec les services hydrauliques.
- **Une carte d'eau observée n'est pas une prévision**, et l'exposition n'est pas une évaluation complète du risque.
- **Le nombre d'habitants au contact de l'eau** n'est pas encore calculé dans cette démonstration ; la méthode (population WorldPop, bâtiments Open Buildings) est prévue.

## 8. Prochaines étapes

1. **Corriger l'angle mort** avec une référence sèche fixe, antérieure aux grandes inondations.
2. **Calculer les habitants exposés** par zone et le classement 2020-2026.
3. **Valider avec des lieux et des dates documentés**, en lien avec la DPGI et les mairies.
4. **Aller vers l'eau dans les rues**, en combinant :
   - un radar à très haute résolution (0,5 à 3 m) programmé après une forte pluie ;
   - la perte de cohérence radar entre deux images ;
   - le signal renforcé de l'eau au pied des murs (« double rebond »), à tester ;
   - les relevés de terrain des services ;
   - un réseau de balises dans les points bas.

## 9. Contribution aux objectifs de développement durable

- **ODD 11, Villes et communautés durables (principal)** : MbënnScan propose aux services une carte datée des étendues d'eau qui persistent au contact des quartiers, afin de cibler les interventions. Notre exemple démontre cette carte sur Keur Massar ; l'impact sur la planification reste à construire avec les services.
- **ODD 13, Action climatique (complémentaire)** : le suivi des hivernages 2020-2026 aide à préparer l'adaptation aux pluies intenses, sans attribuer un épisode donné au changement climatique.

---

*Contient des données Copernicus Sentinel modifiées (2017-2026). Lieux © contributeurs OpenStreetMap (ODbL). Sources, outils (dont les outils d'intelligence artificielle utilisés) et contributions des membres : voir l'inventaire des sources.*
