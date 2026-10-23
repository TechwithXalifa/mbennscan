"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Bouton qui ouvre un petit panneau (couches de la carte, choix du thème).
 * Se ferme avec Échap (le focus revient au bouton) ou un clic ailleurs.
 */
export function Popover({
  libelle,
  contenuBouton,
  classeBouton,
  position = "bas-fin",
  className,
  children,
}: {
  /** Nom du bouton et du panneau pour les lecteurs d'écran */
  libelle: string;
  contenuBouton: React.ReactNode;
  classeBouton?: string;
  /** « gauche » : à gauche du bouton (barre d'outils de la carte) ; « bas-fin » : sous le bouton, aligné à droite */
  position?: "gauche" | "bas-fin" | "haut-debut";
  className?: string;
  children: React.ReactNode | ((fermer: () => void) => React.ReactNode);
}) {
  const [ouvert, setOuvert] = useState(false);
  const id = useId();
  const racine = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    const clavier = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOuvert(false);
      bouton.current?.focus();
    };
    const pointeur = (e: PointerEvent) => {
      if (!racine.current?.contains(e.target as Node)) setOuvert(false);
    };
    document.addEventListener("keydown", clavier);
    document.addEventListener("pointerdown", pointeur);
    return () => {
      document.removeEventListener("keydown", clavier);
      document.removeEventListener("pointerdown", pointeur);
    };
  }, [ouvert]);

  const fermer = () => setOuvert(false);

  return (
    <div ref={racine} className="relative">
      <button
        ref={bouton}
        type="button"
        aria-label={libelle}
        title={libelle}
        aria-expanded={ouvert}
        aria-controls={id}
        aria-haspopup="dialog"
        onClick={() => setOuvert((o) => !o)}
        className={classeBouton}
      >
        {contenuBouton}
      </button>
      {ouvert && (
        <div
          id={id}
          role="dialog"
          aria-label={libelle}
          className={cn(
            "apparition absolute z-infobulle min-w-60 rounded-lg border border-line bg-surface p-3 text-ink shadow-pop",
            position === "gauche" && "right-full top-0 mr-2 origin-top-right",
            position === "bas-fin" && "right-0 top-full mt-2 origin-top-right",
            position === "haut-debut" && "bottom-full left-0 mb-2 origin-bottom-left",
            className,
          )}
        >
          {typeof children === "function" ? children(fermer) : children}
        </div>
      )}
    </div>
  );
}
