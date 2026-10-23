// Tri du classement des zones : par rang, nom, commune, habitants-jours, habitants ou confiance.
import { normaliser } from "@/components/zones/filtres-zones";
import type { Confiance, ZoneSynthese } from "@/types/contracts";

export type Colonne = "rang" | "nom" | "commune" | "habitants_jours_an" | "population" | "confiance";
export type Tri = { colonne: Colonne; sens: "asc" | "desc" };

const ORDRE_CONFIANCE: Record<Confiance, number> = { elevee: 0, moyenne: 1, faible: 2 };
export const NOM_COLONNE: Record<Colonne, string> = {
  rang: "rang",
  nom: "nom",
  commune: "commune",
  habitants_jours_an: "habitants-jours par an",
  population: "nombre d'habitants",
  confiance: "confiance",
};

/** Valeur de tri ; les valeurs absentes (zone non classée, population inconnue) vont toujours à la fin. */
function cle(z: ZoneSynthese, c: Colonne): string | number | null {
  switch (c) {
    case "rang":
      return z.rang;
    case "nom":
      return normaliser(z.nom);
    case "commune":
      return normaliser(z.commune);
    case "habitants_jours_an":
      return z.habitants_jours_an;
    case "population":
      return z.population;
    case "confiance":
      return ORDRE_CONFIANCE[z.confiance];
  }
}

export function comparer(a: ZoneSynthese, b: ZoneSynthese, { colonne, sens }: Tri): number {
  const x = cle(a, colonne);
  const y = cle(b, colonne);
  if (x === null && y === null) return 0;
  if (x === null) return 1;
  if (y === null) return -1;
  const r = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "fr");
  return sens === "asc" ? r : -r;
}
