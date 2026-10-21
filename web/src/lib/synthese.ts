// Phrases et chiffres de la fiche zone, calculés à partir des données (jamais écrits à la main).
import { formatHabitants, formatNombre, formatPourcent } from "@/lib/format";
import type { ClasseEau, IndicateurSaison, ZoneSynthese } from "@/types/contracts";

export type Historique = {
  imagesValides: number;
  imagesInondees: number;
  /** images inondées ÷ images valides sur toutes les saisons ; null sans image valide */
  frequence: number | null;
  /** moyenne des durées des saisons où l'eau a été vue ; null si aucune */
  dureeMoyJours: number | null;
};

export function historique(saisons: IndicateurSaison[]): Historique | null {
  if (saisons.length === 0) return null;
  const imagesValides = saisons.reduce((s, x) => s + x.images_valides, 0);
  const imagesInondees = saisons.reduce((s, x) => s + x.images_inondees, 0);
  const durees = saisons.map((x) => x.duree_moy_jours).filter((d): d is number => d !== null && d > 0);
  return {
    imagesValides,
    imagesInondees,
    frequence: imagesValides > 0 ? imagesInondees / imagesValides : null,
    dureeMoyJours: durees.length ? durees.reduce((s, d) => s + d, 0) / durees.length : null,
  };
}

export const LIBELLE_EAU: Record<ClasseEau, string> = {
  ruissellement: "Ruissellement",
  intermediaire: "Intermédiaire",
  stagnation: "Stagnation durable",
};

export const EXPLICATION_EAU: Record<ClasseEau, string> = {
  ruissellement: "L'eau part en moins de 6 jours.",
  intermediaire: "L'eau reste entre 6 et 12 jours.",
  stagnation: "L'eau reste 12 jours ou plus.",
};

/** Ce que suggère le type d'eau (cahier des charges, section 7). */
export const SUGGESTION_EAU: Record<ClasseEau, string> = {
  ruissellement: "L'eau part en quelques jours : le drainage est la piste principale.",
  intermediaire: "Situation mixte : à examiner sur le terrain.",
  stagnation:
    "L'eau reste plus de 12 jours : une remontée de nappe est probable. Pomper seul risque d'être insuffisant ; une vérification avec la DGPRE est recommandée.",
};

export function phraseSynthese(zone: ZoneSynthese, h: Historique | null): string {
  if (zone.priorite === "nulle") {
    return "Entre 2020 et 2026, le satellite n'a pas observé d'eau persistante dans cette zone après les fortes pluies.";
  }
  const morceaux: string[] = [];
  if (h?.frequence != null) {
    const duree =
      h.dureeMoyJours != null
        ? `, et elle est restée en moyenne ${formatNombre(Math.round(h.dureeMoyJours))} jours`
        : "";
    morceaux.push(
      `Entre 2020 et 2026, l'eau est apparue dans ${formatPourcent(h.frequence)} des passages du satellite pendant l'hivernage${duree}.`,
    );
  } else {
    morceaux.push(
      `Entre 2020 et 2026, cette zone compte ${formatNombre(Math.round(zone.habitants_jours_an))} habitants-jours sous l'eau par an.`,
    );
  }
  if (zone.population != null)
    morceaux.push(`Environ ${formatHabitants(zone.population)} habitants vivent dans cette zone.`);
  return morceaux.join(" ");
}

/** « 1re », « 3e » */
export function ordinal(n: number): string {
  return n === 1 ? "1re" : `${n}e`;
}
