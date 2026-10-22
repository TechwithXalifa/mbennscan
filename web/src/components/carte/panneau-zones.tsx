"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const HAUTEURS = ["h-[140px]", "h-[50dvh]", "h-full"] as const;
const LIBELLES = ["Agrandir la liste", "Afficher en plein écran", "Réduire la liste"] as const;

/**
 * Colonne de 400 px à droite de la carte sur ordinateur ;
 * feuille du bas à trois hauteurs (aperçu, moitié, plein écran) sur mobile.
 */
type Props = {
  sousTitre: string;
  /** Remplace le titre de la liste (par exemple le bouton de retour quand une fiche est ouverte). */
  entete?: React.ReactNode;
  /** Quand cette clé change (zone choisie), la feuille du bas passe au moins à mi-hauteur. */
  ouvrirSur?: string | null;
  children: React.ReactNode;
};

export function PanneauZones({ sousTitre, entete, ouvrirSur, children }: Props) {
  const [hauteur, setHauteur] = useState(0);

  useEffect(() => {
    if (ouvrirSur) setHauteur((h) => (h === 0 ? 1 : h));
  }, [ouvrirSur]);

  return (
    <aside
      aria-label="Zones à traiter en premier"
      data-apercu={hauteur === 0}
      className={`group absolute inset-x-0 bottom-0 z-20 verre flex flex-col rounded-t-md border-b-0 transition-[height] ${HAUTEURS[hauteur]} lg:sans-verre lg:static lg:h-auto lg:w-[400px] lg:shrink-0 lg:rounded-none lg:border-y-0 lg:border-l lg:border-r-0 lg:border-line`}
    >
      <button
        type="button"
        onClick={() => setHauteur((h) => (h + 1) % HAUTEURS.length)}
        aria-label={LIBELLES[hauteur]}
        className="relative flex min-h-cible w-full items-center justify-center lg:hidden"
      >
        <span className="h-1 w-10 rounded-pill bg-line" aria-hidden />
        <ChevronUp
          size={20}
          strokeWidth={1.75}
          className={`absolute right-3 text-ink-2 ${hauteur === 2 ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {entete ?? (
        <header className="px-4 lg:pt-4">
          <h2 className="text-titre2">
            <span className="lg:hidden">10 zones à traiter en premier</span>
            <span className="hidden lg:inline">Zones à traiter en premier</span>
          </h2>
          <p className="text-petit text-ink-2 group-data-[apercu=true]:hidden lg:group-data-[apercu=true]:block">
            {sousTitre}
          </p>
        </header>
      )}
      <div
        className={`min-h-0 flex-1 px-4 pb-4 ${hauteur === 0 ? "overflow-hidden" : "overflow-y-auto"} lg:overflow-y-auto`}
      >
        {children}
      </div>
    </aside>
  );
}
