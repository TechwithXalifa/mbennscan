# Guide du défi — Earth Observation Data Challenge (TRL Space × SENSAT)

> Document remis aux équipes par les organisateurs, reçu le 20 octobre 2026 et retranscrit ici pour référence. En cas d'écart avec [`appel-hackathon-sensat.pdf`](appel-hackathon-sensat.pdf) ou le cahier des charges, **ce guide fait foi pour le dossier et l'évaluation** (voir `DECISIONS.md`, 2026-10-21).

**Défi pratique en observation de la Terre au Sénégal.** Du jeudi 8 au lundi 26 octobre 2026. Organisation conjointe par TRL Space et le Programme spatial du Sénégal (SENSAT).

## Des données satellitaires aux décisions locales

Ce hackathon est un exercice pratique : partir d'un problème réel au Sénégal, regarder ce que les satellites permettent d'observer et proposer une manière utile d'exploiter ces informations. Les équipes préparent un concept de solution, accompagné de quelques exemples concrets réalisés avec des données réelles. Il ne faut pas construire un logiciel complet. Il faut montrer ce que la solution ferait, pour qui, avec quelles données et pourquoi les premiers résultats sont utiles.

Le défi s'inscrit dans le projet Agenda 2030 pour le Sénégal porté dans le cadre du ministère des Affaires étrangères de la République tchèque. Il contribue au partage de savoir-faire entre partenaires tchèques et sénégalais et au renforcement des compétences locales. Les sujets répondent aux priorités du projet et de la stratégie Sénégal 2050.

### Objectif du défi

Chaque équipe choisit une seule question, une petite zone au Sénégal et une période d'étude. Elle explique son idée et réalise une démonstration limitée : par exemple une carte, une comparaison entre deux dates ou un graphique. Le résultat attendu est un concept de solution préliminaire, parfois appelé « soft concept », illustré par des exemples concrets. Une idée générale sans essai sur des données ne suffit pas ; en revanche, aucune application prête à être déployée, plateforme complète ou méthode validée à grande échelle n'est demandée.

### Public et participation

Le défi s'adresse aux étudiants, chercheurs en début de carrière et jeunes professionnels en géomatique, agriculture, environnement, hydrologie, informatique ou planification. Le travail se fait en équipes ; des profils complémentaires sont encouragés. La programmation n'est pas obligatoire : un projet réalisé avec QGIS et des outils de visualisation peut satisfaire pleinement au défi.

### Contribution aux objectifs de développement durable

Les ODD sont les Objectifs de développement durable (SDGs en anglais), issus de l'Agenda 2030 des Nations Unies. Pour ce défi, ils servent à expliquer à quel besoin de développement l'idée répond : mieux produire, mieux gérer l'eau, protéger les populations ou préserver les milieux naturels. Choisir un ou deux objectifs pertinents et expliquer concrètement le lien avec le travail.

## Comprendre le résultat attendu

### Ce que signifie un concept de solution

Un concept décrit une idée assez précisément pour qu'une autre personne comprenne comment elle fonctionnerait. Imaginez qu'un service technique vous demande : « Comment vos cartes peuvent-elles nous aider ? » Le dossier doit répondre avec des mots simples, un cas local et un résultat visible. Le concept peut prendre la forme d'un service de suivi, d'une méthode de cartographie ou d'un petit tableau de bord esquissé sur une diapositive.

Décrire quatre éléments : **le problème rencontré ; la personne ou l'institution qui utiliserait le résultat ; les informations qu'on lui fournirait ; la décision qu'elle pourrait mieux préparer.** Ajouter une démonstration sur une petite zone et expliquer ce qu'il faudrait encore améliorer avant un usage réel.

- **Exemple pour l'agriculture.** Aider un conseiller agricole à repérer les secteurs à visiter en priorité : comparer la végétation à plusieurs dates avec Sentinel-2, montrer une carte et une courbe pour deux ou trois secteurs, proposer une règle simple pour orienter une visite. Pas besoin de prouver la cause d'une baisse ni de prédire la récolte.
- **Exemple pour les ressources en eau.** Suivre la variation d'un plan d'eau : deux dates, surfaces en eau, comparaison de leur étendue. Si l'on ne mesure que la surface, ne pas présenter le résultat comme un volume.
- **Exemple pour les inondations.** Aider un service à repérer des infrastructures potentiellement touchées par une inondation passée : comparer des observations avant et après l'événement, superposer routes ou bâtiments, montrer quelques secteurs à vérifier et les limites de la détection. **Une aide au repérage, ni une alerte en temps réel, ni une prévision des prochaines crues.**

