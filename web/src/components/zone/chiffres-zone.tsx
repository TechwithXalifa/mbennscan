import { Building2, Droplets, Hourglass, Percent, Route, School, Users } from "lucide-react";
import { ChiffreCle } from "@/components/ui/chiffre-cle";
import { Compteur } from "@/components/ui/compteur";
import { ICONE, ICONE_PETITE } from "@/lib/design";
import { formatNombre, formatPourcent } from "@/lib/format";
import { EXPLICATION_EAU, LIBELLE_EAU, type Historique } from "@/lib/synthese";
import { cn } from "@/lib/utils";
import type { ZoneSynthese } from "@/types/contracts";

/** Section d'une fiche : petit titre avec icône, puis le contenu. Reste d'un bloc à l'impression. */
export function Bloc({
  titre,
  icone: Icone,
  children,
  className,
}: {
  titre: string;
  icone?: typeof Users;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("break-inside-avoid", className)}>
      <h2 className="flex items-center gap-2 text-titre3 text-ink">
        {Icone && <Icone {...ICONE_PETITE} className="text-ink-3" aria-hidden />}
        {titre}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Ce que le satellite a vu : l'indicateur principal, puis la fréquence, la durée et le type d'eau. */
export function EauObservee({ zone, h }: { zone: ZoneSynthese; h: Historique | null }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <ChiffreCle
        misEnAvant
        icone={Users}
        valeur={<Compteur valeur={zone.habitants_jours_an} format={(n) => formatNombre(Math.round(n))} />}
        unite="habitants-jours par an"
        intitule="Habitants-jours sous l'eau"
        phrase="Habitants touchés × jours d'eau, en moyenne sur 2020-2026."
        info="C'est l'indicateur qui classe les zones. 200 habitants pendant 10 jours font 2 000 habitants-jours."
      />
      <ChiffreCle
        icone={Percent}
        valeur={h?.frequence != null ? <Compteur valeur={h.frequence} format={formatPourcent} /> : null}
        intitule="Fréquence observée"
        phrase="Part des passages du satellite où l'eau était là."
      />
      <ChiffreCle
        icone={Hourglass}
        valeur={
          h?.dureeMoyJours != null ? (
            <Compteur valeur={h.dureeMoyJours} format={(n) => formatNombre(Math.round(n))} />
          ) : null
        }
        unite="jours"
        intitule="Durée moyenne"
        phrase="Combien de temps l'eau reste après une forte pluie, à 3 à 6 jours près."
      />
      <ChiffreCle
        mot
        className="col-span-2"
        icone={Droplets}
        valeur={zone.classe_eau ? LIBELLE_EAU[zone.classe_eau] : "Pas d'eau persistante"}
        intitule="Type d'eau"
        phrase={zone.classe_eau ? EXPLICATION_EAU[zone.classe_eau] : "Pas d'étendue d'eau visible par satellite."}
      />
    </div>
  );
}

/** Ce qui est touché : bâtiments, écoles (avec leurs noms) et routes. */
export function Exposition({ zone }: { zone: ZoneSynthese }) {
  return (
    <ul className="divide-y divide-line rounded-lg border border-line">
      {[
        { Icone: Building2, libelle: "Bâtiments", valeur: formatNombre(zone.batiments_touches) },
        {
          Icone: School,
          libelle: zone.ecoles_touchees > 1 ? "Écoles" : "École",
          valeur: formatNombre(zone.ecoles_touchees),
          detail: zone.ecoles_noms.length > 0 ? zone.ecoles_noms.join(", ") : undefined,
        },
        { Icone: Route, libelle: "Routes inondées", valeur: `${formatNombre(zone.routes_km)} km` },
      ].map(({ Icone, libelle, valeur, detail }) => (
        <li key={libelle} className="flex items-start gap-3 px-4 py-3">
          <Icone {...ICONE} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-ink">{libelle}</p>
            {detail && <p className="text-petit text-ink-2">{detail}</p>}
          </div>
          <p className="text-titre3 tabular-nums text-ink">{valeur}</p>
        </li>
      ))}
    </ul>
  );
}
