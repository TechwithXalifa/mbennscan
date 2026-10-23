# Design system MbënnScan

Source : cahier des charges, sections 6 et 7, étendu par la refonte du 22 octobre (`docs/DECISIONS.md`). Les jetons vivent dans `src/app/globals.css` (variables CSS, thème clair et thème sombre) et sont exposés par `tailwind.config.ts`. Ne jamais écrire une couleur, une taille ou une ombre en dur dans un composant. Catalogue vivant : `/design-system`.

## Direction : « flood intelligence »

Un outil d'aide à la décision, sobre et institutionnel, pas un tableau d'administration générique.

- **Bleu nuit** pour la structure (barre latérale, dans les deux thèmes), **bleu primaire** pour l'interaction et les données, **neutres froids** pour les surfaces.
- **La carte est l'écran** : la vue générale lui donne la plus grande place ; les indicateurs passent au-dessus sur ordinateur et dans la feuille du bas sur téléphone.
- **Profondeur par la teinte**, pas par des bordures épaisses : `bg` < `surface` < `surface-2` < `surface-3`, et trois niveaux d'élévation.
- **Une seule lumière** : le halo radial très léger des en-têtes (`halo-entete`). Pas de dégradé décoratif, pas de néon.

## Principes

1. Lisible par un maire : chaque chiffre a sa phrase en français courant.
2. Le téléphone d'abord : écran de 375 px, cibles tactiles de 44 px (`min-h-cible`) ; 36 px admis à la souris (`[@media(pointer:coarse)]:min-h-cible`).
3. La carte est l'écran : tout le reste s'ouvre par-dessus, sans perdre la carte.
4. La couleur n'est jamais seule : étiquette écrite, forme ou hachures en plus.
5. Honnête sur la donnée : date de l'image et confiance visibles à côté de chaque chiffre ; un chiffre absent est écrit « Non disponible », jamais remplacé par zéro.
6. Sobre et institutionnel : le verre est réservé à ce qui flotte au-dessus de la carte, les animations décrivent un changement d'état et restent courtes.

## Thèmes

Thème **clair par défaut** (lisible en plein soleil). Le thème sombre et « Système » se choisissent dans la barre latérale, le menu mobile ou l'en-tête ; le choix est gardé sur l'appareil (`mbennscan:theme`) et posé avant l'affichage par `SCRIPT_THEME` (`src/lib/theme.ts`), sans flash. `useTheme()` donne le thème affiché. L'impression utilise toujours le thème clair.

La carte suit le thème : fond Positron en clair, fond Dark d'OpenFreeMap recoloré en bleu nuit en sombre ; les couleurs des couches sont relues à chaque changement.

## Couleurs

Valeurs claires (les valeurs sombres sont dans `globals.css`). Contrastes mesurés sur la surface.

| Jeton                                     | Classe                        | Clair                                         | Usage                                                       |
| ----------------------------------------- | ----------------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| `--ink`                                   | `text-ink`                    | `#101828`                                     | Texte principal                                             |
| `--ink-2`                                 | `text-ink-2`                  | `#475467` (7,7:1)                             | Textes d'appoint                                            |
| `--ink-3`                                 | `text-ink-3`                  | `#5B6B80` (5,4:1)                             | Métadonnées, surtitres                                      |
| `--bg`                                    | `bg-bg`                       | `#F4F6F9`                                     | Fond des pages                                              |
| `--surface` · `-2` · `-3`                 | `bg-surface`…                 | `#FFFFFF` · `#F8FAFC` · `#EEF2F6`             | Panneaux · en-têtes de tableau, survol · pistes, squelettes |
| `--line`                                  | `border-line`                 | `#E4E7EC`                                     | Séparateurs                                                 |
| `--line-strong`                           | `border-line-strong`          | `#7D8A9E` (3,5:1)                             | Bord des champs et contrôles                                |
| `--inverse` / `--inverse-ink`             | `bg-inverse text-inverse-ink` | encre / blanc                                 | Infobulles, bandeau Maquette, hors ligne                    |
| `--primary` · `--primary-strong`          | `bg-primary`                  | `#0E5A8A` · `#0A4670`                         | Boutons, barres des graphiques                              |
| `--primary-ink`                           | `text-primary-ink`            | `#0E5A8A`                                     | Liens et libellés actifs (plus clair en sombre)             |
| `--primary-soft`                          | `bg-primary-soft`             | `#E8F1F8`                                     | Ligne choisie, icône des chiffres clés                      |
| `--focus`                                 | `outline`                     | `#0E5A8A`                                     | Anneau de focus                                             |
| `--nuit`…                                 | `bg-nuit text-nuit-ink`       | `#0B1A2B`                                     | Barre latérale (bleu nuit, deux thèmes)                     |
| `--accent`                                | `bg-accent`                   | `#2ED3B7`                                     | Repère de la page active, **uniquement** dans la navigation |
| `--water` · `--water-line`                | `bg-water`                    | `#2E90FA` à 55 % · `#175CD3`                  | Eau, sur la carte et dans la jauge uniquement               |
| `--prio-high` · `-mid` · `-low` · `-none` | `bg-prio-high`…               | `#D92D20` · `#F79009` · `#3BA55C` · `#D0D5DD` | Priorité uniquement                                         |
| `--ok` · `--off`                          | `bg-ok`                       | `#12B76A` · `#98A2B3`                         | Balise en ligne / muette                                    |
| `--danger` · `--danger-soft`              | `text-danger`                 | `#B42318` · `#FEF3F2`                         | Erreurs et seuil dépassé, jamais la priorité                |

