"use client";

import { RotateCcw } from "lucide-react";
import { ChampRecherche, Selection } from "@/components/ui/champ";
import { Pastille } from "@/components/ui/pastille";
import { SymbolePriorite } from "@/components/zone/badges";
import { ICONE_PETITE } from "@/lib/design";
import { CONFIANCES, LIBELLE_CONFIANCE, LIBELLE_PRIORITE_COURT, PRIORITES } from "@/lib/priorite";
import type { Confiance, Priorite, ZoneSynthese } from "@/types/contracts";

export type Filtres = { recherche: string; priorites: Priorite[]; commune: string; confiance: Confiance | "" };
export const FILTRES_VIDES: Filtres = { recherche: "", priorites: [], commune: "", confiance: "" };

/** Sans accents ni majuscules, sans la marque [FICTIF] : « medina » trouve « Médina Gounass ». */
export function normaliser(t: string): string {
  return t
    .replace(/^\[FICTIF\]\s*/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export const actifs = (f: Filtres) => Boolean(f.recherche || f.priorites.length || f.commune || f.confiance);

/** Zones qui passent tous les filtres. */
export function filtrer(zones: ZoneSynthese[], f: Filtres): ZoneSynthese[] {
  const q = normaliser(f.recherche.trim());
  return zones
    .filter((z) => !q || normaliser(z.nom).includes(q) || normaliser(z.commune).includes(q))
    .filter((z) => f.priorites.length === 0 || f.priorites.includes(z.priorite))
    .filter((z) => !f.commune || z.commune === f.commune)
    .filter((z) => !f.confiance || z.confiance === f.confiance);
}

/** Recherche, commune, confiance et priorité, avec « Réinitialiser » dès qu'un filtre est actif. */
export function FiltresZones({
  filtres: f,
  onChange,
  communes,
}: {
  filtres: Filtres;
  onChange: (f: Filtres) => void;
  communes: string[];
}) {
  const maj = (p: Partial<Filtres>) => onChange({ ...f, ...p });
  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface p-4 shadow-1">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_200px_180px]">
        <ChampRecherche
          className="col-span-2 sm:col-span-1"
          aria-label="Rechercher une zone ou une commune"
          placeholder="Zone ou commune…"
          value={f.recherche}
          onChange={(e) => maj({ recherche: e.target.value })}
          onEffacer={() => maj({ recherche: "" })}
        />
        <Selection aria-label="Commune" value={f.commune} onChange={(e) => maj({ commune: e.target.value })}>
          <option value="">Toute commune</option>
          {communes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Selection>
        <Selection
          aria-label="Confiance de la mesure"
          value={f.confiance}
          onChange={(e) => maj({ confiance: e.target.value as Confiance | "" })}
        >
          <option value="">Toute confiance</option>
          {CONFIANCES.map((c) => (
            <option key={c} value={c}>
              Confiance {LIBELLE_CONFIANCE[c].toLowerCase()}
            </option>
          ))}
        </Selection>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par priorité">
        <span className="mr-1 text-petit text-ink-2">Priorité :</span>
        {PRIORITES.map((p) => (
          <Pastille
            key={p}
            active={f.priorites.includes(p)}
            onClick={() =>
              maj({ priorites: f.priorites.includes(p) ? f.priorites.filter((x) => x !== p) : [...f.priorites, p] })
            }
          >
            <SymbolePriorite priorite={p} className="mr-1.5 group-aria-pressed:hidden" />
            {LIBELLE_PRIORITE_COURT[p]}
          </Pastille>
        ))}
        {actifs(f) && (
          <button
            type="button"
            onClick={() => onChange(FILTRES_VIDES)}
            className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-sm px-2 text-petit font-medium text-primary-ink hover:bg-primary-soft [@media(pointer:coarse)]:min-h-cible"
          >
            <RotateCcw {...ICONE_PETITE} aria-hidden />
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </div>
  );
}