### Un résultat accessible mais concret

On peut remettre une note, une carte et quelques diapositives, sans développer d'application. **Si l'on dessine un écran de tableau de bord, indiquer quels éléments sont une maquette et lesquels viennent de données réellement analysées. Ne pas inventer de résultats pour compléter une illustration.** Le jury doit pouvoir reconnaître l'idée, la démonstration et les questions encore ouvertes.

## Comprendre les objectifs de développement durable

Le développement durable consiste à répondre aux besoins actuels tout en préservant les ressources et les possibilités des générations futures. L'Agenda 2030, adopté en 2015, comprend 17 objectifs. Les ODD ne constituent pas une liste de fonctionnalités à ajouter au projet.

| Objectif | Lien possible avec le concept |
| --- | --- |
| ODD 2 Faim zéro | Repérer une baisse de végétation pour orienter des visites de conseil. |
| ODD 6 Eau propre et assainissement | Comparer l'étendue saisonnière d'un plan d'eau. |
| ODD 9 Industrie, innovation et infrastructure | Une procédure simple de traitement de données qu'un service peut reproduire. |
| ODD 11 Villes et communautés durables | Repérer des routes potentiellement exposées aux inondations. |
| ODD 13 Action climatique | Étudier une variation de pluie et de végétation sans attribuer automatiquement un événement au changement climatique. |
| ODD 15 Vie terrestre | Observer une évolution de couverture végétale ou d'une zone humide. |
| ODD 17 Partenariats | Concevoir une analyse réutilisable avec les retours d'un partenaire local. |

**Comment expliquer la contribution.** Un objectif principal et, si utile, un complémentaire. Une phrase précise, par exemple : « Notre concept contribue à l'ODD 6 en proposant au service concerné un suivi de la surface d'un plan d'eau, afin d'identifier les changements à vérifier. » Distinguer ce que l'exemple démontre déjà de l'impact espéré. Une carte seule ne prouve pas que l'objectif a été atteint. Référence : www.un.org/sustainabledevelopment/fr/objectifs-de-developpement-durable/

## Calendrier et fonctionnement

Horaires à l'heure de Dakar (UTC).

| Date | Étape | Résultat attendu |
| --- | --- | --- |
| Jeudi 8 octobre | Lancement et initiation | Présentation du défi, formation des équipes, démonstration des outils, choix initial du sujet. |
| 9 au 15 octobre | Cadrage et collecte des données | Question, utilisateur visé, zone, période, premier inventaire des données. |
| 16 octobre | Premier point d'étape et mentorat | Validation du périmètre, vérification des accès, discussion de la méthode. |
| 17 au 21 octobre | Analyse et prototype | Prétraitement, cartes ou indicateurs, premiers contrôles des résultats. |
| **22 octobre** | **Deuxième point d'étape et mentorat** | **Présentation des premiers résultats, des difficultés et du plan de finalisation.** |
| **23 octobre** | **Remise finale de toutes les équipes** | **Dossier complet et support de présentation avant l'heure limite annoncée.** |
| 24 octobre | Évaluation et sélection par le jury | Évaluation des dossiers, classement, sélection des meilleures équipes. |
| 25 octobre | Notification et préparation | Annonce de la sélection ; préparation des présentations des équipes retenues. |
| 26 octobre | Remise des prix et présentation des meilleurs travaux | Présentations des équipes sélectionnées, palmarès, remise des prix. Évaluation réalisée au préalable. |

**Accompagnement.** TRL Space et SENSAT coordonnent le défi, le cadrage des sujets et l'accompagnement technique. Les points d'étape permettent de résoudre les blocages et de vérifier la faisabilité des analyses.

