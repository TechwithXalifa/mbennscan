"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Legende } from "@/components/carte/legende";
import { PanneauZones } from "@/components/carte/panneau-zones";
import { ListeZones } from "@/components/liste-zones";
import { getZones, USE_MOCKS } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { ZonesGeoJSON } from "@/types/contracts";

// MapLibre est chargé à part pour garder un JavaScript initial léger.
const CarteZones = dynamic(() => import("@/components/carte/carte-zones"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-line" aria-label="Chargement de la carte" />,
});

type Etat = { statut: "chargement" } | { statut: "erreur"; message: string } | { statut: "ok"; zones: ZonesGeoJSON };

export function VueCarte() {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });
  const [selection, setSelection] = useState<string | null>(null);

  const charger = useCallback(() => {
    setEtat({ statut: "chargement" });
    getZones()
      .then((zones) => setEtat({ statut: "ok", zones }))
      .catch((e: unknown) => setEtat({ statut: "erreur", message: e instanceof Error ? e.message : String(e) }));
  }, []);

  useEffect(charger, [charger]);

  const maj = etat.statut === "ok" ? etat.zones.features[0]?.properties.maj : undefined;
  const fraicheur = [maj && `Calcul du ${formatDate(maj)}`, USE_MOCKS && "données factices [FICTIF]"]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="relative flex-1">
        {etat.statut === "ok" && <CarteZones zones={etat.zones} selection={selection} onSelection={setSelection} />}
        {etat.statut === "chargement" && <div className="absolute inset-0 animate-pulse bg-line" aria-busy="true" />}
        {etat.statut === "erreur" && (
          <div role="alert" className="absolute inset-x-3 top-3 z-10 rounded-md bg-surface p-4 shadow-float">
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
        {etat.statut === "ok" && etat.zones.features.length === 0 && (
          <p className="absolute inset-x-3 top-3 z-10 rounded-md bg-surface p-4 shadow-float">
            Aucune zone calculée pour l&apos;instant.
          </p>
        )}
        <Legende />
        <p className="absolute left-3 right-14 top-3 z-10 w-fit rounded-sm bg-surface px-2 py-1 text-mention text-ink-2 shadow-float">
          {fraicheur || "Keur Massar · hivernages 2020-2026"}
        </p>
      </div>
      <PanneauZones sousTitre="Keur Massar · hivernages 2020-2026">
        {etat.statut === "ok" ? (
          <ListeZones
            zones={etat.zones.features.map((f) => f.properties)}
            selection={selection}
            onSelection={setSelection}
          />
        ) : (
          <ul className="space-y-2 py-2" aria-busy={etat.statut === "chargement"}>
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-cible animate-pulse rounded-sm bg-line" />
            ))}
          </ul>
        )}
      </PanneauZones>
    </>
  );
}
