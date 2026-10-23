import { CloudRain, Droplets, ShieldCheck, Target, Users } from "lucide-react";
import Link from "next/link";
import { Compteur } from "@/components/ui/compteur";
import { Repartition } from "@/components/ui/repartition";
import { Statistique } from "@/components/ui/statistique";
import { IndicateurConfiance } from "@/components/zone/badges";
import { TYPE_EAU } from "@/components/liste-zones";
import { formatDate, formatNombre, formatPourcent } from "@/lib/format";
import { CONFIANCES } from "@/lib/priorite";
import type { SyntheseGlobale } from "@/lib/synthese";
import { cn } from "@/lib/utils";
import type { ClasseEau, Evenement } from "@/types/contracts";
import { ICONE_MINI } from "@/lib/design";

const TYPES: ClasseEau[] = ["stagnation", "intermediaire", "ruissellement"];

/**
 * Rangée d'indicateurs au-dessus de la carte : l'indicateur principal d'abord, puis ce qui aide à décider.
 * Tout vient des zones calculées et du dernier épisode ; un chiffre absent est dit « non disponible ».
 */
export function RangeeIndicateurs({
  synthese: s,
  episode,
  className,
}: {
  synthese: SyntheseGlobale;
  /** Dernier épisode de pluie avec une image radar exploitable ; null s'il n'y en a pas */
  episode: Evenement | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] lg:gap-x-0 lg:divide-x lg:divide-line lg:[&>*:not(:first-child)]:pl-5 lg:[&>*]:pr-5 xl:[&>*:not(:first-child)]:pl-6 xl:[&>*]:pr-6",
        className,
      )}
    >
      <Statistique
        principal
        icone={Users}
        intitule="Habitants-jours sous l'eau par an"
        valeur={
          s.avecEau > 0 ? <Compteur valeur={s.habitantsJours} format={(n) => formatNombre(Math.round(n))} /> : null
        }
        detail={`${formatNombre(s.avecEau)} zone${s.avecEau > 1 ? "s" : ""} avec eau observée · moyenne 2020-2026`}
        info="Habitants touchés multipliés par le nombre de jours d'eau, additionnés sur les zones où le satellite a vu de l'eau. 200 habitants pendant 10 jours font 2 000 habitants-jours."
        className="col-span-2 sm:col-span-3 lg:col-span-1"
      />
      <Statistique
        icone={Target}
        intitule="Part en priorité forte"
        valeur={s.partFortes === null ? null : formatPourcent(s.partFortes)}
        detail={`${formatNombre(s.fortes)} zone${s.fortes > 1 ? "s" : ""} sur ${formatNombre(s.avecEau)}`}
        info="Part des habitants-jours portée par les zones en priorité forte (le tiers le plus touché). Plus elle est élevée, plus l'effort peut être concentré."
      />
      <Statistique
        icone={Droplets}
        intitule="Stagnation durable"
        valeur={formatNombre(s.typesEau.stagnation)}
        unite={s.typesEau.stagnation > 1 ? "zones" : "zone"}
        detail="Eau ≥ 12 jours : nappe probable"
      />
      <Statistique
        icone={ShieldCheck}
        intitule="À vérifier sur le terrain"
        valeur={formatNombre(s.confiance.faible)}
        unite={s.confiance.faible > 1 ? "zones" : "zone"}
        detail="Confiance faible de la mesure"
      />
      <Statistique
        icone={CloudRain}
        intitule="Dernière image après pluie"
        valeur={episode?.date_image ? <span className="text-titre2">{formatDate(episode.date_image)}</span> : null}
        detail={
          episode ? (
            <Link href={`/apres/${episode.id}`} className="text-primary-ink underline-offset-4 hover:underline">
              Pluie du {formatDate(episode.date_pluie)} →
            </Link>
          ) : (
            "Aucun épisode avec image exploitable"
          )
        }
        className="col-span-2 sm:col-span-1 lg:col-span-1"
      />
    </div>
  );
}

/** Ce que disent les zones : le type d'eau (drainer ou pomper) et la fiabilité des mesures. */
export function RepartitionsZones({ synthese: s, className }: { synthese: SyntheseGlobale; className?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-1", className)}>
      <Repartition
        titre="Type d'eau des zones avec eau"
        unite="zones"
        lignes={TYPES.map((t) => {
          const { libelle, Icone } = TYPE_EAU[t];
          return {
            cle: t,
            libelle: (
              <>
                <Icone {...ICONE_MINI} aria-hidden />
                {libelle}
              </>
            ),
            valeur: s.typesEau[t],
          };
        })}
      />
      <Repartition
        titre="Fiabilité des mesures"
        unite="zones"
        lignes={CONFIANCES.map((c) => ({
          cle: c,
          libelle: <IndicateurConfiance confiance={c} court />,
          valeur: s.confiance[c],
        }))}
      />
    </div>
  );
}