**Règles de travail.** Chaque équipe remet un projet et **identifie les contributions de ses membres**. Les échanges pendant le mentorat sont autorisés. **Les codes, tutoriels, bibliothèques et outils d'intelligence artificielle utilisés doivent être déclarés ; l'équipe reste responsable de la vérification de ses résultats et doit pouvoir expliquer sa méthode.** Les données, cartes et textes externes doivent être cités et leurs licences respectées. Aucun achat de données ou abonnement payant n'est requis. Aucun jeu de données propriétaire, relevé de terrain ou accès commercial n'est garanti par les organisateurs.

## Concevoir une solution utile aux partenaires

Institutions et structures ayant confirmé leur participation : DAPSA, ANCAR, CNAAS, CSE, SAED, DCSOM, SGNS, **DPGI**, DPN, ANSD, Département de géologie, UFR SI de l'UIDT, ISRA/CRODT, ASPG et OLAC. Leur présence ne signifie pas qu'une mission, un jeu de données ou un accompagnement individuel est attribué à chaque équipe.

**Partir d'un besoin utilisateur** : commencer par « qui a besoin de quelle information ? », puis choisir les données. On peut identifier une institution participante comme utilisateur potentiel, **sans prétendre qu'elle a validé l'idée**. Préciser ce qu'il faudrait lui demander : territoire prioritaire, fréquence du suivi, décisions à préparer, données de référence disponibles. L'exemple doit pouvoir avancer avec les sources ouvertes du guide.

**Cinq questions pour cadrer l'idée** : quel problème revient régulièrement ? Sur quel territoire ? Quelle information manque aujourd'hui ? À quelle fréquence serait-elle utile ? Sous quelle forme serait-elle facile à utiliser (carte imprimée, tableau, graphique, couche SIG) ?

**Ce qu'une institution doit comprendre en deux minutes** : le problème et l'utilisateur, puis l'exemple le plus parlant, la décision qu'il éclaire, sa principale limite, et une prochaine étape réaliste. Le nom d'un outil ou d'un satellite n'est pas une explication suffisante.

## Sujets et résultats possibles

Zone d'étude assez petite pour produire un résultat vérifiable pendant le défi.

- **Agriculture durable** : dynamique de la végétation, calendriers culturaux (Sentinel-2, CHIRPS, ERA5). Un indice de végétation ne prouve ni maladie, ni rendement, ni stress hydrique.
- **Gestion des ressources en eau** : étendue saisonnière d'un plan d'eau, productivité hydrique (Sentinel-2, JRC Global Surface Water, WaPOR). Surface, niveau, volume et qualité ne sont pas interchangeables.
- **Inondations et exposition** : cartographier l'étendue probable d'une inondation passée à partir d'images Sentinel-1 avant et après l'événement, puis comparer les zones détectées aux routes, bâtiments ou équipements cartographiés. Une zone de la vallée du fleuve Sénégal ou **de la périphérie de Dakar** peut servir de cas d'étude. Présenter une carte, une estimation des surfaces et les limites de la détection radar. **Une carte d'eau observée n'est pas une prévision de crue ; l'exposition ne constitue pas à elle seule une évaluation complète du risque.**
- **Suivi environnemental** : changement de couverture végétale, zones humides, occupation des sols (WorldCover comme référence contextuelle).
- **Appui à la planification publique** : analyse territoriale combinant occupation des sols, eau et infrastructures ; appui exploratoire, sans valeur cadastrale ni validation réglementaire.

## Méthode et livrables attendus

**Démarche simple et reproductible :**

1. **Définir la question et la décision visée** : territoire, période, utilisateur, indicateur mesurable ; pourquoi l'observation de la Terre apporte une information utile.
2. **Choisir les données** : justifier capteurs, produits, dates, résolutions ; vérifier couverture, licence, disponibilité. **Prévoir une solution de repli si un compte, un quota ou la connexion bloque le traitement.**
3. **Préparer et analyser** : documenter masques, traitements radar, projections, seuils, agrégations. Comparer des périodes cohérentes ; ne pas présenter un rééchantillonnage comme un gain de résolution.
4. **Contrôler les résultats** : observations indépendantes si disponibles et autorisées ; **à défaut, comparer plusieurs dates ou sources et effectuer une analyse de sensibilité**. Une classe WorldCover ne remplace pas une validation de terrain.
5. **Interpréter** : séparer observations et hypothèses ; expliquer incertitudes, erreurs possibles et compléments nécessaires avant un usage opérationnel.

