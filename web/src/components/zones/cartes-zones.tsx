import { MapPin } from "lucide-react";
import Link from "next/link";
import { BadgePriorite, IndicateurConfiance } from "@/components/zone/badges";
import { ICONE_PETITE } from "@/lib/design";
import { formatNombre } from "@/lib/format";
import type { ZoneSynthese } from "@/types/contracts";

/** Classement sur téléphone et tablette : une carte par zone, sans défilement horizontal. */
export function CartesZones({ zones }: { zones: ZoneSynthese[] }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:hidden">
      {zones.map((z) => (
        <li key={z.id} className="rounded-lg border border-line bg-surface p-4 shadow-1">
          <div className="flex items-start gap-3">
            <span className="w-6 shrink-0 pt-0.5 text-right text-titre3 tabular-nums text-ink-3">{z.rang ?? "–"}</span>
            <div className="min-w-0 flex-1">
              <Link
                href={`/zone/${encodeURIComponent(z.id)}`}
                className="inline-flex font-medium text-ink underline-offset-4 hover:underline [@media(pointer:coarse)]:min-h-cible [@media(pointer:coarse)]:items-center"
              >
                {z.nom}
              </Link>
              <p className="text-petit text-ink-3">{z.commune}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <BadgePriorite priorite={z.priorite} court />
                <IndicateurConfiance confiance={z.confiance} court />
              </div>
            </div>
            <div className="text-right">
              <p className="text-titre3 tabular-nums text-ink">{formatNombre(Math.round(z.habitants_jours_an))}</p>
              <p className="text-mention font-normal text-ink-3">hab.-jours/an</p>
            </div>
          </div>
          <Link
            href={`/?zone=${encodeURIComponent(z.id)}`}
            className="mt-3 inline-flex min-h-cible items-center gap-1.5 text-petit font-medium text-primary-ink"
          >
            <MapPin {...ICONE_PETITE} aria-hidden />
            Voir sur la carte
          </Link>
        </li>
      ))}
    </ol>
  );
}
