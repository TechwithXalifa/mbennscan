// Filtres et tri du classement des zones, sans interface : utilisés par la page des zones et la recherche.
import type { Confiance, Priorite, ZoneSynthese } from "@/types/contracts";

export type Filtres = { recherche: string; priorites: Priorite[]; commune: string; confiance: Confiance | "" };
export const FILTRES_VIDES: Filtres = { recherche: "", priorites: [], commune: "", confiance: "" };

// Accents combinants (U+0300 à U+036F) laissés par la décomposition NFD, écrits sans caractère invisible.
const ACCENTS = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, "g");

/** Sans accents ni majuscules, sans la marque [FICTIF] : « medina » trouve « Médina Gounass ». */
export function normaliser(t: string): string {
  return t
    .replace(/^\[FICTIF\]\s*/, "")
    .normalize("NFD")
    .replace(ACCENTS, "")
    .toLowerCase();
}

export const actifs = (f: Filtres) => Boolean(f.recherche || f.priorites.length || f.commune || f.confiance);

/** Zones qui passent tous les filtres. */
export function filtrer(zones: ZoneSynthese[], f: Filtres): ZoneSynthese[] {
  const q = normaliser(f.recherche.trim());
  return zones
    .filter((z) => !q || normaliser(z.nom).includes(q) || normaliser(z.commune).includes(q))
    .filter((z) => f.priorites.length === 0 || f.priorites.includes(z.priorite))
    .filter((z) => !f.commune || z.commune === f.commune)
    .filter((z) => !f.confiance || z.confiance === f.confiance);
}

// ── Tri ───────────────────────────────────────────────────────────────────────

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
