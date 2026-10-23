"use client";

import { CloudOff, Satellite } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListeUrgence } from "@/components/apres/liste-urgence";
import { Legende } from "@/components/carte/legende";
import { PanneauZones } from "@/components/carte/panneau-zones";
import { ChargeurGoutte } from "@/components/ui/chargeur-goutte";
import { Selection } from "@/components/ui/champ";
import { AlerteErreur, Bandeau, BandeauMaquette, EtatVide } from "@/components/ui/etats";
import { Squelette, SqueletteListe } from "@/components/ui/squelette";
import { IndicateurConfiance } from "@/components/zone/badges";
import { estMaquette, getEvenements, getImpacts, getZones } from "@/lib/data";
import { formatDate, formatNombre } from "@/lib/format";
import { surfaceHectares } from "@/lib/geo";
import { CONFIANCES } from "@/lib/priorite";
import type { Confiance, Evenement, ImpactEvenement, ZonesGeoJSON } from "@/types/contracts";

const CarteZones = dynamic(() => import("@/components/carte/carte-zones"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-surface-3">
      <ChargeurGoutte libelle="Chargement de la carte" />
    </div>
  ),
});

type Donnees = { evenements: Evenement[]; impacts: ImpactEvenement[]; zones: ZonesGeoJSON };
type Etat = { statut: "chargement" } | { statut: "erreur"; message: string } | { statut: "ok"; d: Donnees };

const JOUR_MS = 86_400_000;
// Au-delà, l'image est signalée comme ancienne : l'eau a pu beaucoup changer depuis.
const IMAGE_ANCIENNE_J = 3;

function libelleEpisode(e: Evenement): string {
  const pluie = e.pluie_mm === null ? "cumul non disponible" : `${formatNombre(e.pluie_mm)} mm`;
  return `${formatDate(e.date_pluie)} · ${pluie}${e.station && e.pluie_mm !== null ? ` à ${e.station}` : ""}`;
}

function jours(n: number): string {
  return `${formatNombre(n)} jour${n > 1 ? "s" : ""}`;
}

function fraicheur(e: Evenement): string {
  if (!e.date_image)
    return "Aucune image radar exploitable après cette pluie : pas de carte de l'eau pour cet épisode.";
  const ecartJ = Math.round((Date.parse(e.date_image) - Date.parse(e.date_pluie)) / JOUR_MS);
  const ecart = ecartJ <= 0 ? "le jour de la pluie" : `${jours(ecartJ)} après la pluie`;
  return `Image radar du ${formatDate(e.date_image)}, ${ecart}. L'eau a pu baisser entre-temps.`;
}

/** Âge de l'image aujourd'hui, en jours ; null sans image. */
function ageImage(e: Evenement): number | null {
  if (!e.date_image) return null;
  return Math.max(0, Math.floor((Date.now() - Date.parse(e.date_image)) / JOUR_MS));
}

function Chiffre({ valeur, intitule }: { valeur: string; intitule: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <p className="text-titre1 tabular-nums text-vif">{valeur}</p>
      <p className="text-petit leading-tight text-ink-2">{intitule}</p>
    </div>
  );
}

