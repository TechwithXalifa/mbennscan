"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const HAUTEURS = ["h-[140px]", "h-[50dvh]", "h-full"] as const;
const LIBELLES = ["Agrandir le panneau", "Afficher en plein écran", "Réduire le panneau"] as const;

/**
 * Colonne de 400 px à droite de la carte sur ordinateur ;
 * feuille du bas à trois hauteurs (aperçu, moitié, plein écran) sur mobile.
 * La poignée se tire au doigt ou se touche pour passer à la hauteur suivante.
 */
type Props = {
  titre: string;
  sousTitre?: React.ReactNode;
  /** Remplace l'en-tête (par exemple le bouton de retour quand une fiche est ouverte). */
  entete?: React.ReactNode;
  /** Quand cette clé change (zone choisie), la feuille du bas passe au moins à mi-hauteur. */
  ouvrirSur?: string | null;
  children: React.ReactNode;
};

export function PanneauZones({ titre, sousTitre, entete, ouvrirSur, children }: Props) {
  const [hauteur, setHauteur] = useState(0);
  const [glisse, setGlisse] = useState<number | null>(null);
  const depart = useRef<{ y: number; h: number; bouge: boolean } | null>(null);
  const sansClic = useRef(false);
  const panneau = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ouvrirSur) setHauteur((h) => (h === 0 ? 1 : h));
  }, [ouvrirSur]);

  function poser(e: React.PointerEvent<HTMLButtonElement>) {
    const parent = panneau.current?.parentElement;
    if (!panneau.current || !parent) return;
    depart.current = { y: e.clientY, h: panneau.current.offsetHeight, bouge: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function deplacer(e: React.PointerEvent<HTMLButtonElement>) {
    const d = depart.current;
    const parent = panneau.current?.parentElement;
    if (!d || !parent) return;
    const dy = d.y - e.clientY;
    if (!d.bouge && Math.abs(dy) < 6) return;
    d.bouge = true;
    setGlisse(Math.min(parent.clientHeight, Math.max(96, d.h + dy)));
  }

  function lacher() {
    const d = depart.current;
    const parent = panneau.current?.parentElement;
    depart.current = null;
    // Un simple toucher est traité par le clic (clavier et lecteurs d'écran compris).
    if (!d?.bouge || glisse === null || !parent) return;
    // Lâché après un glissement : la hauteur la plus proche parmi aperçu, moitié, plein écran.
    const cibles = [140, parent.clientHeight / 2, parent.clientHeight];
    const proche = cibles.reduce((m, c, i) => (Math.abs(c - glisse) < Math.abs(cibles[m] - glisse) ? i : m), 0);
    sansClic.current = true;
    setHauteur(proche);
    setGlisse(null);
  }

  function cliquer() {
    if (sansClic.current) {
      sansClic.current = false;
      return;
    }
    setHauteur((h) => (h + 1) % HAUTEURS.length);
  }

  return (
    <aside
      ref={panneau}
      aria-label={titre}
      data-apercu={hauteur === 0 && glisse === null}
      style={glisse !== null ? { height: glisse } : undefined}
      className={cn(
        "group verre absolute inset-x-0 bottom-0 z-panneau flex flex-col rounded-t-[20px] border-b-0",
        glisse === null && "transition-[height] [transition-duration:420ms] ease-ressort",
        glisse === null && HAUTEURS[hauteur],
        "lg:sans-verre lg:relative lg:inset-auto lg:!h-auto lg:w-panneau lg:shrink-0 lg:rounded-none lg:border-y-0 lg:border-l lg:border-r-0 lg:border-line",
        "print:static print:h-auto",
      )}
    >
      <button
        type="button"
        onClick={cliquer}
        onPointerDown={poser}
        onPointerMove={deplacer}
        onPointerUp={lacher}
        onPointerCancel={() => {
          depart.current = null;
          setGlisse(null);
        }}
        aria-label={LIBELLES[hauteur]}
        className="relative flex min-h-cible w-full shrink-0 touch-none items-center justify-center lg:hidden"
      >
        <span className="h-1 w-10 rounded-pill bg-line-strong opacity-60" aria-hidden />
        <ChevronUp
          size={20}
          strokeWidth={1.75}
          className={cn(
            "absolute right-3 text-ink-2 transition-transform duration-etat",
            hauteur === 2 && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {entete ?? (
        <header className="px-4 lg:pt-5">
          <h2 className="text-titre2">{titre}</h2>
          {sousTitre && (
            <div className="text-petit text-ink-2 group-data-[apercu=true]:hidden lg:group-data-[apercu=true]:block">
              {sousTitre}
            </div>
          )}
        </header>
      )}
      <div
        className={cn(
          // « relative » : les textes réservés aux lecteurs d'écran restent dans la zone qui défile
          // au lieu d'allonger la page.
          "relative min-h-0 flex-1 px-4 pb-4",
          hauteur === 0 && glisse === null ? "overflow-hidden" : "overflow-y-auto",
          "lg:overflow-y-auto",
        )}
      >
        {children}
      </div>
    </aside>
  );
}
