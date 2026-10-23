"use client";

import { Droplets, Waves, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Pastille } from "@/components/ui/pastille";
import { EtatVide } from "@/components/ui/etats";
import { BadgePriorite } from "@/components/zone/badges";
import { formatNombre } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClasseEau, Priorite, ZoneSynthese } from "@/types/contracts";

export const TYPE_EAU: Record<ClasseEau, { libelle: string; Icone: LucideIcon }> = {
  ruissellement: { libelle: "Ruissellement", Icone: Waves },
  intermediaire: { libelle: "Intermédiaire", Icone: Waves },
  stagnation: { libelle: "Stagnation durable", Icone: Droplets },
};

type Props = {
  zones: ZoneSynthese[];
  selection: string | null;
  onSelection: (id: string) => void;
  /** Niveaux masqués par le filtre de la légende */
  prioritesMasquees?: Priorite[];
  onReinitialiser?: () => void;
  /** Ligne qui s'agrandit en fiche (et dans laquelle la fiche se replie au retour) */
  zoneAnimee?: string | null;
};

/** Top 10 des zones classées, filtrable par commune. Alternative accessible à la carte. */
export function ListeZones({
  zones,
  selection,
  onSelection,
  prioritesMasquees = [],
  onReinitialiser,
  zoneAnimee = null,
}: Props) {
  const [commune, setCommune] = useState<string | null>(null);

  const classees = useMemo(
    () => zones.filter((z) => z.rang !== null).sort((a, b) => (a.rang ?? 0) - (b.rang ?? 0)),
    [zones],
  );
  const communes = useMemo(() => Array.from(new Set(classees.map((z) => z.commune))).sort(), [classees]);
  const top = classees
    .filter((z) => (!commune || z.commune === commune) && !prioritesMasquees.includes(z.priorite))
    .slice(0, 10);
  const max = Math.max(1, ...top.map((z) => z.habitants_jours_an));

  if (classees.length === 0)
    return (
      <EtatVide titre="Aucune zone classée" className="my-3">
        Le satellite n&apos;a vu d&apos;étendue d&apos;eau persistante dans aucune des zones calculées.
      </EtatVide>
    );

  return (
    <>
      {communes.length > 1 && (
        <div
          className="fondu-x -mx-4 flex gap-2 overflow-x-auto px-4 py-2 group-data-[apercu=true]:hidden lg:group-data-[apercu=true]:flex"
          role="group"
          aria-label="Filtrer par commune"
        >
          {[null, ...communes].map((c) => (
            <Pastille key={c ?? "toutes"} active={commune === c} onClick={() => setCommune(c)}>
              {c ?? "Toutes"}
            </Pastille>
          ))}
        </div>
      )}
      {top.length === 0 ? (
        <EtatVide
          titre="Aucune zone avec ces filtres"
          className="my-3"
          action={
            onReinitialiser && (
              <button
                type="button"
                onClick={() => {
                  setCommune(null);
                  onReinitialiser();
                }}
                className="min-h-cible text-petit font-medium text-primary-ink underline-offset-4 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )
          }
        >
          Les niveaux de priorité masqués dans la légende, ou la commune choisie, ne laissent aucune zone.
        </EtatVide>
      ) : (
        <ol className="-mx-2">
          {top.map((z) => {
            const eau = z.classe_eau ? TYPE_EAU[z.classe_eau] : null;
            return (
              <li key={z.id}>
                <button
                  type="button"
                  onClick={() => onSelection(z.id)}
                  aria-current={selection === z.id || undefined}
                  style={{ viewTransitionName: zoneAnimee === z.id ? "fiche" : undefined }}
                  className="group/ligne grid min-h-cible w-full grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-x-3 rounded-md px-2 py-3 text-left transition-[background-color,transform] ease-sortie hover:bg-surface-2 active:scale-[0.99] aria-[current]:bg-primary-soft"
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-7 items-center justify-center rounded-pill border border-line bg-surface text-petit font-semibold tabular-nums text-ink-2",
                      z.rang === 1 && "border-transparent bg-inverse text-inverse-ink",
                    )}
                  >
                    {z.rang}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 font-medium leading-snug text-ink">{z.nom}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-petit text-ink-2">
                      <span>{z.commune}</span>
                      {eau && (
                        <span className="inline-flex items-center gap-1">
                          <eau.Icone size={14} strokeWidth={1.75} aria-hidden />
                          {eau.libelle}
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 block">
                      <BadgePriorite priorite={z.priorite} />
                    </span>
                  </span>
                  <span className="flex flex-col items-end text-right">
                    <span className="text-titre3 tabular-nums text-ink">
                      {formatNombre(Math.round(z.habitants_jours_an))}
                    </span>
                    <span className="text-mention font-normal text-ink-3">hab.-jours/an</span>
                    <span className="mt-2 h-1 w-16 overflow-hidden rounded-pill bg-surface-3" aria-hidden>
                      <span
                        className="block h-full rounded-pill bg-primary"
                        style={{ width: `${Math.max(4, Math.round((z.habitants_jours_an / max) * 100))}%` }}
                      />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
