import { ArrowDown, Layers, Radar, Users } from "lucide-react";
import { SOMMAIRE } from "@/components/methode/contenu";
import { ICONE, ICONE_PETITE } from "@/lib/design";

const FAITS = [
  { Icone: Radar, valeur: "10 m", libelle: "Radar Sentinel-1, qui voit à travers les nuages" },
  { Icone: Layers, valeur: "2020-2026", libelle: "Sept hivernages comparés" },
  { Icone: Users, valeur: "1 indicateur", libelle: "Habitants-jours sous l'eau, sans score composite" },
];

/** Accroche de la page Méthode : titre, message, deux accès directs et trois repères. */
export function Accroche() {
  return (
    <header className="halo-entete px-4 pb-14 pt-12 lg:px-8 lg:pb-20 lg:pt-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-surtitre uppercase text-vif">Référence</p>
        <h1 className="mt-3 max-w-3xl text-hero text-ink lg:text-hero-lg">Méthode et limites</h1>
        <p className="mt-4 max-w-2xl text-intro text-ink-2">
          MbënnScan mesure, à partir d&apos;images radar, où l&apos;eau des inondations est réellement restée dans la
          banlieue de Dakar depuis 2020, combien de temps, et chez combien d&apos;habitants. C&apos;est la seule page où
          les termes techniques sont employés, chacun expliqué.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#etapes"
            className="inline-flex min-h-cible items-center gap-2 rounded-sm bg-primary px-5 font-medium text-on-color shadow-1 transition-colors hover:bg-primary-strong"
          >
            Voir les étapes du calcul
            <ArrowDown {...ICONE_PETITE} aria-hidden />
          </a>
          <a
            href="#limites"
            className="inline-flex min-h-cible items-center rounded-sm border border-line bg-surface px-5 font-medium text-ink transition-colors hover:border-line-strong"
          >
            Ce que les chiffres ne disent pas
          </a>
        </div>
        <dl className="mt-12 grid gap-4 sm:grid-cols-3">
          {FAITS.map(({ Icone, valeur, libelle }) => (
            <div key={libelle} className="rounded-lg border border-line bg-surface p-5 shadow-1">
              <Icone {...ICONE} className="text-ink-3" aria-hidden />
              <dt className="sr-only">{libelle}</dt>
              <dd className="mt-3 text-titre1 tabular-nums text-vif">{valeur}</dd>
              <dd className="mt-1 text-petit text-ink-2">{libelle}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}

/** Navigation dans la page, qui reste en haut pendant la lecture. */
export function NavSections() {
  return (
    <nav
      aria-label="Sections de la page"
      className="sticky top-0 z-controle border-t border-line bg-surface px-4 lg:px-8 print:hidden"
    >
      <div className="fondu-x mx-auto flex max-w-6xl gap-1 overflow-x-auto py-2">
        {SOMMAIRE.map(([id, titre]) => (
          <a
            key={id}
            href={`#${id}`}
            className="inline-flex min-h-9 shrink-0 items-center rounded-pill px-3 text-petit font-medium text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink [@media(pointer:coarse)]:min-h-cible"
          >
            {titre}
          </a>
        ))}
      </div>
    </nav>
  );
}
