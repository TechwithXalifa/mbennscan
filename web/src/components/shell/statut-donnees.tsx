"use client";

import { Database, FlaskConical } from "lucide-react";
import { useEffect, useState } from "react";
import { estMaquette, getZones } from "@/lib/data";
import { ICONE_PETITE } from "@/lib/design";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Statut = { maquette: boolean; maj: string | null } | null;

/**
 * Provenance des données affichées : maquette [FICTIF] ou date du dernier calcul.
 * Lit les zones (lecture partagée avec la carte) : jamais de date inventée.
 */
export function StatutDonnees({ surFonce = false, className }: { surFonce?: boolean; className?: string }) {
  const [statut, setStatut] = useState<Statut>(null);

  useEffect(() => {
    getZones()
      .then((z) => {
        const proprietes = z.features.map((f) => f.properties);
        const maj =
          proprietes
            .map((p) => p.maj)
            .sort()
            .at(-1) ?? null;
        setStatut({ maquette: estMaquette(proprietes.map((p) => p.nom)), maj });
      })
      .catch(() => setStatut(null));
  }, []);

  if (!statut) return null;
  const Icone = statut.maquette ? FlaskConical : Database;
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-md px-3 py-2 text-mention font-normal",
        surFonce ? "bg-nuit-2 text-nuit-ink-2" : "border border-line bg-surface-2 text-ink-2",
        className,
      )}
    >
      <Icone {...ICONE_PETITE} className="mt-px shrink-0" aria-hidden />
      <span>
        {statut.maquette ? (
          <>
            <strong className={cn("font-semibold", surFonce ? "text-nuit-ink" : "text-ink")}>Maquette</strong> · données
            fictives [FICTIF]
          </>
        ) : (
          <>
            <strong className={cn("font-semibold", surFonce ? "text-nuit-ink" : "text-ink")}>Données calculées</strong>
            {statut.maj && ` · calcul du ${formatDate(statut.maj)}`}
          </>
        )}
      </span>
    </p>
  );
}
