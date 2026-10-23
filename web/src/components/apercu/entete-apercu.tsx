"use client";

import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RangeeIndicateurs } from "@/components/apercu/synthese-apercu";
import { Squelette } from "@/components/ui/squelette";
import { ICONE_PETITE } from "@/lib/design";
import { formatDate } from "@/lib/format";
import type { SyntheseGlobale } from "@/lib/synthese";
import { cn } from "@/lib/utils";
import type { Evenement } from "@/types/contracts";

const CLE_SYNTHESE = "mbennscan:synthese";
export const PERIODE = "Keur Massar · hivernages 2020-2026";

/**
 * En-tête de la vue générale : titre, période, accès au classement et rangée d'indicateurs repliable.
 * Sur ordinateur, au-dessus de la carte et du classement ; sur téléphone, seul le titre (pour les lecteurs d'écran)
 * reste ici, les indicateurs passent dans la feuille du bas.
 */
export function EnteteApercu({
  statut,
  synthese,
  episode,
  maquette,
  vide,
}: {
  statut: "chargement" | "erreur" | "ok";
  synthese: SyntheseGlobale;
  episode: Evenement | null;
  maquette: boolean;
  vide: boolean;
}) {
  const [ouverte, setOuverte] = useState(true);

  useEffect(() => {
    try {
      const choix = localStorage.getItem(CLE_SYNTHESE);
      // Sans choix enregistré, un écran peu haut (portable 1280 × 720) garde la place pour la carte.
      if (choix === "repliee" || (choix === null && window.innerHeight < 800)) setOuverte(false);
    } catch {
      // Stockage interdit : synthèse ouverte.
    }
  }, []);

  function basculer() {
    setOuverte((o) => {
      try {
        localStorage.setItem(CLE_SYNTHESE, o ? "repliee" : "ouverte");
      } catch {
        // Le choix vaut pour cette page seulement.
      }
      return !o;
    });
  }

  return (
    <section
      aria-labelledby="titre-vue"
      className="lg:halo-entete lg:border-b lg:border-line lg:bg-surface lg:px-6 lg:py-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="hidden text-surtitre uppercase text-ink-3 lg:block">Avant la saison</p>
          <h1 id="titre-vue" className="sr-only lg:not-sr-only lg:text-titre1">
            Où l&apos;eau reste le plus longtemps
          </h1>
          <p className="hidden text-petit text-ink-2 lg:block">
            {PERIODE}
            {statut === "ok" && !maquette && synthese.maj && ` · calcul du ${formatDate(synthese.maj)}`}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Link
            href="/zones"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-sm px-3 text-petit font-medium text-primary-ink transition-colors hover:bg-primary-soft"
          >
            Classement complet
            <ArrowRight {...ICONE_PETITE} aria-hidden />
          </Link>
          <button
            type="button"
            onClick={basculer}
            aria-expanded={ouverte}
            aria-controls="indicateurs-vue"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-line px-3 text-petit font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
          >
            {ouverte ? <ChevronUp {...ICONE_PETITE} aria-hidden /> : <ChevronDown {...ICONE_PETITE} aria-hidden />}
            {ouverte ? "Masquer les indicateurs" : "Afficher les indicateurs"}
          </button>
        </div>
      </div>
      <div id="indicateurs-vue" className={cn("hidden", ouverte && "lg:block")}>
        {statut === "ok" && !vide && <RangeeIndicateurs synthese={synthese} episode={episode} className="mt-4" />}
        {statut === "chargement" && (
          <div className="mt-4 grid grid-cols-5 gap-6" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Squelette className="h-4 w-2/3" />
                <Squelette className="h-8 w-1/2" />
                <Squelette className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
