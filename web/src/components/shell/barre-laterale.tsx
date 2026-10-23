"use client";

import { PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChoixTheme } from "@/components/shell/choix-theme";
import { Logo } from "@/components/shell/marque";
import { StatutDonnees } from "@/components/shell/statut-donnees";
import { ICONE } from "@/lib/design";
import { CLE_BARRE, GROUPES, ouvrirRecherche } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type Largeur = "auto" | "repliee" | "ouverte";

/**
 * Navigation principale sur ordinateur, en bleu nuit dans les deux thèmes.
 * Repliée en rail d'icônes de 1024 à 1279 px (la carte garde sa place), ouverte au-delà ;
 * le choix de l'utilisateur est gardé sur l'appareil.
 */
export function BarreLaterale() {
  const chemin = usePathname();
  const [largeur, setLargeur] = useState<Largeur>("auto");

  useEffect(() => {
    try {
      const l = localStorage.getItem(CLE_BARRE);
      if (l === "repliee" || l === "ouverte") setLargeur(l);
    } catch {
      // Stockage interdit : largeur automatique.
    }
  }, []);

  function basculer() {
    const repliee = largeur === "repliee" || (largeur === "auto" && !matchMedia("(min-width: 1280px)").matches);
    const suivante: Largeur = repliee ? "ouverte" : "repliee";
    setLargeur(suivante);
    try {
      localStorage.setItem(CLE_BARRE, suivante);
    } catch {
      // Le choix vaut pour cette page seulement.
    }
  }

  // Le libellé se cache quand la barre est repliée, mais reste lu par les lecteurs d'écran.
  const libelle =
    "sr-only xl:not-sr-only group-data-[largeur=repliee]:sr-only group-data-[largeur=ouverte]:not-sr-only";
  const masque = "hidden xl:flex group-data-[largeur=repliee]:hidden group-data-[largeur=ouverte]:flex";

  return (
    <aside
      data-largeur={largeur}
      // La largeur choisie est posée avant l'affichage par SCRIPT_BARRE (layout) : l'attribut peut différer du rendu serveur.
      suppressHydrationWarning
      className="group sticky top-0 z-barre hidden h-dvh shrink-0 flex-col border-r border-nuit-line bg-nuit text-nuit-ink transition-[width] duration-etat ease-sortie print:hidden lg:flex lg:w-rail xl:w-barre data-[largeur=ouverte]:w-barre data-[largeur=repliee]:w-rail"
    >
      <div className="flex h-topbar shrink-0 items-center px-[22px] group-data-[largeur=ouverte]:px-5 xl:px-5 xl:group-data-[largeur=repliee]:px-[22px]">
        <Link href="/" aria-label="MbënnScan, vue générale" className="flex min-h-cible items-center">
          <span className={masque}>
            <Logo surFonce />
          </span>
          <span className="flex xl:hidden group-data-[largeur=ouverte]:hidden group-data-[largeur=repliee]:flex">
            <Logo surFonce seul />
          </span>
        </Link>
      </div>

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={ouvrirRecherche}
          className="flex min-h-10 w-full items-center gap-3 rounded-md border border-nuit-line bg-nuit-2 px-[11px] text-petit text-nuit-ink-2 transition-colors hover:text-nuit-ink"
          title="Rechercher (Ctrl K)"
        >
          <Search {...ICONE} className="shrink-0" aria-hidden />
          <span className={cn("flex-1 text-left", masque)}>Rechercher</span>
          <kbd
            aria-hidden
            className={cn("rounded-xs border border-nuit-line px-1.5 text-mention text-nuit-ink-3", masque)}
          >
            Ctrl K
          </kbd>
        </button>
      </div>

      <nav aria-label="Navigation principale" className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {GROUPES.map((g) => (
          <div key={g.titre} className="mb-4">
            <p
              className={cn(
                "mb-1 px-3 text-surtitre uppercase text-nuit-ink-3",
                "xl:block group-data-[largeur=repliee]:hidden group-data-[largeur=ouverte]:block",
                "hidden",
              )}
            >
              {g.titre}
            </p>
            <div
              className="mx-3 mb-2 h-px bg-nuit-line xl:hidden group-data-[largeur=ouverte]:hidden group-data-[largeur=repliee]:block"
              aria-hidden
            />
            <ul className="space-y-0.5">
              {g.liens.map(({ href, libelle: nom, Icone, actif }) => {
                const courant = actif(chemin);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={courant ? "page" : undefined}
                      title={nom}
                      className={cn(
                        "relative flex min-h-cible items-center gap-3 rounded-md px-3 text-petit font-medium transition-colors",
                        courant ? "bg-nuit-2 text-nuit-ink" : "text-nuit-ink-2 hover:bg-nuit-2 hover:text-nuit-ink",
                      )}
                    >
                      {courant && (
                        <span className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-pill bg-accent" aria-hidden />
                      )}
                      <Icone {...ICONE} className="shrink-0" aria-hidden />
                      <span className={libelle}>{nom}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-nuit-line p-3">
        <div className={cn("flex-col gap-2", masque)}>
          <StatutDonnees surFonce />
          <ChoixTheme surFonce avecLibelles />
        </div>
        <button
          type="button"
          onClick={basculer}
          className="flex min-h-10 w-full items-center gap-3 rounded-md px-[11px] text-petit text-nuit-ink-2 transition-colors hover:bg-nuit-2 hover:text-nuit-ink"
          title="Replier ou déplier la navigation"
        >
          <PanelLeftClose
            {...ICONE}
            className="hidden shrink-0 xl:block group-data-[largeur=repliee]:hidden group-data-[largeur=ouverte]:block"
            aria-hidden
          />
          <PanelLeftOpen
            {...ICONE}
            className="shrink-0 xl:hidden group-data-[largeur=ouverte]:hidden group-data-[largeur=repliee]:block"
            aria-hidden
          />
          <span className={libelle}>Replier la navigation</span>
        </button>
      </div>
    </aside>
  );
}
