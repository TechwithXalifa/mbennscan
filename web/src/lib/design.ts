/** Icônes Lucide : 20 px, trait de 1,75 (cahier des charges, section 6). */
export const ICONE = { size: 20, strokeWidth: 1.75 } as const;

/** Lit la valeur d'un jeton CSS (pour MapLibre et Recharts, qui ne lisent pas les variables). */
export function jeton(variable: `--${string}`): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}
