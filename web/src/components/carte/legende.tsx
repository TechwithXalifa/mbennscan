"use client";

import { Layers, X } from "lucide-react";
import { useState } from "react";
import { FOND_PRIORITE, LIBELLE_PRIORITE } from "@/lib/priorite";
import type { Priorite } from "@/types/contracts";

const PRIORITES: Priorite[] = ["forte", "moyenne", "faible", "nulle"];

/** Légende en bas à gauche ; repliée en pastille « Légende » sur mobile. */
export function Legende() {
  const [ouverte, setOuverte] = useState(false);

  return (
    <div className="absolute bottom-8 left-3 z-10">
      <button
        type="button"
        onClick={() => setOuverte(true)}
        className={`${ouverte ? "hidden" : "inline-flex"} min-h-cible items-center gap-2 rounded-pill bg-surface px-4 shadow-float lg:hidden`}
      >
        <Layers size={20} strokeWidth={1.75} aria-hidden />
        Légende
      </button>

      <section
        aria-label="Légende"
        className={`${ouverte ? "block" : "hidden"} w-64 rounded-md bg-surface p-3 shadow-float lg:block`}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-titre3">Habitants-jours sous l&apos;eau</h2>
          <button
            type="button"
            onClick={() => setOuverte(false)}
            aria-label="Fermer la légende"
            className="-m-2 inline-flex size-cible items-center justify-center lg:hidden"
          >
            <X size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <ul className="mt-2 space-y-1 text-petit">
          {PRIORITES.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span className={`size-3 rounded-sm opacity-60 ${FOND_PRIORITE[p]}`} aria-hidden />
              {LIBELLE_PRIORITE[p]}
            </li>
          ))}
        </ul>
        <ul className="mt-3 space-y-1 border-t border-line pt-2 text-petit">
          <li className="flex items-center gap-2">
            <span
              className="size-3 rounded-sm border border-ink-2 bg-[repeating-linear-gradient(135deg,#475467_0_1px,transparent_1px_4px)]"
              aria-hidden
            />
            Confiance moyenne
          </li>
          <li className="flex items-center gap-2">
            <span
              className="size-3 rounded-sm border border-dashed border-ink bg-[repeating-linear-gradient(135deg,#101828_0_1.5px,transparent_1.5px_3px)]"
              aria-hidden
            />
            Confiance faible : à vérifier sur le terrain
          </li>
        </ul>
      </section>
    </div>
  );
}