### Dossier final à remettre le 23 octobre

| Livrable | Contenu attendu |
| --- | --- |
| Note de concept en français | Environ 3 à 5 pages : problème, utilisateur, idée de solution, données, exemples réalisés, limites et prochaine étape. Expliquer comment la solution serait utilisée. |
| Résultats géospatiaux | Au moins un exemple obtenu avec des données réelles : carte, comparaison entre dates ou indicateur, avec dates et sources. Une seconde illustration si elle aide. Fournir les couches produites si pertinent ; un logiciel complet n'est pas demandé. |
| Éléments de reproduction | Les étapes pour refaire l'exemple : projet QGIS, scripts ou notebook, paramètres et liens des données. Une procédure claire sans code est acceptable. |
| Présentation en français | Support court remis avec le dossier. Pour les équipes sélectionnées uniquement : présentation le 26 octobre d'environ 7 minutes suivie de 5 minutes de questions (durées à confirmer). |
| Inventaire des sources | Liste des jeux de données, périodes, résolutions, licences, outils et contributions des membres. |

Les résultats remis restent la base de l'évaluation ; la préparation des supports ne doit pas modifier l'analyse soumise. Pour les données non redistribuables ou volumineuses, fournir les liens et instructions d'accès. Le canal de dépôt et le nommage seront communiqués par les organisateurs.

## Données ouvertes et outils

Pour chaque source, conserver la date de consultation, le nom exact du produit et sa documentation.

| Source | Usage et précautions |
| --- | --- |
| Copernicus Data Space (dataspace.copernicus.eu) | Sentinel-1 et Sentinel-2. Données ouvertes ; compte gratuit pour certains services ; quotas. |
| NASA Earthdata (earthdata.nasa.gov) | MODIS, produits hydrologiques. Earthdata Login requis pour de nombreux téléchargements. |
| ESA WorldCover | Occupation des sols à 10 m, 2020 et 2021, CC BY 4.0. Référence historique, pas une carte de 2026. |
| CHIRPS | Précipitations, domaine public. Préciser version et résolution ; contexte régional, pas une mesure à la parcelle. |
| ERA5 / ERA5-Land | Réanalyses climatiques, compte requis. Données modélisées, résolution grossière. |
| JRC Global Surface Water | Occurrence et dynamique des eaux de surface. Vérifier version et période. |
| FAO WaPOR | Évapotranspiration, biomasse, productivité de l'eau. Couverture variable. |
| OpenStreetMap | Routes, bâtiments, objets. ODbL avec attribution ; complétude variable. |

| Outil | Accès |
| --- | --- |
| QGIS | Libre et gratuit ; solution de base recommandée sans code. |
| ESA SNAP | Libre, traitement Sentinel dont radar ; prévoir mémoire et stockage. |
| Copernicus Browser / Sentinel Hub dans CDSE | Exploration et traitement avec compte et quotas gratuits. Point d'entrée recommandé plutôt qu'EO Browser. |
| **Google Earth Engine** | Traitement en ligne si le projet est vérifié non commercial ; compte et projet Google Cloud requis ; quotas gratuits selon le niveau. **Son approbation n'est pas garantie.** |
| Python et R | rasterio, geopandas, xarray, scikit-learn, terra, sf. |
| Google Earth / Earth Pro | Contexte visuel ; images non redistribuables librement. |

## Critères proposés au jury

| Critère | Poids |
| --- | --- |
| Pertinence pour un besoin sénégalais et utilité pour la décision | 25 % |
| Qualité de la méthode et adéquation des données | 25 % |
| Qualité des résultats et contrôle des incertitudes | 20 % |
| Reproductibilité et documentation | 15 % |
| Clarté de la présentation et faisabilité de la suite | 15 % |

Une méthode simple, vérifiable et utile peut obtenir un meilleur résultat qu'un prototype complexe insuffisamment expliqué.

**Prix** : 1er 300 000 FCFA, 2e 200 000 FCFA, 3e 150 000 FCFA, prix d'encouragement 100 000 FCFA.
