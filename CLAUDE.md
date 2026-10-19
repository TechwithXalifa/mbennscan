# CLAUDE.md — MbënnScan

Ce fichier est lu par Claude Code à chaque session. Il vaut pour toute l'équipe : Khalifa, Aziz et Aboubacry travaillent tous avec ces règles.

## Le projet en une phrase

MbënnScan mesure par satellite (Sentinel-1) où l'eau des inondations est réellement restée dans la banlieue de Dakar (Keur Massar, Pikine, Guédiawaye), combien de temps et chez combien d'habitants, pour aider la DPGI, l'ONAS, les sapeurs-pompiers et les mairies à décider où agir avant la saison des pluies et juste après. Une balise au sol (ESP32) mesure en continu le niveau d'un bassin.

Contexte : hackathon national « Du satellite à la solution » (SENSAT-TRL). Équipe « fflush ». Rendu le **22 octobre 2026 à 23 h 59 GMT**, présentation en ligne les 23 et 24 octobre. La référence fonctionnelle est le cahier des charges (`docs/cahier-des-charges.md` ou PDF).

## Structure du dépôt

```
contracts/   schémas JSON (source de vérité des formats) + mocks fictifs
pipeline/    Python 3.11 : Earth Engine, détection de l'eau, indicateurs, export → Supabase   (Khalifa)
web/         Next.js 14 App Router + TypeScript + MapLibre + Tailwind + shadcn/ui         (Aziz)
supabase/    schema.sql, migrations, Edge Functions (TypeScript/Deno)                  (Aziz + Aboubacry)
firmware/    ESP32, PlatformIO, framework Arduino                                       (Aboubacry)
scripts/     outils transverses (validation des contrats)
data/        zone d'étude ; les gros fichiers ne sont pas versionnés
docs/        cahier des charges, décisions, script de démo
```

## Règles non négociables

1. **Les contrats d'abord.** Tout échange de données entre pipeline, base, balise et web suit `contracts/schemas/`. Ne jamais ajouter, renommer ou supprimer un champ sans modifier le schéma, les mocks et `supabase/schema.sql` dans la même pull request (voir `contracts/README.md`). Après toute modification de contrat ou de mock : `python scripts/validate_contracts.py`.
2. **Ne jamais inventer de données.** Aucun chiffre en dur dans l'interface ou les présentations s'il ne sort pas du pipeline. Les mocks sont fictifs et marqués `[FICTIF]` : ne pas retirer ce marquage, ne pas les présenter comme des résultats.
3. **Aucun secret dans le dépôt.** Les clés vont dans `.env.local` (web), `pipeline/.env` ou `firmware/include/secrets.h`, tous ignorés par git. La clé `service_role` de Supabase n'apparaît **jamais** dans `web/`.
4. **Pas de données personnelles.** Résultats agrégés par zone, jamais par ménage ou personne. Habitants toujours arrondis.
5. **Petites pull requests**, une branche par tâche, jamais de push direct sur `main` (voir `CONTRIBUTING.md`).
6. **Ne pas élargir le périmètre.** Hors périmètre du prototype : comptes utilisateurs, alertes SMS/WhatsApp, voix en wolof, application native, modèle prédictif. En cas de doute, demander avant de coder.

## Conventions de code

- Champs de données et colonnes SQL : français, snake_case, sans accents (`habitants_jours_an`). Code (variables, fonctions, composants) : anglais. Textes visibles dans l'interface : français.
- **web** : TypeScript strict, ESLint + Prettier, composants fonctionnels, types générés ou écrits à partir de `contracts/schemas` (un seul fichier `web/src/types/contracts.ts`). Lecture des données via une couche unique `web/src/lib/data.ts` qui bascule entre mocks et Supabase selon `NEXT_PUBLIC_USE_MOCKS`.
- **pipeline** : Python 3.11, Ruff, fonctions pures et testables, paramètres centralisés dans `pipeline/config.py` et recopiés dans `run_meta.json`. Toute sortie passe `validate_contracts.py --dir pipeline/out` avant d'être écrite dans Supabase.
- **firmware** : PlatformIO, `secrets.h` non versionné (modèle `secrets.example.h`), médiane de 5 lectures, rejet hors bornes 20 à 600 cm.
- Commits : Conventional Commits avec portée, en français. Ex. `feat(web): fiche zone avec histogramme des hivernages`.

## Design (résumé — détails dans le cahier des charges, section 6)

- Mobile d'abord (375 px), cibles tactiles ≥ 44 px, texte ≥ 16 px sur mobile, police Inter, chiffres tabulaires.
- Jetons de couleur : `--ink #101828`, `--ink-2 #475467`, `--bg #F7F8FA`, `--surface #FFFFFF`, `--line #E4E7EC`, `--primary #0E5A8A`, `--primary-strong #0A4670`, `--water #2E90FA` (55 %), `--water-line #175CD3`, `--prio-high #D92D20`, `--prio-mid #F79009`, `--prio-low #3BA55C`, `--prio-none #D0D5DD`, `--ok #12B76A`, `--off #98A2B3`.
- Les couleurs de priorité ne servent qu'à la priorité, le bleu ne sert qu'à l'eau. La couleur n'est jamais seule : toujours une étiquette écrite.
- Chaque chiffre affiché est accompagné de la date de l'image et du niveau de confiance. Chaque écran a ses états chargement, vide, erreur, hors ligne.
- Interface compréhensible par un maire : aucun terme technique hors de la page Méthode.

## Commandes

```bash
# Contrats
pip install jsonschema && python scripts/validate_contracts.py

# Pipeline (à compléter par Khalifa)
cd pipeline && python -m venv .venv && source .venv/bin/activate && pip install -e .
earthengine authenticate

# Web (à compléter par Aziz)
cd web && npm install && npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm run build

# Firmware (à compléter par Aboubacry)
cd firmware && pio run -t upload && pio device monitor
```

Mettre cette section à jour dès qu'une commande change.

## Comment travailler avec Claude dans ce dépôt

- Commencer chaque session en indiquant la tâche (numéro d'issue) et la branche.
- Lire le contrat concerné avant d'écrire du code qui produit ou consomme des données.
- Montrer le diff avant de commiter ; un humain relit toute pull request.
- Si une décision change l'architecture, un contrat ou le périmètre : l'écrire dans `docs/DECISIONS.md`.
