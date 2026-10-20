"use client";

import { useCallback, useEffect, useState } from "react";
import { getZones, USE_MOCKS } from "@/lib/data";
import { formatDate, formatNombre } from "@/lib/format";
import type { Priorite, ZoneSynthese } from "@/types/contracts";

const LIBELLE_PRIORITE: Record<Priorite, string> = {
  forte: "Priorité forte",
  moyenne: "Priorité moyenne",
  faible: "Priorité faible",
  nulle: "Pas d'eau observée",
};

const COULEUR_PRIORITE: Record<Priorite, string> = {
  forte: "bg-prio-high",
  moyenne: "bg-prio-mid",
  faible: "bg-prio-low",
  nulle: "bg-prio-none",
};

type Etat = { statut: "chargement" } | { statut: "erreur"; message: string } | { statut: "ok"; zones: ZoneSynthese[] };

export function ListeZones() {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });

  const charger = useCallback(() => {
    setEtat({ statut: "chargement" });
    getZones()
      .then((geo) => {
        const zones = geo.features
          .map((f) => f.properties)
          .filter((z) => z.rang !== null)
          .sort((a, b) => (a.rang ?? 0) - (b.rang ?? 0))
          .slice(0, 10);
        setEtat({ statut: "ok", zones });
      })
      .catch((e: unknown) => setEtat({ statut: "erreur", message: e instanceof Error ? e.message : String(e) }));
  }, []);

  useEffect(charger, [charger]);

  return (
    <section className="mt-6 rounded-md border border-line bg-surface p-4">
      <h2 className="text-titre2">Zones à traiter en premier</h2>
      <p className="text-petit text-ink-2">Source : {USE_MOCKS ? "données factices [FICTIF]" : "Supabase"}</p>

      {etat.statut === "chargement" && (
        <ul className="mt-4 space-y-2" aria-busy="true" aria-label="Chargement des zones">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-cible animate-pulse rounded-sm bg-line" />
          ))}
        </ul>
      )}

      {etat.statut === "erreur" && (
        <div className="mt-4" role="alert">
          <p>Impossible de charger les zones : {etat.message}</p>
          <button
            type="button"
            onClick={charger}
            className="mt-2 min-h-cible rounded-sm bg-primary px-4 text-surface hover:bg-primary-strong"
          >
            Réessayer
          </button>
        </div>
      )}

      {etat.statut === "ok" && etat.zones.length === 0 && (
        <p className="mt-4">Aucune eau détectée dans les zones calculées.</p>
      )}

      {etat.statut === "ok" && etat.zones.length > 0 && (
        <>
          <ol className="mt-4 divide-y divide-line">
            {etat.zones.map((z) => (
              <li key={z.id} className="flex min-h-cible items-center gap-3 py-2">
                <span className="w-6 text-right tabular-nums text-ink-2">{z.rang}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{z.nom}</p>
                  <p className="text-petit text-ink-2">{z.commune}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 text-petit">
                    <span className={`size-2 rounded-pill ${COULEUR_PRIORITE[z.priorite]}`} aria-hidden />
                    {LIBELLE_PRIORITE[z.priorite]}
                  </span>
                  <p className="text-petit tabular-nums text-ink-2">
                    {formatNombre(Math.round(z.habitants_jours_an))} hab.-jours/an
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-mention text-ink-2">Calcul du {formatDate(etat.zones[0].maj)}</p>
        </>
      )}
    </section>
  );
}
