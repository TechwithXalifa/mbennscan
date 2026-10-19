# Contribuer à MbënnScan

Trois personnes, trois jours, un seul dépôt. Ces règles servent à ne jamais se bloquer ni s'écraser.

## Qui fait quoi

| Domaine | Responsable | Relecteur par défaut |
| --- | --- | --- |
| `pipeline/`, `contracts/` côté production | Khalifa Babacar DIOUF | Aziz |
| `web/`, design | Serigne Abdoul Aziz NDIAYE | Khalifa |
| `firmware/`, Edge Function `mesure` | Seydina Aboubacry KANE | Aziz |
| `supabase/schema.sql` | Aziz | Khalifa |
| `docs/` | tout le monde | n'importe qui |

## Démarrer

```bash
git clone git@github.com:<organisation>/mbennscan.git
cd mbennscan
pip install jsonschema && python scripts/validate_contracts.py   # doit afficher ✓
```

Puis suivre le README de votre dossier (`pipeline/`, `web/`, `firmware/`).

## Branches

- `main` : toujours fonctionnelle et déployable. Protégée : pas de push direct, pull request obligatoire, CI verte obligatoire.
- Une branche par tâche, courte (quelques heures, pas des jours) :
  - `feat/web-fiche-zone`, `feat/pipeline-persistance`
  - `fix/web-legende-mobile`
  - `contract/ajout-action-suggeree`
  - `docs/methode`
- On part toujours de `main` à jour : `git switch main && git pull && git switch -c feat/...`

## Commits

Format [Conventional Commits](https://www.conventionalcommits.org/fr/), en français :

```
<type>(<portée>): <ce que fait le commit>

types   : feat, fix, refactor, docs, test, chore, contract
portées : pipeline, web, supabase, firmware, contracts, docs, ci
```

Exemples : `feat(pipeline): correction de la cadence par images valides` · `fix(web): bandeau de fraîcheur absent sur mobile` · `contract(contracts): ajout de action_suggeree aux impacts`.

## Pull requests

1. Petite et ciblée : idéalement moins de 300 lignes modifiées.
2. Remplir le modèle (quoi, pourquoi, comment tester, capture d'écran pour le web).
3. La CI doit passer (contrats, lint, build).
4. **Un relecteur approuve** avant fusion. Pendant le hackathon, relecture en moins d'une heure : prévenir sur le groupe quand une PR attend.
5. Fusion en **squash merge**, puis suppression de la branche.
6. Une PR qui touche un contrat demande l'accord explicite des deux côtés (voir `contracts/README.md`).

## Contrats de données

C'est ce qui permet de travailler en parallèle : le web avance sur les mocks pendant que le pipeline calcule les vraies données. Règle : **personne ne change un format sans PR « contract » approuvée par l'autre côté.** Les vrais résultats du pipeline doivent passer `python scripts/validate_contracts.py --dir pipeline/out`.

## Secrets

- Jamais de clé, mot de passe ou jeton dans le code, un commit, une issue ou une capture d'écran.
- Copier `web/.env.example` en `web/.env.local`, `pipeline/.env.example` en `pipeline/.env`, `firmware/include/secrets.example.h` en `firmware/include/secrets.h`.
- Les clés se partagent par message privé, pas dans le dépôt.
- Une clé publiée par erreur : la révoquer immédiatement dans Supabase, puis prévenir l'équipe.

## Travailler avec Claude Code

- Lancer Claude Code depuis la racine du dépôt : il lit `CLAUDE.md` automatiquement.
- Une session = une tâche = une branche. Donner le numéro d'issue en début de session.
- Toujours relire le diff proposé avant de commiter. Claude ne fusionne rien dans `main`.
- Quand Claude apprend une règle utile pour tous (commande, piège, convention), l'ajouter à `CLAUDE.md` dans la PR.

## Définition de « terminé »

Une tâche est terminée quand :

- elle marche sur téléphone (Chrome Android) et sur ordinateur ;
- elle fonctionne avec les mocks **et** avec les vraies données dès qu'elles existent ;
- les états chargement, vide, erreur et hors ligne sont gérés ;
- la CI est verte et un autre membre l'a essayée ;
- `CLAUDE.md` et les README sont à jour si une commande ou une règle a changé.

## Rythme pendant le hackathon

- Point de 10 minutes **le matin (9 h GMT) et le soir (19 h GMT)** : fait, à faire, blocages.
- Tableau GitHub Projects « Hackathon » : colonnes À faire · En cours · En relecture · Terminé.
- Gel des fonctionnalités le **22 octobre à 16 h GMT** : ensuite, uniquement corrections et répétition de la démo.
- Rendu au plus tard le **22 octobre à 23 h 59 GMT**.
