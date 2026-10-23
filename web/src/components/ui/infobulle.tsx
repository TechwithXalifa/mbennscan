"use client";

import { Info } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { ICONE_PETITE } from "@/lib/design";
import { cn } from "@/lib/utils";

/**
 * Bouton « i » qui ouvre une explication courte.
 * S'ouvre au clic ou au toucher (le survol n'existe pas sur téléphone), se ferme avec Échap ou un clic ailleurs.
 * `cote` : bord de l'écran duquel l'infobulle s'éloigne (« fin » l'aligne à droite du bouton).
 */
export function Infobulle({
  libelle,
  children,
  cote = "fin",
}: {
  libelle: string;
  children: React.ReactNode;
  cote?: "debut" | "fin";
}) {
  const [ouverte, setOuverte] = useState(false);
  const id = useId();
  const racine = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ouverte) return;
    const fermer = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !racine.current?.contains(e.target as Node)) {
        setOuverte(false);
      }
    };
    document.addEventListener("keydown", fermer);
    document.addEventListener("pointerdown", fermer);
    return () => {
      document.removeEventListener("keydown", fermer);
      document.removeEventListener("pointerdown", fermer);
    };
  }, [ouverte]);

  return (
    <span ref={racine} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={libelle}
        aria-expanded={ouverte}
        aria-controls={id}
        onClick={() => setOuverte((o) => !o)}
        className="-m-3 inline-flex size-cible items-center justify-center rounded-pill text-ink-3 transition-colors hover:text-ink aria-expanded:text-primary-ink"
      >
        <Info {...ICONE_PETITE} aria-hidden />
      </button>
      {ouverte && (
        <span
          id={id}
          role="note"
          className={cn(
            "apparition absolute top-full z-infobulle mt-3 w-64 rounded-md bg-inverse p-3 text-left text-petit font-normal normal-case tracking-normal text-inverse-ink shadow-pop",
            cote === "fin" ? "right-0 origin-top-right" : "left-0 origin-top-left",
          )}
        >
          {children}
        </span>
      )}
    </span>
  );
}
