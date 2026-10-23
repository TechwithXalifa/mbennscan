"use client";

import { AlertTriangle, ArrowUpRight, Cpu, Maximize2, Radio, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Jauge, reperesCorps } from "@/components/balise/jauge";
import { Bouton } from "@/components/ui/bouton";
import { AlerteErreur, Bandeau, EtatVide, PastilleEtat } from "@/components/ui/etats";
import { Squelette } from "@/components/ui/squelette";
import { abonnerMesures, getBalise, getMesures, USE_MOCKS } from "@/lib/data";
import { ICONE, ICONE_PETITE } from "@/lib/design";
import { formatDepuis, formatNombre } from "@/lib/format";
import { BALISE_PAR_DEFAUT } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { Balise, Mesure } from "@/types/contracts";

const CourbeNiveau = dynamic(() => import("@/components/balise/courbe-niveau"), {
  ssr: false,
  loading: () => <Squelette className="h-64 rounded-lg" />,
});

// Balise muette au-delà de 2 minutes (cahier des charges, section 6).
const MUETTE_APRES_S = 120;
const dateHeure = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

type Etat =
  | { statut: "chargement" }
  | { statut: "erreur"; message: string }
  | { statut: "inconnue" }
  | { statut: "ok"; balise: Balise };

function Carte({ titre, children, className }: { titre?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-line bg-surface p-5 shadow-1", className)}>
      {titre && <h2 className="mb-4 text-titre3 text-ink">{titre}</h2>}
      {children}
    </section>
  );
}

