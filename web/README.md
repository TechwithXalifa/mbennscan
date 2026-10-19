# web/ — application (Aziz)

Next.js 14 (App Router) + TypeScript strict + MapLibre GL + Tailwind + shadcn/ui + Recharts, installable (PWA), hébergée sur Vercel.

## Créer l'application

```bash
cd web
npx create-next-app@14 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install maplibre-gl recharts @supabase/supabase-js lucide-react
npx shadcn@latest init
cp .env.example .env.local
```

Ajouter au `package.json` :

```json
"scripts": {
  "typecheck": "tsc --noEmit",
  "mocks": "mkdir -p public/mocks && cp ../contracts/mocks/*.json public/mocks/",
  "predev": "npm run mocks",
  "prebuild": "npm run mocks"
}
```

## Règles

- Une seule couche d'accès aux données, `src/lib/data.ts`, qui lit `public/mocks/` si `NEXT_PUBLIC_USE_MOCKS=true`, sinon Supabase (clé `anon` uniquement).
- Types dans `src/types/contracts.ts`, écrits d'après `contracts/schemas/` (ne pas inventer de champ).
- Jetons de design de `CLAUDE.md` dans `src/app/globals.css` (variables CSS) et `tailwind.config.ts`.
- Écrans et parcours : cahier des charges, sections 6 et 7. Ordre : E1 carte → E2 fiche → E3 après une pluie → E5 balise → E4 avant / après → E6 méthode.
- Tester sur téléphone (Chrome Android) à chaque PR.