/** E3 · Après une pluie : où l'eau était encore présente sur l'image radar, et chez combien de personnes. */
export function VueApres({ evenementId }: { evenementId: number }) {
  const router = useRouter();
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });
  const [selection, setSelection] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);

  const charger = useCallback(() => {
    setEtat({ statut: "chargement" });
    Promise.all([getEvenements(), getImpacts(evenementId), getZones()])
      .then(([evenements, impacts, zones]) => setEtat({ statut: "ok", d: { evenements, impacts, zones } }))
      .catch((e: unknown) => setEtat({ statut: "erreur", message: e instanceof Error ? e.message : String(e) }));
  }, [evenementId]);

  useEffect(charger, [charger]);

  const evenement = etat.statut === "ok" ? etat.d.evenements.find((e) => e.id === evenementId) : undefined;
  // L'âge dépend de l'heure du navigateur : calculé après le premier rendu.
  useEffect(() => setAge(evenement ? ageImage(evenement) : null), [evenement]);

  const impacts = useMemo(() => (etat.statut === "ok" ? etat.d.impacts : []), [etat]);
  const habitants = impacts.reduce((s, i) => s + i.habitants_touches, 0);
  const ecoles = impacts.reduce((s, i) => s + i.ecoles_touchees, 0);
  const zonesParId = useMemo(
    () => new Map(etat.statut === "ok" ? etat.d.zones.features.map((f) => [f.properties.id, f.properties]) : []),
    [etat],
  );
  const confiances = useMemo(() => {
    const c: Record<Confiance, number> = { elevee: 0, moyenne: 0, faible: 0 };
    for (const i of impacts) {
      const z = zonesParId.get(i.zone_id);
      if (z) c[z.confiance] += 1;
    }
    return c;
  }, [impacts, zonesParId]);
  const maquette = etat.statut === "ok" && estMaquette(etat.d.zones.features.map((f) => f.properties.nom));
  const avecEau = Boolean(evenement?.eau_geojson);

  return (
    <>
      <div className="relative min-h-0 flex-1" data-plein-ecran>
        <h1 className="sr-only">Après une pluie{evenement && ` : épisode du ${formatDate(evenement.date_pluie)}`}</h1>
        {etat.statut === "ok" && (
          <CarteZones
            zones={etat.d.zones}
            mode="contour"
            eau={evenement?.eau_geojson ?? null}
            feuille="moitie"
            selection={selection}
            onSelection={(id) => impacts.some((i) => i.zone_id === id) && setSelection(id)}
            libelle="Carte de l'eau détectée après la pluie"
          />
        )}
        {etat.statut === "chargement" && (
          <div className="absolute inset-0 grid place-items-center bg-surface-3" aria-busy="true">
            <ChargeurGoutte libelle="Chargement de l'épisode" />
          </div>
        )}
        {etat.statut === "erreur" && (
          <div className="absolute inset-0 grid place-items-center bg-surface-3 p-4">
            <AlerteErreur
              titre="L'épisode n'a pas pu être chargé"
              message={etat.message}
              onReessayer={charger}
              className="max-w-md shadow-pop"
            />
          </div>
        )}
        {etat.statut === "ok" && <Legende variante="eau" />}
        {maquette && (
          <BandeauMaquette compact className="absolute left-3 right-[72px] top-3 z-controle w-fit max-w-xl" />
        )}
      </div>

      <PanneauZones
        titre="Après une pluie"
        ouvrirSur={selection ?? String(evenementId)}
        entete={
          <header className="space-y-3 px-4 lg:pt-5">
            <div>
              <p className="text-surtitre uppercase text-ink-3">Après une pluie</p>
              <h2 className="text-titre2">
                {evenement ? `Épisode du ${formatDate(evenement.date_pluie)}` : "Épisode de pluie"}
              </h2>
            </div>
            {etat.statut === "ok" && etat.d.evenements.length > 0 && (
              <Selection
                aria-label="Épisode de pluie"
                value={evenementId}
                onChange={(e) => {
                  setSelection(null);
                  router.push(`/apres/${e.target.value}`);
                }}
              >
                {etat.d.evenements.map((e) => (
                  <option key={e.id} value={e.id}>
                    {libelleEpisode(e)}
                  </option>
                ))}
              </Selection>
            )}
            {etat.statut === "chargement" && <Squelette className="h-11" />}
          </header>
        }
      >
        <div className="space-y-5 py-3">
          {etat.statut === "chargement" && (
            <>
              <Squelette className="h-16 rounded-lg" />
              <div className="grid grid-cols-3 gap-2">
                <Squelette className="h-20 rounded-lg" />
                <Squelette className="h-20 rounded-lg" />
                <Squelette className="h-20 rounded-lg" />
              </div>
              <SqueletteListe lignes={3} libelle="Chargement des zones touchées" />
            </>
          )}

          {etat.statut === "ok" && !evenement && (
            <EtatVide titre="Épisode introuvable" icone={CloudOff}>
              Cet épisode n&apos;existe pas ou plus. Choisissez un autre épisode dans la liste ci-dessus.
            </EtatVide>
          )}

          {evenement && (
            <div className="space-y-2">
              <Bandeau icone={avecEau ? Satellite : CloudOff}>
                {fraicheur(evenement)}
                {maquette && " Données fictives [FICTIF]."}
              </Bandeau>
              {age !== null && age > IMAGE_ANCIENNE_J && (
                <Bandeau ancien>
                  Image vieille de {jours(age)} : elle décrit la situation d&apos;alors, pas celle
                  d&apos;aujourd&apos;hui.
                </Bandeau>
              )}
            </div>
          )}

          {evenement && avecEau && evenement.eau_geojson && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <Chiffre
                  valeur={`${formatNombre(Math.round(surfaceHectares(evenement.eau_geojson)))} ha`}
                  intitule="en eau"
                />
                <Chiffre valeur={formatNombre(Math.round(habitants / 100) * 100)} intitule="habitants dans l'eau" />
                <Chiffre valeur={formatNombre(ecoles)} intitule={ecoles > 1 ? "écoles touchées" : "école touchée"} />
              </div>
              {impacts.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-petit text-ink-2">
                  <span>Confiance des zones touchées :</span>
                  {CONFIANCES.filter((c) => confiances[c] > 0).map((c) => (
                    <span key={c} className="inline-flex items-center gap-1.5">
                      <IndicateurConfiance confiance={c} court />
                      <span className="tabular-nums">({formatNombre(confiances[c])})</span>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {evenement && avecEau && impacts.length === 0 && (
            <EtatVide titre="Pas d'eau dans les zones calculées">
              Aucune eau visible par le radar dans les zones calculées sur cette image.
            </EtatVide>
          )}

          {evenement && avecEau && (
            <ListeUrgence
              impacts={impacts}
              zones={zonesParId}
              evenement={evenement}
              selection={selection}
              onSelection={setSelection}
            />
          )}

          {evenement && !avecEau && (
            <EtatVide titre="Pas de carte de l'eau pour cet épisode" icone={CloudOff}>
              Le radar n&apos;a pas fourni d&apos;image exploitable après cette pluie. Les zones restent visibles sur la
              carte ; choisissez un autre épisode pour voir l&apos;eau détectée.
            </EtatVide>
          )}
        </div>
      </PanneauZones>
    </>
  );
}
