# web/ — application (Aziz)

Next.js 14 (App Router) + TypeScript strict + MapLibre GL + Tailwind + shadcn/ui + Recharts, installable (PWA), hébergée sur Vercel.

## Démarrer

```bash
cd web
npm install
cp .env.example .env.local   # NEXT_PUBLIC_USE_MOCKS=true par défaut
npm run dev                  # http://localhost:3000
```

`predev` et `prebuild` copient `contracts/mocks/*.json` dans `public/mocks/` (`npm run mocks`, script Node qui marche aussi sous Windows). Ce dossier n'est pas versionné.

| Commande | Rôle |
| --- | --- |
| `npm run lint` | ESLint (lancé en CI) |
| `npm run typecheck` | `tsc --noEmit` (lancé en CI) |
| `npm run build` | build de production (lancé en CI avec les mocks) |
| `npm run format` | Prettier |
| `npm run e2e` | parcours de démo joué par Playwright sur les mocks, téléphone et ordinateur (lancé en CI) |

Composants shadcn/ui : `npx shadcn@latest add <composant>` (configuration dans `components.json`).

## Organisation

```
src/
  app/               # routes (E1 /, E2 /zone/[id], E3 /apres/[evenement], E4 /avant-apres, E5 /balise/[id], E6 /methode)
  components/        # composants d'interface (ui/ pour shadcn)
  lib/data.ts        # seule couche d'accès aux données
  lib/format.ts      # nombres, dates et habitants au format français
  types/contracts.ts # types écrits d'après contracts/schemas/
```

## Règles

- Une seule couche d'accès aux données, `src/lib/data.ts`, qui lit `public/mocks/` si `NEXT_PUBLIC_USE_MOCKS=true`, sinon Supabase (clé `anon` uniquement, client chargé à la demande). Elle est appelée depuis le navigateur.
- `run_meta` n'est pas dans Supabase : hors mocks, la page Méthode le lit dans `public/data/run_meta.json`.
- Types dans `src/types/contracts.ts`, écrits d'après `contracts/schemas/` (ne pas inventer de champ).
- Design system : `DESIGN-SYSTEM.md`. Jetons du cahier des charges (section 6) dans `src/app/globals.css` (variables CSS) et `tailwind.config.ts` (`text-ink`, `bg-prio-high`, `text-titre1`, `min-h-cible`…).
- Écrans et parcours : cahier des charges, sections 6 et 7. Ordre : E1 carte → E2 fiche → E3 après une pluie → E5 balise → E4 avant / après → E6 méthode.
- Tester sur téléphone (Chrome Android) à chaque PR.

## Vercel

Projet avec *Root Directory* = `web` (les fichiers hors de `web/` restent accessibles, ce qui permet de copier `contracts/mocks`). Variables : `NEXT_PUBLIC_USE_MOCKS`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_MAP_STYLE_URL`, `NEXT_PUBLIC_DEFAULT_BALISE_ID`.
