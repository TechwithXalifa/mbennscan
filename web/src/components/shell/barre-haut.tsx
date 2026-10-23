"use client";

import { CalendarRange, ChevronRight, MapPin, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BasculeTheme } from "@/components/shell/choix-theme";
import { Logo } from "@/components/shell/marque";
import { MenuMobile } from "@/components/shell/menu-mobile";
import { ControleSegmente, type Segment } from "@/components/ui/controle-segmente";
import { ICONE, ICONE_PETITE } from "@/lib/design";
import { CHEMIN_MODE, contexteDe, modeDe, ouvrirRecherche, type Mode } from "@/lib/navigation";

const SEGMENTS: Segment<Mode>[] = [
  { valeur: "avant", libelle: "Avant la saison" },
  { valeur: "apres", libelle: "Après une pluie" },
  { valeur: "balise", libelle: "Balise" },
];

/**
 * En-tête de chaque écran. Sur ordinateur : le contexte de travail (mode, page, secteur, période),
 * la recherche et le thème. Sur téléphone et tablette : logo, recherche, menu, et le sélecteur de mode
 * en pleine largeur sous la barre (cahier des charges, section 7).
 */
export function BarreHaut() {
  const chemin = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const contexte = contexteDe(chemin);

  return (
    <header className="sticky top-0 z-barre shrink-0 border-b border-line bg-surface print:hidden">
      <div className="flex h-topbar items-center gap-2 px-4 lg:gap-4 lg:px-6">
        <Link href="/" className="flex min-h-cible items-center lg:hidden" aria-label="MbënnScan, vue générale">
          <Logo />
        </Link>

        <nav aria-label="Contexte de travail" className="hidden min-w-0 items-center gap-3 lg:flex">
          <p className="flex min-w-0 items-center gap-1.5 text-petit">
            <span className="text-ink-3">{contexte.mode}</span>
            <ChevronRight {...ICONE_PETITE} className="shrink-0 text-ink-3" aria-hidden />
            <span className="truncate font-semibold text-ink">{contexte.page}</span>
          </p>
          {(contexte.secteur || contexte.periode) && <span className="h-5 w-px bg-line" aria-hidden />}
          {contexte.secteur && (
            <span className="puce min-h-7 shrink-0 bg-surface-2">
              <MapPin {...ICONE_PETITE} className="text-ink-3" aria-hidden />
              <span className="sr-only">Secteur : </span>
              {contexte.secteur}
            </span>
          )}
          {contexte.periode && (
            <span className="puce min-h-7 hidden shrink-0 bg-surface-2 xl:inline-flex">
              <CalendarRange {...ICONE_PETITE} className="text-ink-3" aria-hidden />
              <span className="sr-only">Période : </span>
              {contexte.periode}
            </span>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:gap-2">
          <button
            type="button"
            onClick={ouvrirRecherche}
            className="hidden min-h-10 w-64 items-center gap-2 rounded-sm border border-line bg-surface-2 px-3 text-petit text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2 lg:flex"
          >
            <Search {...ICONE_PETITE} aria-hidden />
            <span className="flex-1 text-left">Rechercher une zone…</span>
            <kbd className="touche">Ctrl K</kbd>
          </button>
          <button
            type="button"
            onClick={ouvrirRecherche}
            aria-label="Rechercher une zone ou une page"
            className="inline-flex size-cible items-center justify-center rounded-sm text-ink-2 hover:bg-surface-3 hover:text-ink lg:hidden"
          >
            <Search {...ICONE} aria-hidden />
          </button>
          <span className="hidden lg:inline-flex">
            <BasculeTheme />
          </span>
          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={menu}
            className="inline-flex size-cible items-center justify-center rounded-sm text-ink-2 hover:bg-surface-3 hover:text-ink lg:hidden"
          >
            <Menu {...ICONE} aria-hidden />
          </button>
        </div>
      </div>
      {/* Sur téléphone et tablette, le sélecteur de mode passe sous la barre, en pleine largeur. */}
      <div className="px-4 pb-2 lg:hidden">
        <ControleSegmente
          libelle="Mode"
          segments={SEGMENTS}
          valeur={modeDe(chemin)}
          onChange={(m) => router.push(CHEMIN_MODE[m])}
        />
      </div>
      <MenuMobile ouvert={menu} onFermer={() => setMenu(false)} />
    </header>
  );
}