Règles :

- Les couleurs de priorité ne servent qu'à la priorité, le bleu de l'eau qu'à l'eau, l'accent qu'à la navigation.
- **Priorité et confiance sont deux dimensions** : la priorité est une couleur et une forme (`SymbolePriorite` : triangle forte, losange moyenne, rond faible, cercle vide sans eau), la confiance trois points et des hachures, toujours en encre.
- Une couleur de priorité ne sert pas de couleur de texte : pastille ou symbole à côté d'un texte en encre.
- Une donnée ancienne se signale par une horloge et du texte (`Bandeau ancien`), pas par une couleur d'alerte.

## Typographie

Police unique Inter (`font-sans`). Chiffres comparés en `tabular-nums`.

| Classe                    | Taille / interligne | Graisse   | Usage                                     |
| ------------------------- | ------------------- | --------- | ----------------------------------------- |
| `text-display`            | 40 / 44             | 600       | Indicateur principal d'une fiche          |
| `text-chiffre`            | 32 / 40             | 600       | Valeur principale                         |
| `text-titre1`             | 24 / 32             | 600       | Nom de la zone, titre de page             |
| `text-titre2`             | 20 / 28             | 600       | Sections                                  |
| `text-titre3`             | 16 / 24             | 600       | Intitulés de blocs                        |
| `text-texte`              | 16 / 24             | 400       | Corps (jamais moins de 16 sur mobile)     |
| `text-petit`              | 14 / 20             | 400       | Légendes, dates d'image                   |
| `text-mention`            | 12 / 16             | 500       | Sources, attribution                      |
| `text-surtitre uppercase` | 12 / 16             | 600, +6 % | Surtitre de section (« AVANT LA SAISON ») |

`cn()` (`src/lib/utils.ts`) connaît ces tailles : sans cela, tailwind-merge prendrait `text-petit` pour une couleur et le supprimerait.

## Espacements, formes, profondeur

- Grille de 4 px ; espacements usuels `2` (8), `3` (12), `4` (16), `6` (24), `8` (32).
- Rayons : `rounded-sm` 8 px (boutons, champs), `rounded-md` 12 px, `rounded-lg` 16 px (cartes, panneaux), `rounded-pill`.
- Élévation : `shadow-1` (carte posée sur la page), `shadow-float` (au-dessus de la carte), `shadow-pop` (menus, infobulles, dialogues).
- Superposition : `z-controle` < `z-panneau` < `z-barre` < `z-infobulle` < `z-dialogue`.
- Mise en page : barre du haut `h-topbar` (56 px), barre latérale `w-barre` (248 px) ou rail `w-rail` (72 px, de 1024 à 1279 px), panneau `w-panneau` (400 px), aperçu de la feuille du bas `h-apercu` (140 px), page de lecture `max-w-lecture` (680 px).
- Points de rupture : mobile < 640 px, `sm` tablette, `lg` ordinateur (1024 px), `xl` grand écran (1280 px).

## Verre

Classe `verre` : surface à 78 % (84 % en sombre), flou de 14 px, reflet léger en haut, liseré et ombre flottante. `verre-bouton` pour les boutons posés dessus.

