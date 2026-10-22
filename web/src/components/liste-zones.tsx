"use client";

import { Droplets, Waves, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Pastille } from "@/components/ui/pastille";
import { formatNombre } from "@/lib/format";
import { FOND_PRIORITE, LIBELLE_PRIORITE } from "@/lib/priorite";
import type { ClasseEau, ZoneSynthese } from "@/types/contracts";

const TYPE_EAU: Record<ClasseEau, { libelle: string; Icone: LucideIcon }> = {
  ruissellement: { libelle: "Ruissellement", Icone: Waves },
  intermediaire: { libelle: "Intermédiaire", Icone: Waves },
  stagnation: { libelle: "Stagnation durable", Icone: Droplets },
};

type Props = {
  zones: ZoneSynthese[];
  selection: string | null;
  onSelection: (id: string) => void;
};

/** Top 10 des zones classées, filtrable par commune. Alternative accessible à la carte. */
export function ListeZones({ zones, selection, onSelection }: Props) {
  const [commune, setCommune] = useState<string | null>(null);

  const classees = useMemo(
    () => zones.filter((z) => z.rang !== null).sort((a, b) => (a.rang ?? 0) - (b.rang ?? 0)),
    [zones],
  );
  const communes = useMemo(() => Array.from(new Set(classees.map((z) => z.commune))).sort(), [classees]);
  const top = classees.filter((z) => !commune || z.commune === commune).slice(0, 10);

  if (classees.length === 0) return <p className="py-4">Aucune eau détectée dans les zones calculées.</p>;

  return (
    <>
      {communes.length > 1 && (
        <div
          className="-mx-1 flex gap-2 group-data-[apercu=true]:hidden lg:group-data-[apercu=true]:flex overflow-x-auto px-1 py-2"
          role="group"
          aria-label="Filtrer par commune"
        >
          {[null, ...communes].map((c) => (
            <Pastille
              key={c ?? "toutes"}
              active={commune === c}
              onClick={() => setCommune(c)}
              className="shrink-0 px-3"
            >
              {c ?? "Toutes"}
            </Pastille>
          ))}
        </div>
      )}
      <ol className="divide-y divide-line">
        {top.map((z) => {
          const eau = z.classe_eau ? TYPE_EAU[z.classe_eau] : null;
          return (
            <li key={z.id}>
              <button
                type="button"
                onClick={() => onSelection(z.id)}
                aria-current={selection === z.id || undefined}
                className="flex min-h-cible w-full items-center gap-3 py-2 text-left hover:bg-bg aria-[current]:bg-bg"
              >
                <span className="w-6 text-right tabular-nums text-ink-2">{z.rang}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{z.nom}</span>
                  <span className="block truncate text-petit text-ink-2">{z.commune}</span>
                  {eau && (
                    <span className="flex items-center gap-1 text-petit text-ink-2">
                      <eau.Icone size={16} strokeWidth={1.75} aria-hidden />
                      {eau.libelle}
                    </span>
                  )}
                </span>
                <span className="text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 text-petit">
                    <span className={`size-2 rounded-pill ${FOND_PRIORITE[z.priorite]}`} aria-hidden />
                    {LIBELLE_PRIORITE[z.priorite]}
                  </span>
                  <span className="block text-petit tabular-nums text-ink-2">
                    {formatNombre(Math.round(z.habitants_jours_an))} hab.-jours/an
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}
