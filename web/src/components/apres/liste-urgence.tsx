"use client";

import { ArrowLeft, Droplets, Search, Users } from "lucide-react";
import Link from "next/link";
import { IndicateurConfiance } from "@/components/zone/badges";
import { formatHabitants, formatNombre } from "@/lib/format";
import { LIBELLE_EAU } from "@/lib/synthese";
import type { ActionSuggeree, ImpactEvenement, ZoneSynthese } from "@/types/contracts";

const ACTION: Record<ActionSuggeree, { libelle: string; Icone: typeof Droplets }> = {
  pomper: { libelle: "Pomper", Icone: Droplets },
  recenser: { libelle: "Recenser", Icone: Users },
  visiter: { libelle: "Visiter", Icone: Search },
};

function BadgeAction({ action }: { action: ActionSuggeree }) {
  const { libelle, Icone } = ACTION[action];
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-line px-2 text-petit">
      <Icone size={16} strokeWidth={1.75} aria-hidden />
      {libelle}
    </span>
  );
}

type Props = {
  impacts: ImpactEvenement[];
  zones: Map<string, ZoneSynthese>;
  selection: string | null;
  onSelection: (id: string | null) => void;
};

/** Liste « À visiter en priorité » (triée par habitants touchés) et fiche d'urgence d'une zone. */
export function ListeUrgence({ impacts, zones, selection, onSelection }: Props) {
  const choisi = impacts.find((i) => i.zone_id === selection);

  if (choisi) {
    const zone = zones.get(choisi.zone_id);
    return (
      <article className="space-y-3 py-2">
        <button
          type="button"
          onClick={() => onSelection(null)}
          className="inline-flex min-h-cible items-center gap-2 text-primary"
        >
          <ArrowLeft size={20} strokeWidth={1.75} aria-hidden />À visiter en priorité
        </button>
        <h3 className="text-titre2">{zone?.nom ?? choisi.zone_id}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <BadgeAction action={choisi.action_suggeree} />
          {zone && <IndicateurConfiance confiance={zone.confiance} />}
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
          <dt className="text-ink-2">Surface en eau</dt>
          <dd className="tabular-nums">{formatNombre(choisi.surface_eau_pct)} %</dd>
          <dt className="text-ink-2">Habitants</dt>
          <dd className="tabular-nums">environ {formatHabitants(choisi.habitants_touches)}</dd>
          <dt className="text-ink-2">Bâtiments</dt>
          <dd className="tabular-nums">{formatNombre(choisi.batiments_touches)}</dd>
          <dt className="text-ink-2">Écoles</dt>
          <dd className="tabular-nums">{formatNombre(choisi.ecoles_touchees)}</dd>
          {zone?.classe_eau && (
            <>
              <dt className="text-ink-2">D&apos;habitude</dt>
              <dd>{LIBELLE_EAU[zone.classe_eau]} (2020-2026)</dd>
            </>
          )}
        </dl>
        <Link
          href={`/zone/${encodeURIComponent(choisi.zone_id)}`}
          className="inline-flex min-h-cible items-center text-primary underline"
        >
          Fiche complète de la zone
        </Link>
      </article>
    );
  }

  if (impacts.length === 0) return null;

  return (
    <section>
      <h3 className="text-titre3">À visiter en priorité</h3>
      <ol className="divide-y divide-line">
        {impacts.map((i) => (
          <li key={i.zone_id}>
            <button
              type="button"
              onClick={() => onSelection(i.zone_id)}
              className="flex min-h-cible w-full items-center gap-3 py-2 text-left hover:bg-bg"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{zones.get(i.zone_id)?.nom ?? i.zone_id}</span>
                <span className="block text-petit text-ink-2">
                  environ {formatHabitants(i.habitants_touches)} habitants · {formatNombre(i.surface_eau_pct)} % en eau
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
