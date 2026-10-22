"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type Segment<T extends string> = { valeur: T; libelle: string };

/**
 * Contrôle segmenté (sélecteur de mode, bascule de graphique).
 * Groupe de boutons radio : flèches gauche / droite pour changer de segment.
 * Un curseur glisse sous le segment choisi, avec un reflet qui suit le doigt.
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
  const groupe = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [curseur, setCurseur] = useState<{ x: number; largeur: number } | null>(null);
  const actif = segments.findIndex((s) => s.valeur === valeur);

  useLayoutEffect(() => {
    const placer = () => {
      const b = refs.current[actif];
      if (b) setCurseur({ x: b.offsetLeft, largeur: b.offsetWidth });
    };
    placer();
    const observateur = new ResizeObserver(placer);
    if (groupe.current) observateur.observe(groupe.current);
    return () => observateur.disconnect();
  }, [actif, segments.length]);

  function clavier(e: React.KeyboardEvent, i: number) {
    const pas = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!pas) return;
    e.preventDefault();
    const j = (i + pas + segments.length) % segments.length;
    onChange(segments[j].valeur);
    refs.current[j]?.focus();
  }

  function reflet(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--reflet-x", `${e.clientX - r.left - (curseur?.x ?? 0)}px`);
    e.currentTarget.style.setProperty("--reflet-y", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={groupe}
      role="radiogroup"
      aria-label={libelle}
      onPointerMove={reflet}
      className={cn("relative flex rounded-sm bg-bg p-0.5", className)}
    >
      {curseur && (
        <span
          aria-hidden
          className="reflet-liquide absolute inset-y-0.5 left-0 rounded-sm bg-surface shadow-float transition-[transform,width] duration-etat ease-ressort"
          style={{ width: curseur.largeur, transform: `translateX(${curseur.x}px)` }}
        />
      )}
      {segments.map((s, i) => {
        const coche = i === actif;
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
              "relative min-h-cible flex-1 whitespace-nowrap rounded-sm px-2 text-petit font-medium transition-colors duration-etat sm:px-3",
              coche ? "text-ink" : "text-ink-2 hover:text-ink",
              // Avant la première mesure (rendu serveur), le segment choisi porte lui-même le fond.
              coche && !curseur && "bg-surface shadow-float",
            )}
          >
            {s.libelle}
          </button>
        );
      })}
    </div>
  );
}
