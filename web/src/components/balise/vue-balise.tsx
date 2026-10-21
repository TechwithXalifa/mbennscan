"use client";

import { useCallback, useEffect, useState } from "react";
import { Jauge } from "@/components/balise/jauge";
import { abonnerMesures, getBalise, getMesures, USE_MOCKS } from "@/lib/data";
import { formatDepuis, formatNombre } from "@/lib/format";
import type { Balise, Mesure } from "@/types/contracts";

// Balise muette au-delà de 2 minutes (cahier des charges, section 6).
const MUETTE_APRES_S = 120;

type Etat =
  | { statut: "chargement" }
  | { statut: "erreur"; message: string }
  | { statut: "inconnue" }
  | { statut: "ok"; balise: Balise };

export function VueBalise({ id }: { id: string }) {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });
  const [derniere, setDerniere] = useState<Mesure | null>(null);
  const [maintenant, setMaintenant] = useState(() => Date.now());

  const charger = useCallback(() => {
    setEtat({ statut: "chargement" });
    Promise.all([getBalise(id), getMesures(id, 1)])
      .then(([balise, mesures]) => {
        setEtat(balise ? { statut: "ok", balise } : { statut: "inconnue" });
        setDerniere(mesures[0] ?? null);
      })
      .catch((e: unknown) => setEtat({ statut: "erreur", message: e instanceof Error ? e.message : String(e) }));
  }, [id]);

  useEffect(charger, [charger]);
  // Après une coupure, la file arrive dans le désordre : on ne garde que la mesure la plus récente.
  useEffect(
    () =>
      abonnerMesures(id, (m) => setDerniere((prev) => (!prev || Date.parse(m.ts) > Date.parse(prev.ts) ? m : prev))),
    [id],
  );
  useEffect(() => {
    const t = setInterval(() => setMaintenant(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (etat.statut === "chargement") {
    return <div className="mx-auto h-80 w-full max-w-sm animate-pulse rounded-md bg-line" aria-busy="true" />;
  }
  if (etat.statut === "erreur") {
    return (
      <div role="alert" className="rounded-md bg-surface p-4">
        <p>Impossible de charger la balise : {etat.message}</p>
        <button
          type="button"
          onClick={charger}
          className="mt-2 min-h-cible rounded-sm bg-primary px-4 text-surface hover:bg-primary-strong"
        >
          Réessayer
        </button>
      </div>
    );
  }
  if (etat.statut === "inconnue") return <p className="rounded-md bg-surface p-4">Balise « {id} » introuvable.</p>;

  const { balise } = etat;
  const ecartS = derniere ? Math.max(0, (maintenant - Date.parse(derniere.ts)) / 1000) : null;
  const enLigne = ecartS !== null && ecartS <= MUETTE_APRES_S;
  const brut = derniere?.niveau_cm ?? null;
  const niveau = brut === null ? null : Math.max(0, brut);
  const depasse = niveau !== null && balise.seuil_alerte_cm !== null && niveau >= balise.seuil_alerte_cm;

  return (
    <section className="mx-auto max-w-sm rounded-md bg-surface p-4">
      <h1 className="text-titre1">{balise.nom}</h1>
      <p className="flex items-center gap-2 text-petit text-ink-2">
        <span className={`size-2.5 rounded-pill ${enLigne ? "bg-ok" : "bg-off"}`} aria-hidden />
        {ecartS === null
          ? "Aucune mesure reçue"
          : `${enLigne ? "En ligne · mis à jour" : "Dernière mesure"} ${formatDepuis(ecartS)}`}
      </p>

      <div className="mt-6 flex items-end justify-center gap-6">
        <Jauge niveauCm={niveau ?? 0} hauteurCm={balise.hauteur_capteur_cm} seuilCm={balise.seuil_alerte_cm} />
        <div>
          <p className="text-[56px] font-semibold leading-none tabular-nums">
            {niveau === null ? "–" : formatNombre(Math.round(niveau))}
            <span className="text-titre2"> cm</span>
          </p>
          <p className="text-petit text-ink-2">d&apos;eau dans le bac</p>
          {depasse && <p className="mt-2 font-semibold text-prio-high">Seuil dépassé</p>}
        </div>
      </div>

      {brut !== null && brut < 0 && (
        <p className="mt-4 text-petit text-ink-2">Mesure anormale : balise à réétalonner (niveau affiché à 0).</p>
      )}
      {USE_MOCKS && (
        <p className="mt-4 text-mention text-ink-2">Données factices [FICTIF] : pas de mesure en direct.</p>
      )}
    </section>
  );
}
