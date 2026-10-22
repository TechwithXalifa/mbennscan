"use client";

import { Maximize2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Jauge } from "@/components/balise/jauge";
import { abonnerMesures, getBalise, getMesures, USE_MOCKS } from "@/lib/data";
import { formatDepuis, formatNombre } from "@/lib/format";
import { ICONE } from "@/lib/design";
import type { Balise, Mesure } from "@/types/contracts";

const CourbeNiveau = dynamic(() => import("@/components/balise/courbe-niveau"), {
  ssr: false,
  loading: () => <div className="mt-6 h-52 animate-pulse rounded-sm bg-line" />,
});

// Balise muette au-delà de 2 minutes (cahier des charges, section 6).
const MUETTE_APRES_S = 120;

type Etat =
  | { statut: "chargement" }
  | { statut: "erreur"; message: string }
  | { statut: "inconnue" }
  | { statut: "ok"; balise: Balise };

export function VueBalise({ id }: { id: string }) {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });
  // Mesures de la plus récente à la plus ancienne (500 au plus, environ 40 min à 1 mesure / 5 s).
  const [mesures, setMesures] = useState<Mesure[]>([]);
  const [pleinEcran, setPleinEcran] = useState(false);
  const [maintenant, setMaintenant] = useState(() => Date.now());

  const charger = useCallback(() => {
    setEtat({ statut: "chargement" });
    Promise.all([getBalise(id), getMesures(id, 500)])
      .then(([balise, liste]) => {
        setEtat(balise ? { statut: "ok", balise } : { statut: "inconnue" });
        setMesures(liste);
      })
      .catch((e: unknown) => setEtat({ statut: "erreur", message: e instanceof Error ? e.message : String(e) }));
  }, [id]);

  useEffect(charger, [charger]);
  // Après une coupure, la file arrive dans le désordre : on retrie par date de mesure (Date.parse, car
  // REST et Realtime n'écrivent pas l'heure pareil). Une mesure reçue pendant le chargement peut arriver
  // par les deux chemins : on l'ignore si son id est déjà là.
  useEffect(
    () =>
      abonnerMesures(id, (m) =>
        setMesures((prev) =>
          prev.some((p) => p.id === m.id)
            ? prev
            : [m, ...prev].sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts)).slice(0, 500),
        ),
      ),
    [id],
  );
  useEffect(() => {
    if (!pleinEcran) return;
    const echap = (e: KeyboardEvent) => e.key === "Escape" && setPleinEcran(false);
    window.addEventListener("keydown", echap);
    return () => window.removeEventListener("keydown", echap);
  }, [pleinEcran]);
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
  const derniere = mesures[0] ?? null;
  const ecartS = derniere ? Math.max(0, (maintenant - Date.parse(derniere.ts)) / 1000) : null;
  const enLigne = ecartS !== null && ecartS <= MUETTE_APRES_S;
  const brut = derniere?.niveau_cm ?? null;
  const niveau = brut === null ? null : Math.max(0, brut);
  const depasse = niveau !== null && balise.seuil_alerte_cm !== null && niveau >= balise.seuil_alerte_cm;

  if (pleinEcran) {
    // Mode présentation pour la démo : la jauge et le chiffre en très grand.
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-surface p-6">
        <button
          type="button"
          onClick={() => setPleinEcran(false)}
          aria-label="Quitter le plein écran"
          className="absolute right-4 top-4 inline-flex size-cible items-center justify-center rounded-sm hover:bg-bg"
        >
          <X {...ICONE} aria-hidden />
        </button>
        <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-end">
          <div className="origin-bottom sm:scale-150">
            <Jauge niveauCm={niveau ?? 0} hauteurCm={balise.hauteur_capteur_cm} seuilCm={balise.seuil_alerte_cm} />
          </div>
          <p className="text-[120px] font-semibold leading-none tabular-nums sm:text-[200px]">
            {niveau === null ? "–" : formatNombre(Math.round(niveau))}
            <span className="text-titre1"> cm</span>
          </p>
        </div>
        {depasse && <p className="text-titre1 text-prio-high">Seuil dépassé</p>}
        <p className="text-ink-2">
          {balise.nom} ·{" "}
          {ecartS === null
            ? "aucune mesure reçue"
            : `${enLigne ? "mis à jour" : "dernière mesure"} ${formatDepuis(ecartS)}`}
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-lg rounded-md bg-surface p-4">
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

      <CourbeNiveau mesures={mesures} seuilCm={balise.seuil_alerte_cm} maintenant={maintenant} />

      <dl className="mt-6 grid grid-cols-2 gap-x-3 gap-y-1 text-petit">
        <dt className="text-ink-2">Batterie</dt>
        <dd>{derniere?.batterie_v != null ? `${formatNombre(derniere.batterie_v)} V` : "non mesurée"}</dd>
        <dt className="text-ink-2">Signal Wi-Fi</dt>
        <dd>{derniere?.rssi != null ? `${derniere.rssi} dBm` : "non mesuré"}</dd>
        <dt className="text-ink-2">Position</dt>
        <dd>
          <a
            href={`https://www.openstreetmap.org/?mlat=${balise.lat}&mlon=${balise.lon}#map=17/${balise.lat}/${balise.lon}`}
            className="text-primary underline"
            target="_blank"
            rel="noreferrer"
          >
            Voir sur la carte
          </a>
        </dd>
      </dl>

      <button
        type="button"
        onClick={() => setPleinEcran(true)}
        className="mt-6 inline-flex min-h-cible items-center gap-2 rounded-sm bg-primary px-4 text-surface hover:bg-primary-strong"
      >
        <Maximize2 {...ICONE} aria-hidden />
        Plein écran
      </button>

      {brut !== null && brut < 0 && (
        <p className="mt-4 text-petit text-ink-2">Mesure anormale : balise à réétalonner (niveau affiché à 0).</p>
      )}
      {USE_MOCKS && (
        <p className="mt-4 text-mention text-ink-2">Données factices [FICTIF] : pas de mesure en direct.</p>
      )}
    </section>
  );
}
