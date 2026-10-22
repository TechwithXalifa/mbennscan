"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListeUrgence } from "@/components/apres/liste-urgence";
import { PanneauZones } from "@/components/carte/panneau-zones";
import { getEvenements, getImpacts, getZones, USE_MOCKS } from "@/lib/data";
import { formatDate, formatNombre } from "@/lib/format";
import { surfaceHectares } from "@/lib/geo";
import type { Evenement, ImpactEvenement, ZonesGeoJSON } from "@/types/contracts";

const CarteZones = dynamic(() => import("@/components/carte/carte-zones"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-line" aria-label="Chargement de la carte" />,
});

type Donnees = { evenements: Evenement[]; impacts: ImpactEvenement[]; zones: ZonesGeoJSON };
type Etat = { statut: "chargement" } | { statut: "erreur"; message: string } | { statut: "ok"; d: Donnees };

const JOUR_MS = 86_400_000;

function libelleEpisode(e: Evenement): string {
  const pluie = e.pluie_mm === null ? "cumul non disponible" : `${formatNombre(e.pluie_mm)} mm`;
  return `${formatDate(e.date_pluie)} · ${pluie}${e.station && e.pluie_mm !== null ? ` à ${e.station}` : ""}`;
}

function fraicheur(e: Evenement): string {
  if (!e.date_image)
    return "Aucune image radar exploitable après cette pluie : pas de carte de l'eau pour cet épisode.";
  const jours = Math.round((Date.parse(e.date_image) - Date.parse(e.date_pluie)) / JOUR_MS);
  const ecart = jours <= 0 ? "le jour de la pluie" : `${jours} jour${jours > 1 ? "s" : ""} après la pluie`;
  return `Image radar du ${formatDate(e.date_image)}, ${ecart}. L'eau a pu baisser entre-temps.`;
}

function Chiffre({ valeur, intitule }: { valeur: string; intitule: string }) {
  return (
    <div>
      <p className="text-chiffre tabular-nums">{valeur}</p>
      <p className="text-petit text-ink-2">{intitule}</p>
    </div>
  );
}

export function VueApres({ evenementId }: { evenementId: number }) {
  const router = useRouter();
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });
  const [selection, setSelection] = useState<string | null>(null);

  const charger = useCallback(() => {
    setEtat({ statut: "chargement" });
    Promise.all([getEvenements(), getImpacts(evenementId), getZones()])
      .then(([evenements, impacts, zones]) => setEtat({ statut: "ok", d: { evenements, impacts, zones } }))
      .catch((e: unknown) => setEtat({ statut: "erreur", message: e instanceof Error ? e.message : String(e) }));
  }, [evenementId]);

  useEffect(charger, [charger]);

  const evenement = etat.statut === "ok" ? etat.d.evenements.find((e) => e.id === evenementId) : undefined;
  const impacts = etat.statut === "ok" ? etat.d.impacts : [];
  const habitants = impacts.reduce((s, i) => s + i.habitants_touches, 0);
  const ecoles = impacts.reduce((s, i) => s + i.ecoles_touchees, 0);
  const zonesParId = useMemo(
    () => new Map(etat.statut === "ok" ? etat.d.zones.features.map((f) => [f.properties.id, f.properties]) : []),
    [etat],
  );

  return (
    <>
      <div className="relative flex-1">
        {etat.statut === "ok" && (
          <CarteZones
            zones={etat.d.zones}
            mode="contour"
            eau={evenement?.eau_geojson ?? null}
            feuille="moitie"
            selection={selection}
            onSelection={(id) => impacts.some((i) => i.zone_id === id) && setSelection(id)}
          />
        )}
        {etat.statut === "chargement" && <div className="absolute inset-0 animate-pulse bg-line" aria-busy="true" />}
        {etat.statut === "erreur" && (
          <div role="alert" className="absolute inset-x-3 top-3 z-10 rounded-md bg-surface p-4 shadow-float">
            <p>Impossible de charger l&apos;épisode : {etat.message}</p>
            <button
              type="button"
              onClick={charger}
              className="mt-2 min-h-cible rounded-sm bg-primary px-4 text-surface hover:bg-primary-strong"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
      <PanneauZones
        sousTitre="Après une pluie"
        ouvrirSur={selection ?? String(evenementId)}
        entete={
          <header className="space-y-2 px-4 lg:pt-4">
            <h2 className="text-titre2">Après une pluie</h2>
            {etat.statut === "ok" && (
              <select
                aria-label="Épisode de pluie"
                value={evenementId}
                onChange={(e) => router.push(`/apres/${e.target.value}`)}
                className="min-h-cible w-full rounded-sm border border-line bg-surface px-2"
              >
                {etat.d.evenements.map((e) => (
                  <option key={e.id} value={e.id}>
                    {libelleEpisode(e)}
                  </option>
                ))}
              </select>
            )}
            {evenement && (
              <p className="rounded-sm bg-bg p-2 text-petit">
                {fraicheur(evenement)}
                {USE_MOCKS && " Données factices [FICTIF]."}
              </p>
            )}
          </header>
        }
      >
        {etat.statut === "ok" && !evenement && <p className="py-4">Épisode introuvable.</p>}
        {evenement && evenement.eau_geojson && (
          <div className="grid grid-cols-3 gap-2 py-3">
            <Chiffre
              valeur={`${formatNombre(Math.round(surfaceHectares(evenement.eau_geojson)))} ha`}
              intitule="en eau"
            />
            <Chiffre valeur={formatNombre(Math.round(habitants / 100) * 100)} intitule="habitants dans l'eau" />
            <Chiffre valeur={formatNombre(ecoles)} intitule={ecoles > 1 ? "écoles touchées" : "école touchée"} />
          </div>
        )}
        {evenement && evenement.eau_geojson && impacts.length === 0 && (
          <p>Aucune eau détectée dans les zones calculées sur cette image.</p>
        )}
        {evenement && evenement.eau_geojson && (
          <ListeUrgence impacts={impacts} zones={zonesParId} selection={selection} onSelection={setSelection} />
        )}
      </PanneauZones>
    </>
  );
}
