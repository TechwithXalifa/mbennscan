import type { Confiance, Priorite } from "@/types/contracts";

export const PRIORITES: Priorite[] = ["forte", "moyenne", "faible", "nulle"];

export const LIBELLE_PRIORITE: Record<Priorite, string> = {
  forte: "Priorité forte",
  moyenne: "Priorité moyenne",
  faible: "Priorité faible",
  nulle: "Pas d'étendue d'eau visible par satellite",
};

/** Libellé court des filtres et des légendes compactes. */
export const LIBELLE_PRIORITE_COURT: Record<Priorite, string> = {
  forte: "Forte",
  moyenne: "Moyenne",
  faible: "Faible",
  nulle: "Sans eau visible",
};

/** Ce que veut dire chaque niveau, en français courant. */
export const EXPLICATION_PRIORITE: Record<Priorite, string> = {
  forte: "Cette zone fait partie du tiers le plus touché.",
  moyenne: "Cette zone fait partie du tiers intermédiaire.",
  faible: "Cette zone fait partie du tiers le moins touché.",
  nulle: "Le satellite n'a pas vu d'étendue d'eau persistante dans cette zone.",
};

/** Classe Tailwind de la pastille de couleur. */
export const FOND_PRIORITE: Record<Priorite, string> = {
  forte: "bg-prio-high",
  moyenne: "bg-prio-mid",
  faible: "bg-prio-low",
  nulle: "bg-prio-none",
};

/** Classe Tailwind du tracé du symbole (SVG). */
export const TRAIT_PRIORITE: Record<Priorite, string> = {
  forte: "fill-prio-high stroke-prio-high",
  moyenne: "fill-prio-mid stroke-prio-mid",
  faible: "fill-prio-low stroke-prio-low",
  nulle: "fill-none stroke-ink-3",
};

/** Variable CSS de la couleur (lue par la carte, qui ne comprend pas les variables). */
export const VARIABLE_PRIORITE: Record<Priorite, `--${string}`> = {
  forte: "--prio-high",
  moyenne: "--prio-mid",
  faible: "--prio-low",
  nulle: "--prio-none",
};

export const LIBELLE_CONFIANCE: Record<Confiance, string> = {
  elevee: "Élevée",
  moyenne: "Moyenne",
  faible: "Faible",
};

export const EXPLICATION_CONFIANCE: Record<Confiance, string> = {
  elevee: "Assez d'images exploitables et peu de bâti dense : la mesure est fiable.",
  moyenne: "Mesure correcte, avec des réserves (bâti dense ou images moins nombreuses).",
  faible: "Mesure moins fiable (bâti très dense ou peu d'images) : à vérifier sur le terrain.",
};

export const CONFIANCES: Confiance[] = ["elevee", "moyenne", "faible"];