/** E5 · Balise : niveau d'un bassin mesuré au sol, en direct. Seules les mesures reçues sont affichées. */
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
    return (
      <div role="status" aria-busy="true" className="space-y-6">
        <span className="sr-only">Chargement de la balise</span>
        <div className="space-y-2">
          <Squelette className="h-4 w-40" />
          <Squelette className="h-8 w-72" />
          <Squelette className="h-5 w-56" />
        </div>
        <div className="grid gap-4 lg:grid-cols-12">
          <Squelette className="h-80 rounded-lg lg:col-span-5" />
          <Squelette className="h-80 rounded-lg lg:col-span-7" />
        </div>
      </div>
    );
  }
  if (etat.statut === "erreur") {
    return <AlerteErreur titre="La balise n'a pas pu être chargée" message={etat.message} onReessayer={charger} />;
  }
  if (etat.statut === "inconnue") {
    return (
      <EtatVide
        titre="Balise introuvable"
        icone={Radio}
        action={
          id !== BALISE_PAR_DEFAUT && (
            <Link
              href={`/balise/${BALISE_PAR_DEFAUT}`}
              className="min-h-cible text-petit font-medium text-primary-ink underline-offset-4 hover:underline"
            >
              Ouvrir la balise de démonstration
            </Link>
          )
        }
      >
        Aucune balise enregistrée ne porte l&apos;identifiant « {id} ».
      </EtatVide>
    );
  }

  const { balise } = etat;
  const derniere = mesures[0] ?? null;
  const ecartS = derniere ? Math.max(0, (maintenant - Date.parse(derniere.ts)) / 1000) : null;
  const enLigne = ecartS !== null && ecartS <= MUETTE_APRES_S;
  const brut = derniere?.niveau_cm ?? null;
  const niveau = brut === null ? null : Math.max(0, brut);
  const depasse = niveau !== null && balise.seuil_alerte_cm !== null && niveau >= balise.seuil_alerte_cm;
  const etatTexte =
    ecartS === null
      ? "Aucune mesure reçue"
      : enLigne
        ? `En ligne · mis à jour ${formatDepuis(ecartS)}`
        : `Muette · dernière mesure ${formatDepuis(ecartS)}`;

  if (pleinEcran) {
    // Mode présentation pour la démo : la jauge et le chiffre en très grand.
    return (
      <div className="fixed inset-0 z-dialogue flex flex-col items-center justify-center gap-8 bg-surface p-6">
        <button
          type="button"
          onClick={() => setPleinEcran(false)}
          aria-label="Quitter le plein écran"
          className="absolute right-4 top-4 inline-flex size-cible items-center justify-center rounded-sm text-ink-2 hover:bg-surface-3 hover:text-ink"
        >
          <X {...ICONE} aria-hidden />
        </button>
        <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-end">
          <div className="origin-bottom sm:scale-150">
            <Jauge
              niveauCm={niveau ?? 0}
              hauteurCm={balise.hauteur_capteur_cm}
              seuilCm={balise.seuil_alerte_cm}
              sansMesure={niveau === null}
            />
          </div>
          <p className="text-[120px] font-semibold leading-none tracking-tight tabular-nums text-vif sm:text-[200px]">
            {niveau === null ? "–" : formatNombre(Math.round(niveau))}
            <span className="text-titre1 tracking-normal text-ink-2"> cm</span>
          </p>
        </div>
        {niveau !== null && <p className="text-titre2 text-ink">{reperesCorps(niveau)}.</p>}
        {depasse && (
          <p className="flex items-center gap-2 text-titre1 text-danger">
            <AlertTriangle size={28} strokeWidth={1.75} aria-hidden />
            Seuil dépassé
          </p>
        )}
        <PastilleEtat enLigne={enLigne}>
          <span className="text-texte text-ink-2">
            {balise.nom} · {etatTexte}
          </span>
        </PastilleEtat>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-surtitre uppercase text-ink-3">Balise · mesure au sol</p>
          <h1 className="mt-1 text-titre1 text-ink">{balise.nom}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <PastilleEtat enLigne={enLigne}>
              <span className="text-ink">{etatTexte}</span>
            </PastilleEtat>
            <span className="text-petit text-ink-3">
              {USE_MOCKS ? "Données de démonstration [FICTIF]" : "Mesures reçues en direct par le serveur"}
            </span>
          </div>
        </div>
        <Bouton taille="compacte" onClick={() => setPleinEcran(true)}>
          <Maximize2 {...ICONE_PETITE} aria-hidden />
          Plein écran
        </Bouton>
      </header>

      {ecartS !== null && !enLigne && (
        <Bandeau ancien>
          La balise n&apos;a rien envoyé depuis {formatDepuis(ecartS).replace("il y a ", "")} : le niveau affiché est
          celui de la dernière mesure, pas celui d&apos;aujourd&apos;hui. Vérifiez l&apos;alimentation et le Wi-Fi de la
          balise.
        </Bandeau>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <Carte titre="Niveau d'eau" className="lg:col-span-5">
          <div className="flex items-end justify-center gap-8">
            <Jauge
              niveauCm={niveau ?? 0}
              hauteurCm={balise.hauteur_capteur_cm}
              seuilCm={balise.seuil_alerte_cm}
              sansMesure={niveau === null}
            />
            <div className="pb-1">
              <p className="text-[64px] font-semibold leading-none tracking-tight tabular-nums text-vif">
                {niveau === null ? "–" : formatNombre(Math.round(niveau))}
                <span className="text-titre2 tracking-normal text-ink-2"> cm</span>
              </p>
              <p className="mt-1 text-petit text-ink-2">d&apos;eau dans le bac</p>
              {niveau !== null && (
                <p className="mt-2 max-w-48 text-petit font-medium text-ink">{reperesCorps(niveau)}.</p>
              )}
              {balise.seuil_alerte_cm !== null && niveau !== null && (
                <p
                  className={cn(
                    "mt-3 inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-petit font-medium",
                    depasse ? "bg-danger-soft text-danger" : "bg-surface-3 text-ink-2",
                  )}
                >
                  {depasse && <AlertTriangle {...ICONE_PETITE} aria-hidden />}
                  {depasse ? "Seuil dépassé" : `Sous le seuil de ${formatNombre(balise.seuil_alerte_cm)} cm`}
                </p>
              )}
            </div>
          </div>
          <p className="mt-3 text-mention font-normal text-ink-3">
            Repère : un adulte de 1,75 m devant une maison de plain-pied. Le niveau dessiné est celui mesuré dans le
            bac, à la même échelle.
          </p>
          {brut !== null && brut < 0 && (
            <Bandeau className="mt-4" icone={AlertTriangle}>
              Mesure anormale : la balise est à réétalonner (niveau affiché à 0).
            </Bandeau>
          )}
        </Carte>

        <Carte className="lg:col-span-7">
          <CourbeNiveau mesures={mesures} seuilCm={balise.seuil_alerte_cm} maintenant={maintenant} />
        </Carte>

        <Carte titre="État de la balise" className="lg:col-span-7">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-petit sm:grid-cols-2">
            {[
              ["Dernière mesure", derniere ? dateHeure.format(Date.parse(derniere.ts)) : "aucune"],
              ["Mesures chargées", formatNombre(mesures.length)],
              ["Batterie", derniere?.batterie_v != null ? `${formatNombre(derniere.batterie_v)} V` : "non mesurée"],
              ["Signal Wi-Fi", derniere?.rssi != null ? `${derniere.rssi} dBm` : "non mesuré"],
              ["Hauteur du capteur", `${formatNombre(balise.hauteur_capteur_cm)} cm au-dessus du fond`],
              [
                "Seuil d'alerte",
                balise.seuil_alerte_cm !== null ? `${formatNombre(balise.seuil_alerte_cm)} cm` : "non défini",
              ],
            ].map(([cle, valeur]) => (
              <div
                key={cle}
                className="flex justify-between gap-3 border-b border-line pb-2 sm:block sm:border-0 sm:pb-0"
              >
                <dt className="text-ink-3">{cle}</dt>
                <dd className="text-right font-medium tabular-nums text-ink sm:text-left">{valeur}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-3 sm:block">
              <dt className="text-ink-3">Position</dt>
              <dd className="sm:mt-0.5">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${balise.lat}&mlon=${balise.lon}#map=17/${balise.lat}/${balise.lon}`}
                  className="inline-flex items-center gap-1 font-medium text-primary-ink underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Voir sur la carte
                  <ArrowUpRight {...ICONE_PETITE} aria-hidden />
                </a>
              </dd>
            </div>
          </dl>
        </Carte>

        <Carte titre="D'où viennent ces mesures" className="lg:col-span-5">
          <div className="flex gap-3">
            <Cpu {...ICONE} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
            <div className="space-y-2 text-petit text-ink-2">
              <p>
                La balise est conçue autour d&apos;un capteur à ultrasons sur ESP32 : il mesure la distance jusqu&apos;à
                l&apos;eau, et le niveau est la hauteur du capteur moins cette distance (médiane de cinq lectures).
              </p>
              <p>
                {USE_MOCKS
                  ? "Ici, les mesures sont inventées pour la maquette : aucune mesure n'arrive en direct."
                  : "Seules les mesures reçues par le serveur sont affichées : rien n'est estimé ni complété entre deux mesures."}
              </p>
              <p>« Le satellite voit toute la banlieue ; la balise voit un bassin en continu. »</p>
            </div>
          </div>
        </Carte>
      </div>
    </div>
  );
}
