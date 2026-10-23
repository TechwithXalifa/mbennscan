"use client";

import { ChevronDown, Layers, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { SymbolePriorite } from "@/components/zone/badges";
import { ICONE_PETITE } from "@/lib/design";
import { formatNombre } from "@/lib/format";
import { FOND_PRIORITE, LIBELLE_PRIORITE, PRIORITES } from "@/lib/priorite";
import { cn } from "@/lib/utils";
import type { Priorite } from "@/types/contracts";

type Props = {
  /** « priorite » : zones colorées, filtrables ; « eau » : écran Après une pluie */
  variante?: "priorite" | "eau";
  /** Nombre de zones par niveau, pour que le filtre dise ce qu'il cache */
  comptes?: Partial<Record<Priorite, number>>;
  masquees?: Priorite[];
  onMasquees?: (masquees: Priorite[]) => void;
  className?: string;
};

/**
 * Légende de la carte, qui sert aussi de filtre : un niveau de priorité se masque d'un clic.
 * Posée en bas à gauche ; repliée en pastille « Légende » sur mobile et sur les écrans peu hauts.
 * La priorité (couleur et forme) et la confiance (hachures) sont deux dimensions séparées.
 */
export function Legende({ variante = "priorite", comptes = {}, masquees = [], onMasquees, className }: Props) {
  const [ouverte, setOuverte] = useState(false);
  // Ouverte d'emblée seulement si l'écran laisse assez de carte autour (ordinateur assez haut).
  useEffect(() => setOuverte(matchMedia("(min-width: 1024px) and (min-height: 820px)").matches), []);
  const filtrable = variante === "priorite" && Boolean(onMasquees);

  function basculer(p: Priorite) {
    if (!onMasquees) return;
    onMasquees(masquees.includes(p) ? masquees.filter((m) => m !== p) : [...masquees, p]);
  }

  return (
    <div className={cn("absolute bottom-[152px] left-3 z-controle print:hidden lg:bottom-10", className)}>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        aria-expanded={ouverte}
        className={cn(
          ouverte ? "hidden" : "inline-flex",
          "verre min-h-cible items-center gap-2 rounded-pill px-4 text-petit font-medium",
        )}
      >
        <Layers {...ICONE_PETITE} aria-hidden />
        Légende
        {masquees.length > 0 && (
          <span className="rounded-pill bg-primary px-1.5 text-mention text-on-color">{masquees.length}</span>
        )}
      </button>

      <section
        aria-label="Légende de la carte"
        className={cn(ouverte ? "block" : "hidden", "verre apparition w-72 origin-bottom-left rounded-lg p-3")}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-petit font-semibold text-ink">
              {variante === "priorite" ? "Priorité d'intervention" : "Après la pluie"}
            </h2>
            <p className="text-mention font-normal text-ink-3">
              {variante === "priorite" ? "Habitants-jours sous l'eau, 2020-2026" : "Image radar de l'épisode"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOuverte(false)}
            aria-label="Replier la légende"
            className="-m-2 inline-flex size-cible shrink-0 items-center justify-center rounded-sm text-ink-2 hover:text-ink"
          >
            <ChevronDown {...ICONE_PETITE} aria-hidden />
          </button>
        </div>

        {variante === "priorite" ? (
          <ul
            className="mt-2 space-y-0.5"
            aria-label={filtrable ? "Niveaux affichés (cliquer pour masquer)" : undefined}
          >
            {PRIORITES.map((p) => {
              const visible = !masquees.includes(p);
              const contenu = (
                <>
                  <span
                    className={cn(
                      "inline-flex size-5 shrink-0 items-center justify-center rounded-[5px]",
                      FOND_PRIORITE[p],
                      visible ? "opacity-100" : "opacity-30",
                    )}
                    aria-hidden
                  >
                    <SymbolePriorite priorite={p} surCouleur className="size-2.5" />
                  </span>
                  <span className={cn("flex-1 text-left", !visible && "text-ink-3 line-through")}>
                    {LIBELLE_PRIORITE[p]}
                  </span>
                  {comptes[p] !== undefined && (
                    <span className="tabular-nums text-ink-3">
                      {formatNombre(comptes[p]!)}
                      <span className="sr-only"> zones</span>
                    </span>
                  )}
                </>
              );
              return (
                <li key={p}>
                  {filtrable ? (
                    <button
                      type="button"
                      aria-pressed={visible}
                      onClick={() => basculer(p)}
                      className="flex min-h-8 w-full items-center gap-2 rounded-sm px-1.5 text-petit transition-colors hover:bg-surface-3 [@media(pointer:coarse)]:min-h-cible"
                    >
                      {contenu}
                    </button>
                  ) : (
                    <span className="flex min-h-8 items-center gap-2 px-1.5 text-petit">{contenu}</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="mt-2 space-y-1.5 text-petit">
            <li className="flex items-center gap-2 px-1.5">
              <span
                className="size-4 shrink-0 rounded-[4px] border border-water-line bg-water opacity-eau"
                aria-hidden
              />
              Eau détectée par le radar
            </li>
            <li className="flex items-center gap-2 px-1.5">
              <span className="size-4 shrink-0 rounded-[4px] border border-ink-2" aria-hidden />
              Contour d&apos;une zone calculée
            </li>
          </ul>
        )}

        <div className="mt-2 border-t border-line pt-2">
          <p className="px-1.5 text-mention text-ink-3">Confiance de la mesure</p>
          <ul className="mt-1 space-y-1 text-petit">
            <li className="flex items-center gap-2 px-1.5">
              <span className="hachures-moyenne size-4 shrink-0 rounded-[4px] border border-ink-2" aria-hidden />
              Moyenne
            </li>
            <li className="flex items-center gap-2 px-1.5">
              <span
                className="hachures-faible size-4 shrink-0 rounded-[4px] border border-dashed border-ink"
                aria-hidden
              />
              Faible : à vérifier sur le terrain
            </li>
          </ul>
        </div>

        {filtrable && masquees.length > 0 && (
          <button
            type="button"
            onClick={() => onMasquees?.([])}
            className="mt-2 flex min-h-8 w-full items-center justify-center gap-1.5 rounded-sm border border-line text-petit font-medium text-primary-ink hover:bg-primary-soft [@media(pointer:coarse)]:min-h-cible"
          >
            <RotateCcw {...ICONE_PETITE} aria-hidden />
            Tout afficher
          </button>
        )}
      </section>
    </div>
  );
}
