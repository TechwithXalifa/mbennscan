# Logo MbënnScan

Pictogramme : un hexagone (rappel des mailles de calcul) contenant une vague d'eau. Logotype en Inter Semibold, « Mbënn » en encre, « Scan » en bleu primaire. Les SVG sont vectorisés : ils ne dépendent d'aucune police.

| Fichier                                                     | Usage                                                                               |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `logo-couleur.svg`                                          | Logo par défaut, sur fond clair                                                     |
| `logo-noir.svg`                                             | Monochrome encre `#101828`, sur fond clair (impression, documents)                  |
| `logo-blanc.svg`                                            | Monochrome blanc, sur fond foncé ou photo                                           |
| `pictogramme-*.svg`                                         | Pictogramme seul, mêmes déclinaisons                                                |
| `png/`                                                      | Exports PNG transparents : pictogramme 64 à 1024 px, logo 64, 128 et 256 px de haut |
| `icone-192.png`, `icone-512.png`, `icone-masquable-512.png` | Icônes d'app (manifeste)                                                            |

Favicon (`src/app/favicon.ico`, `src/app/icon.svg`) : version monochrome simplifiée, une seule vague, lisible à 16 px. Icône iOS : `src/app/apple-icon.png`.

Couleurs : encre `#101828`, primaire `#0E5A8A`, blanc. Le bleu de l'eau `#2E90FA` reste réservé à la carte.

Règles : ne pas déformer, recolorer ni ajouter d'effet ; laisser autour du logo une marge au moins égale à la moitié de la hauteur du pictogramme ; sous 24 px, utiliser le pictogramme seul.

Pour régénérer tous les fichiers : `pip install fonttools cairosvg pillow && python web/scripts/generer-logo.py`.
