import type { Confiance, Priorite } from "@/types/contracts";

export const LIBELLE_PRIORITE: Record<Priorite, string> = {
  forte: "Priorité forte",
  moyenne: "Priorité moyenne",
  faible: "Priorité faible",
  nulle: "Pas d'étendue d'eau visible par satellite",
};

/** Classe Tailwind de la pastille de couleur. */
export const FOND_PRIORITE: Record<Priorite, string> = {
  forte: "bg-prio-high",
  moyenne: "bg-prio-mid",
  faible: "bg-prio-low",
  nulle: "bg-prio-none",
};

/** Variable CSS de la couleur (lue par la carte, qui ne comprend pas les variables). */
export const VARIABLE_PRIORITE: Record<Priorite, string> = {
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
