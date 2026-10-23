/** Icônes Lucide : 20 px, trait de 1,75 (cahier des charges, section 6). */
export const ICONE = { size: 20, strokeWidth: 1.75 } as const;
/** Petite icône des métadonnées et des listes denses. */
export const ICONE_PETITE = { size: 16, strokeWidth: 1.75 } as const;
/** Icône dans le texte d'une ligne (type d'eau, action suggérée). */
export const ICONE_MINI = { size: 14, strokeWidth: 1.75 } as const;
/** Icône d'en-tête de carte ou d'état mis en avant. */
export const ICONE_GRANDE = { size: 24, strokeWidth: 1.75 } as const;

/** Lit la valeur d'un jeton CSS (pour MapLibre et Recharts, qui ne lisent pas les variables). */
export function jeton(variable: `--${string}`): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/** Style du fond de carte clair (OpenFreeMap Positron par défaut). */
export const STYLE_CARTE = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/positron";

/** Style du fond de carte sombre (OpenFreeMap Dark par défaut), recoloré en bleu nuit par la carte. */
export const STYLE_CARTE_SOMBRE =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL_SOMBRE || "https://tiles.openfreemap.org/styles/dark";
