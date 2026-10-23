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
 * Symbole de priorité : une forme par niveau (triangle, losange, rond, cercle vide),
 * pour que la priorité se lise sans la couleur.
 */
export function SymbolePriorite({
  priorite,
  surCouleur = false,
  className,
}: {
  priorite: Priorite;
  /** Dessiné à la couleur de la surface, sur une pastille déjà colorée (légende) */
  surCouleur?: boolean;
  className?: string;
}) {
  const trait = surCouleur
    ? priorite === "nulle"
      ? "fill-none stroke-surface"
      : "fill-surface stroke-surface"
    : TRAIT_PRIORITE[priorite];
  return (
    <svg viewBox="0 0 12 12" aria-hidden className={cn("size-3 shrink-0", className)}>
      {priorite === "forte" && <path d="M6 1.2 11 10.4H1z" className={trait} strokeLinejoin="round" />}
      {priorite === "moyenne" && <path d="M6 .9 11.1 6 6 11.1.9 6z" className={trait} strokeLinejoin="round" />}
      {priorite === "faible" && <circle cx="6" cy="6" r="4.6" className={trait} />}
      {priorite === "nulle" && <circle cx="6" cy="6" r="4.2" strokeWidth="1.6" className={trait} />}
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

const POINTS: Record<Confiance, number> = { elevee: 3, moyenne: 2, faible: 1 };

/** Trois points remplis selon le niveau, plus le mot. Une autre dimension que la priorité : jamais de couleur. */
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
      <span className="inline-flex gap-[3px]" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "size-[7px] rounded-pill border border-ink-2",
              i <= POINTS[confiance] ? "bg-ink-2" : "bg-transparent",
            )}
          />
        ))}
      </span>
      {court ? LIBELLE_CONFIANCE[confiance] : `Confiance ${LIBELLE_CONFIANCE[confiance].toLowerCase()}`}
      {explique && (
        <Infobulle libelle={`Pourquoi une confiance ${LIBELLE_CONFIANCE[confiance].toLowerCase()} ?`}>
          {EXPLICATION_CONFIANCE[confiance]}
        </Infobulle>
      )}
    </span>
  );
}
