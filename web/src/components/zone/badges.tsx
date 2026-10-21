import { FOND_PRIORITE, LIBELLE_CONFIANCE, LIBELLE_PRIORITE } from "@/lib/priorite";
import type { Confiance, Priorite } from "@/types/contracts";

export function BadgePriorite({ priorite }: { priorite: Priorite }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 text-petit">
      <span className={`size-2 rounded-pill ${FOND_PRIORITE[priorite]}`} aria-hidden />
      {LIBELLE_PRIORITE[priorite]}
    </span>
  );
}

const POINTS: Record<Confiance, number> = { elevee: 3, moyenne: 2, faible: 1 };

/** Trois points remplis selon le niveau, plus le mot. */
export function IndicateurConfiance({ confiance }: { confiance: Confiance }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-petit">
      <span className="inline-flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-2 rounded-pill border border-ink-2 ${i <= POINTS[confiance] ? "bg-ink-2" : ""}`}
          />
        ))}
      </span>
      Confiance {LIBELLE_CONFIANCE[confiance].toLowerCase()}
    </span>
  );
}
