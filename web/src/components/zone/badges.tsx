import { Infobulle } from "@/components/ui/infobulle";
import {
  EXPLICATION_CONFIANCE,
  LIBELLE_CONFIANCE,
  LIBELLE_PRIORITE,
  LIBELLE_PRIORITE_COURT,
  TRAIT_PRIORITE,
} from "@/lib/priorite";
import { cn } from "@/lib/utils";
import type { Confiance, Priorite } from "@/types/contracts";

/**
 * Symbole de priorité : un rond plein de la couleur du niveau, un cercle vide sans eau visible.
 * Le libellé écrit à côté reste obligatoire : la couleur n'est jamais seule.
 */
export function SymbolePriorite({ priorite, className }: { priorite: Priorite; className?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className={cn("size-2.5 shrink-0", className)}>
      {priorite === "nulle" ? (
        <circle cx="6" cy="6" r="4.4" strokeWidth="1.6" className={TRAIT_PRIORITE[priorite]} />
      ) : (
        <circle cx="6" cy="6" r="5" className={TRAIT_PRIORITE[priorite]} />
      )}
    </svg>
  );
}

/** Badge de priorité : symbole de couleur + texte. `court` pour les tableaux et les filtres. */
export function BadgePriorite({
  priorite,
  court = false,
  className,
}: {
  priorite: Priorite;
  court?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 whitespace-nowrap rounded-pill border border-line bg-surface px-2 text-petit text-ink",
        className,
      )}
    >
      <SymbolePriorite priorite={priorite} />
      {court ? (
        <>
          <span aria-hidden>{LIBELLE_PRIORITE_COURT[priorite]}</span>
          <span className="sr-only">{LIBELLE_PRIORITE[priorite]}</span>
        </>
      ) : (
        LIBELLE_PRIORITE[priorite]
      )}
    </span>
  );
}

/** Confiance de la mesure, en toutes lettres. Une autre dimension que la priorité : jamais de couleur ni de rond. */
export function IndicateurConfiance({
  confiance,
  court = false,
  explique = false,
}: {
  confiance: Confiance;
  /** « Moyenne » au lieu de « Confiance moyenne » (colonne d'un tableau titrée « Confiance ») */
  court?: boolean;
  /** Ajoute un bouton « i » qui dit pourquoi */
  explique?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-petit text-ink">
      {court ? LIBELLE_CONFIANCE[confiance] : `Confiance ${LIBELLE_CONFIANCE[confiance].toLowerCase()}`}
      {explique && (
        <Infobulle libelle={`Pourquoi une confiance ${LIBELLE_CONFIANCE[confiance].toLowerCase()} ?`}>
          {EXPLICATION_CONFIANCE[confiance]}
        </Infobulle>
      )}
    </span>
  );
}
