"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export type Segment<T extends string> = { valeur: T; libelle: string };

/**
 * Contrôle segmenté (sélecteur de mode, bascule de graphique).
 * Groupe de boutons radio : flèches gauche / droite pour changer de segment.
 */
export function ControleSegmente<T extends string>({
  segments,
  valeur,
  onChange,
  libelle,
  className,
}: {
  segments: Segment<T>[];
  valeur: T;
  onChange: (valeur: T) => void;
  libelle: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function clavier(e: React.KeyboardEvent, i: number) {
    const pas = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!pas) return;
    e.preventDefault();
    const j = (i + pas + segments.length) % segments.length;
    onChange(segments[j].valeur);
    refs.current[j]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={libelle} className={cn("flex rounded-sm bg-bg p-0.5", className)}>
      {segments.map((s, i) => {
        const coche = s.valeur === valeur;
        return (
          <button
            key={s.valeur}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={coche}
            tabIndex={coche ? 0 : -1}
            onClick={() => onChange(s.valeur)}
            onKeyDown={(e) => clavier(e, i)}
            className={cn(
              "min-h-cible flex-1 whitespace-nowrap rounded-sm px-2 text-petit font-medium transition-colors sm:px-3",
              coche ? "bg-surface text-ink shadow-float" : "text-ink-2 hover:text-ink",
            )}
          >
            {s.libelle}
          </button>
        );
      })}
    </div>
  );
}
