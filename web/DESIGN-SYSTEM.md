# Design system MbënnScan

Source : cahier des charges, sections 6 et 7. Les jetons vivent dans `src/app/globals.css` (variables CSS) et sont exposés par `tailwind.config.ts`. Ne jamais écrire une couleur, une taille ou une ombre en dur dans un composant.

## Principes

1. Lisible par un maire : chaque chiffre a sa phrase en français courant.
2. Le téléphone d'abord : écran de 375 px, cibles tactiles de 44 px (`min-h-cible`).
3. La carte est l'écran : tout le reste s'ouvre par-dessus.
4. La couleur n'est jamais seule : étiquette écrite, forme ou hachures en plus.
5. Honnête sur la donnée : date de l'image et confiance visibles à côté de chaque chiffre.
6. Sobre et institutionnel : pas d'effets ni de dégradés, une seule ombre.

## Couleurs

| Jeton | Classe | Valeur | Usage | Texte posé dessus |
| --- | --- | --- | --- | --- |
| `--ink` | `text-ink` | `#101828` | Texte principal | blanc (17,8:1) |
| `--ink-2` | `text-ink-2` | `#475467` | Textes d'appoint | blanc (7,7:1) |
| `--bg` | `bg-bg` | `#F7F8FA` | Fond des pages | encre |
| `--surface` | `bg-surface` | `#FFFFFF` | Panneaux, cartes | encre |
| `--line` | `border-line` | `#E4E7EC` | Bordures, squelettes | encre |
| `--primary` | `bg-primary` | `#0E5A8A` | Boutons, liens, sélection | blanc (7,4:1) |
| `--primary-strong` | `bg-primary-strong` | `#0A4670` | Survol, actif | blanc (9,9:1) |
| `--water` | `bg-water` | `#2E90FA` à 55 % | Eau sur la carte uniquement | encre |
| `--water-line` | `border-water-line` | `#175CD3` | Contour de l'eau | blanc (6,0:1) |
| `--prio-high` | `bg-prio-high` | `#D92D20` | Priorité forte | blanc (4,8:1) |
| `--prio-mid` | `bg-prio-mid` | `#F79009` | Priorité moyenne | encre (7,6:1) |
| `--prio-low` | `bg-prio-low` | `#3BA55C` | Priorité faible | encre (5,7:1) |
| `--prio-none` | `bg-prio-none` | `#D0D5DD` | Pas d'eau observée | encre (12,0:1) |
| `--ok` | `bg-ok` | `#12B76A` | Balise en ligne | encre (6,8:1) |
| `--off` | `bg-off` | `#98A2B3` | Balise hors ligne | encre (6,9:1) |
| `--on-color` | `text-on-color` | `#FFFFFF` | Texte sur primaire et priorité forte | |

Règles :

- Les couleurs de priorité ne servent qu'à la priorité, le bleu de l'eau qu'à l'eau.
- Une couleur de priorité ou d'état ne porte jamais de texte blanc, sauf `--prio-high`. Elle ne sert pas non plus de couleur de texte sur fond clair (contraste insuffisant) : on l'utilise en pastille à côté d'un texte en encre.
- Opacités : zones à `opacity-zone` (60 %), eau à `opacity-eau` (55 %).
- Confiance : `hachures-moyenne` (légères) et `hachures-faible` (serrées, avec un contour en pointillés).
- Mode clair uniquement.

## Typographie

Police unique Inter (`font-sans`). Chiffres comparés en `tabular-nums`.

| Classe | Taille / interligne | Graisse | Usage |
| --- | --- | --- | --- |
| `text-chiffre` | 32 / 40 | 600 | Valeur principale d'une fiche |
| `text-titre1` | 24 / 32 | 600 | Nom de la zone, titre de page |
| `text-titre2` | 20 / 28 | 600 | Sections d'une fiche |
| `text-titre3` | 16 / 24 | 600 | Intitulés de cartes |
| `text-texte` | 16 / 24 | 400 | Corps (jamais moins de 16 sur mobile) |
| `text-petit` | 14 / 20 | 400 | Légendes, dates d'image |
| `text-mention` | 12 / 16 | 500 | Sources, attribution |

## Espacements, formes, profondeur

- Grille de 4 px (échelle Tailwind) ; espacements usuels `2` (8), `3` (12), `4` (16), `6` (24), `8` (32).
- Rayons : `rounded-sm` 8 px (boutons, badges), `rounded-md` 12 px (panneaux, cartes), `rounded-pill` (pastilles).
- Une seule ombre, `shadow-float`, réservée à ce qui flotte au-dessus de la carte.
- Superposition : `z-controle` (légende, boutons de carte) < `z-panneau` < `z-barre` < `z-infobulle`.
- Mise en page : barre du haut `h-topbar` (56 px), panneau `w-panneau` (400 px), aperçu de la feuille du bas `h-apercu` (140 px), page de lecture `max-w-lecture` (680 px).
- Points de rupture : mobile < 640 px, `sm` tablette, `lg` ordinateur (1024 px).
- Mouvement : `duration` = `--duree` (150 ms), coupé si l'utilisateur réduit les animations.

## Icônes

Lucide, 20 px, trait de 1,75 : `<Info {...ICONE} aria-hidden />` avec `ICONE` de `src/lib/design.ts`. Un bouton qui n'a qu'une icône porte un `aria-label`.

## Carte et graphiques

MapLibre et Recharts ne lisent pas les variables CSS : passer par `jeton("--prio-high")` (`src/lib/design.ts`) plutôt que recopier la valeur.

## Logo

Logotype en Inter Semibold : « Mbënn » en `--ink`, « Scan » en `--primary`. Pictogramme : hexagone contenant une vague. Version monochrome (encre sur clair, blanc sur foncé) pour les petites tailles et le favicon. Toujours écrire MbënnScan avec le tréma et le S majuscule.

## Composants de base (`src/components/ui/`)

| Composant | Rôle | À retenir |
| --- | --- | --- |
| `Bouton` | Action | Variantes `primaire` (une par vue), `secondaire`, `discret` (lien d'action), `icone` (avec `aria-label`) ; `flottant` sur la carte. `styleBouton` pour styler un `Link`. |
| `Encart` | Surface d'information | Bordure par défaut ; `flottant` (ombre) au-dessus de la carte. |
| `Pastille` | Filtre à bascule | `active` se traduit en `aria-pressed`. |
| `ControleSegmente` | Sélecteur de mode, bascule de graphique | Groupe radio, flèches gauche / droite. |
| `Squelette` | Chargement | Reprend la forme du contenu ; le conteneur porte `aria-busy`. |
