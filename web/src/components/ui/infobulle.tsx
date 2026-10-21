"use client";

import { Info } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { ICONE } from "@/lib/design";

/**
 * Bouton « i » qui ouvre une explication courte.
 * S'ouvre au clic ou au toucher (le survol n'existe pas sur téléphone), se ferme avec Échap ou un clic ailleurs.
 */
export function Infobulle({ libelle, children }: { libelle: string; children: React.ReactNode }) {
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
    <span ref={racine} className="relative inline-flex">
      <button
        type="button"
        aria-label={libelle}
        aria-expanded={ouverte}
        aria-controls={id}
        onClick={() => setOuverte((o) => !o)}
        className="-m-3 inline-flex size-cible items-center justify-center text-ink-2 hover:text-ink"
      >
        <Info {...ICONE} aria-hidden />
      </button>
      {ouverte && (
        <span
          id={id}
          role="note"
          className="absolute right-0 top-full z-infobulle mt-2 w-64 rounded-sm bg-ink p-3 text-petit text-on-color shadow-float"
        >
          {children}
        </span>
      )}
    </span>
  );
}
