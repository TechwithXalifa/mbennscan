"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const FOCALISABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Fenêtre modale : menu mobile (tiroir à gauche) ou palette de recherche (au centre).
 * Le focus reste dans la fenêtre, Échap la ferme et le focus revient là où il était.
 */
export function Dialogue({
  ouvert,
  onFermer,
  titre,
  variante = "centre",
  initial,
  className,
  children,
}: {
  ouvert: boolean;
  onFermer: () => void;
  /** Nom de la fenêtre pour les lecteurs d'écran */
  titre: string;
  variante?: "centre" | "tiroir";
  /** Élément à focaliser à l'ouverture (sinon le premier élément focalisable) */
  initial?: React.RefObject<HTMLElement>;
  className?: string;
  children: React.ReactNode;
}) {
  const panneau = useRef<HTMLDivElement>(null);
  const rappel = useRef(onFermer);
  rappel.current = onFermer;

  useEffect(() => {
    if (!ouvert) return;
    const precedent = document.activeElement as HTMLElement | null;
    const cible = initial?.current ?? panneau.current?.querySelector<HTMLElement>(FOCALISABLES);
    cible?.focus();

    const clavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        rappel.current();
        return;
      }
      if (e.key !== "Tab" || !panneau.current) return;
      const elements = Array.from(panneau.current.querySelectorAll<HTMLElement>(FOCALISABLES)).filter(
        (el) => el.offsetParent !== null,
      );
      if (elements.length === 0) return;
      const premier = elements[0];
      const dernier = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };
    document.addEventListener("keydown", clavier);
    return () => {
      document.removeEventListener("keydown", clavier);
      precedent?.focus?.();
    };
  }, [ouvert, initial]);

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-dialogue print:hidden">
      <div className="entree-fondu absolute inset-0 bg-[rgba(8,14,24,0.48)]" aria-hidden onClick={onFermer} />
      <div
        ref={panneau}
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        className={cn(
          "absolute flex flex-col border border-line bg-surface text-ink shadow-pop",
          variante === "centre" &&
            "entree-bas inset-x-3 top-[10dvh] mx-auto max-h-[75dvh] max-w-xl overflow-hidden rounded-lg",
          variante === "tiroir" && "entree-gauche inset-y-0 left-0 w-[min(320px,86vw)] rounded-r-lg",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
