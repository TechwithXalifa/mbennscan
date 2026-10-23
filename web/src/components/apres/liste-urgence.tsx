"use client";

import { BadgeAction, FicheUrgence } from "@/components/apres/fiche-urgence";
import { formatHabitants, formatNombre } from "@/lib/format";
import type { Evenement, ImpactEvenement, ZoneSynthese } from "@/types/contracts";

type Props = {
  impacts: ImpactEvenement[];
  zones: Map<string, ZoneSynthese>;
  evenement: Evenement;
  selection: string | null;
  onSelection: (id: string | null) => void;
};

/** Liste « À visiter en priorité » (triée par habitants touchés) et fiche d'urgence d'une zone. */
export function ListeUrgence({ impacts, zones, evenement, selection, onSelection }: Props) {
  const choisi = impacts.find((i) => i.zone_id === selection);

  if (choisi) {
    return (
      <FicheUrgence
        impact={choisi}
        zone={zones.get(choisi.zone_id)}
        evenement={evenement}
        onRetour={() => onSelection(null)}
      />
    );
  }

  if (impacts.length === 0) return null;
  const max = Math.max(1, ...impacts.map((i) => i.habitants_touches));

  return (
    <section aria-labelledby="titre-visiter">
      <div className="flex items-baseline justify-between gap-2">
        <h3 id="titre-visiter" className="text-titre3">
          À visiter en priorité
        </h3>
        <p className="text-mention font-normal text-ink-3">triées par habitants touchés</p>
      </div>
      <ol className="-mx-2 mt-1">
        {impacts.map((i, rang) => (
          <li key={i.zone_id}>
            <button
              type="button"
              onClick={() => onSelection(i.zone_id)}
              className="grid min-h-cible w-full grid-cols-[24px_minmax(0,1fr)_auto] items-start gap-x-3 rounded-md px-2 py-3 text-left transition-[background-color,transform] ease-sortie hover:bg-surface-2 active:scale-[0.99]"
            >
              <span className="mt-0.5 text-petit font-semibold tabular-nums text-ink-3">{rang + 1}</span>
              <span className="min-w-0">
                <span className="line-clamp-2 font-medium leading-snug text-ink">
                  {zones.get(i.zone_id)?.nom ?? i.zone_id}
                </span>
                <span className="mt-0.5 block text-petit tabular-nums text-ink-2">
                  environ {formatHabitants(i.habitants_touches)} habitants · {formatNombre(i.surface_eau_pct)} % en eau
                </span>
                <span className="mt-2 block h-1 w-full max-w-40 overflow-hidden rounded-pill bg-surface-3" aria-hidden>
                  <span
                    className="block h-full rounded-pill bg-primary"
                    style={{ width: `${Math.max(4, Math.round((i.habitants_touches / max) * 100))}%` }}
                  />
                </span>
              </span>
              <BadgeAction action={i.action_suggeree} />
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
