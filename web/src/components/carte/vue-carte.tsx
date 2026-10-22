"use client";

import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Legende } from "@/components/carte/legende";
import { PanneauZones } from "@/components/carte/panneau-zones";
import { ListeZones } from "@/components/liste-zones";
import { ChargeurGoutte } from "@/components/ui/chargeur-goutte";
import { Squelette } from "@/components/ui/squelette";
import { getZones, USE_MOCKS } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { ZonesGeoJSON } from "@/types/contracts";

// MapLibre est chargé à part pour garder un JavaScript initial léger.
const CarteZones = dynamic(() => import("@/components/carte/carte-zones"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-bg">
      <ChargeurGoutte libelle="Chargement de la carte" />
    </div>
  ),
});

// La fiche n'est chargée qu'au premier clic sur une zone.
const FicheZone = dynamic(() => import("@/components/zone/fiche-zone").then((m) => m.FicheZone));

type Etat = { statut: "chargement" } | { statut: "erreur"; message: string } | { statut: "ok"; zones: ZonesGeoJSON };

export function VueCarte() {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });
  const [selection, setSelection] = useState<string | null>(null);
  const [zoneAnimee, setZoneAnimee] = useState<string | null>(null);

  // La ligne de la liste s'agrandit jusqu'à la fiche (View Transitions), et la fiche s'y replie au retour.
  const choisir = useCallback((id: string | null) => {
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSelection(id);
      return;
    }
    if (id) flushSync(() => setZoneAnimee(id));
    document.startViewTransition(() => flushSync(() => setSelection(id)));
  }, []);

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
        {etat.statut === "ok" && <CarteZones zones={etat.zones} selection={selection} onSelection={choisir} />}
        {etat.statut === "chargement" && (
          <div className="absolute inset-0 grid place-items-center bg-bg" aria-busy="true">
            <ChargeurGoutte libelle="Chargement des zones" />
          </div>
        )}
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
        <p className="verre absolute left-3 right-14 top-3 z-10 w-fit rounded-sm px-2 py-1 text-mention text-ink-2">
          {fraicheur || "Keur Massar · hivernages 2020-2026"}
        </p>
      </div>
      <PanneauZones
        sousTitre="Keur Massar · hivernages 2020-2026"
        ouvrirSur={selection}
        entete={
          selection && (
            <button
              type="button"
              onClick={() => choisir(null)}
              className="mx-4 inline-flex min-h-cible items-center gap-2 text-primary lg:mt-2"
            >
              <ArrowLeft size={20} strokeWidth={1.75} aria-hidden />
              Zones à traiter en premier
            </button>
          )
        }
      >
        {selection ? (
          <div style={{ viewTransitionName: "fiche" }}>
            <FicheZone key={selection} id={selection} />
          </div>
        ) : etat.statut === "ok" ? (
          <ListeZones
            zones={etat.zones.features.map((f) => f.properties)}
            selection={selection}
            onSelection={choisir}
            zoneAnimee={zoneAnimee}
          />
        ) : (
          <ul className="space-y-2 py-2" aria-busy={etat.statut === "chargement"}>
            {[0, 1, 2].map((i) => (
              <li key={i}>
                <Squelette className="h-cible" />
              </li>
            ))}
          </ul>
        )}
      </PanneauZones>
    </>
  );
}