- Uniquement sur ce qui flotte au-dessus de la carte : barre d'outils, légende, bandeau, feuille du bas, infobulle de survol, pastilles. Jamais sur un tableau, un texte long ou une page de lecture.
- Jamais de verre posé sur du verre ; le flou lui-même n'est jamais animé.
- Contraste : l'encre secondaire garde au moins 4,8:1 (5,4:1 en sombre) même sur une zone rouge ou un fond blanc.
- Replis opaques automatiques : navigateur sans `backdrop-filter`, `prefers-reduced-transparency`, et pendant un déplacement de la carte (`html[data-carte-bouge]`).
- `lg:sans-verre` rend opaque un élément qui ne flotte plus sur ordinateur (panneau en colonne).

## Mouvement

Une animation dit toujours ce qui change. On n'anime que `transform` et `opacity` (et la hauteur de la feuille du bas), sans bibliothèque. Tout est coupé si l'utilisateur réduit les animations.

| Jeton             | Classe             | Valeur                             | Usage                                                              |
| ----------------- | ------------------ | ---------------------------------- | ------------------------------------------------------------------ |
| `--duree`         | `transition`       | 150 ms                             | Retour d'appui, survol                                             |
| `--duree-etat`    | `duration-etat`    | 250 ms                             | Panneau, curseur, infobulle, menus (`entree-bas`, `entree-gauche`) |
| `--duree-chiffre` | `duration-chiffre` | 600 ms                             | Chiffre qui défile, une seule fois                                 |
| `--ease-sortie`   | `ease-sortie`      | `cubic-bezier(0.2, 0.8, 0.2, 1)`   | Ce qui apparaît                                                    |
| `--ease-ressort`  | `ease-ressort`     | ressort amorti, 4 % de dépassement | Ce qui se déplace : feuille du bas, curseur                        |

Les boutons s'enfoncent de 3 % à l'appui. La carte ne bouge pas quand un filtre change ; elle se recadre seulement à la sélection d'une zone ou sur « Revenir à la vue d'ensemble ».

## Composants

| Rôle                  | Composant                                                                                                                                                   | Fichier                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Navigation            | `BarreLaterale`, `BarreHaut`, `MenuMobile`, `PaletteRecherche` (Ctrl K)                                                                                     | `components/shell/`                                    |
| Carte                 | `CarteZones` (barre d'outils, couches, plein écran, repli sans fond), `Legende` (sert aussi de filtre), `PanneauZones` (colonne ou feuille à tirer)         | `components/carte/`                                    |
| Indicateurs           | `ChiffreCle` (carte), `Statistique` (rangée), `Repartition`, `RangeeIndicateurs`                                                                            | `components/ui/`, `components/apercu/`                 |
| Priorité et confiance | `SymbolePriorite`, `BadgePriorite`, `IndicateurConfiance`                                                                                                   | `components/zone/badges.tsx`                           |
| Zones                 | `ListeZones` (top 10), `TableauZones` (classement complet), `FicheZone`, `HistogrammeSaisons`                                                               | `components/`, `components/zones/`, `components/zone/` |
| Après une pluie       | `ListeUrgence`, `FicheUrgence`, `BadgeAction`                                                                                                               | `components/apres/`                                    |
| Balise                | `Jauge`, `CourbeNiveau`, `VueBalise`                                                                                                                        | `components/balise/`                                   |
| États                 | `AlerteErreur`, `EtatVide`, `Bandeau` (fraîcheur, ancien, hors ligne), `BandeauMaquette`, `Squelette`, `SqueletteListe`, `SqueletteFiche`, `ChargeurGoutte` | `components/ui/`                                       |
| Contrôles             | `Bouton`, `ControleSegmente`, `Pastille`, `Interrupteur`, `Popover`, `Dialogue`, `ChampRecherche`, `Selection`, `Infobulle`                                 | `components/ui/`                                       |

Chaque écran gère le chargement (squelette à la forme du contenu), l'erreur (message, raison, « Réessayer »), le vide (une phrase qui dit pourquoi) et la donnée indisponible.

## Icônes

Lucide, 20 px (`ICONE`) ou 16 px dans les listes denses (`ICONE_PETITE`), trait de 1,75. Un bouton qui n'a qu'une icône porte un `aria-label`.

## Carte et graphiques

MapLibre et Recharts ne lisent pas toujours les variables CSS : la carte passe par `jeton("--prio-high")` (`src/lib/design.ts`) et relit les jetons à chaque changement de thème ; Recharts reçoit `var(--…)` directement dans ses attributs SVG.

## Logo

Logotype en Inter Semibold : « Mbënn » en `--ink`, « Scan » en `--primary`. Version blanche sur la barre latérale et en thème sombre (`Logo`, `components/shell/marque.tsx`), jamais recolorée. Toujours écrire MbënnScan avec le tréma et le S majuscule.
