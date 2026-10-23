"use client";

import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { EnteteApercu, PERIODE } from "@/components/apercu/entete-apercu";
import { RangeeIndicateurs, RepartitionsZones } from "@/components/apercu/synthese-apercu";
import { Legende } from "@/components/carte/legende";
import { PanneauZones } from "@/components/carte/panneau-zones";
import { ListeZones } from "@/components/liste-zones";
import { ChargeurGoutte } from "@/components/ui/chargeur-goutte";
import { AlerteErreur, BandeauMaquette, EtatVide } from "@/components/ui/etats";
import { SqueletteListe } from "@/components/ui/squelette";
import { estMaquette, getEvenements, getZones } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { syntheseGlobale } from "@/lib/synthese";
import type { Evenement, Priorite, ZonesGeoJSON } from "@/types/contracts";
import { ICONE } from "@/lib/design";

// MapLibre est chargé à part pour garder un JavaScript initial léger.
const CarteZones = dynamic(() => import("@/components/carte/carte-zones"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-surface-3">
      <ChargeurGoutte libelle="Chargement de la carte" />
    </div>
  ),
});

// La fiche n'est chargée qu'au premier clic sur une zone.
const FicheZone = dynamic(() => import("@/components/zone/fiche-zone").then((m) => m.FicheZone));

type Etat = { statut: "chargement" } | { statut: "erreur"; message: string } | { statut: "ok"; zones: ZonesGeoJSON };

/** Met la zone choisie dans l'adresse, pour partager la vue ou y revenir, sans recharger la page. */
function ecrireAdresse(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("zone", id);
  else url.searchParams.delete("zone");
  window.history.replaceState(window.history.state, "", url);
}

/** E1 · Vue générale « Avant la saison » : indicateurs, carte des zones et classement. */
export function VueCarte() {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });
  const [episode, setEpisode] = useState<Evenement | null>(null);
  const [selection, setSelection] = useState<string | null>(null);
  const [zoneAnimee, setZoneAnimee] = useState<string | null>(null);
  const [masquees, setMasquees] = useState<Priorite[]>([]);
  const zoneAdresse = useSearchParams().get("zone");
  const selectionCourante = useRef(selection);
  useLayoutEffect(() => {
    selectionCourante.current = selection;
  });

  // Lien partagé ou recherche (« /?zone=… ») : la zone s'ouvre sur la carte.
  useEffect(() => {
    if (zoneAdresse !== selectionCourante.current) setSelection(zoneAdresse);
  }, [zoneAdresse]);

  // La ligne de la liste s'agrandit jusqu'à la fiche (View Transitions), et la fiche s'y replie au retour.
  // L'adresse change après la sélection, pour que l'effet ci-dessus la trouve déjà à jour.
  const choisir = useCallback((id: string | null) => {
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flushSync(() => setSelection(id));
      ecrireAdresse(id);
      return;
    }
    if (id) flushSync(() => setZoneAnimee(id));
    document.startViewTransition(() => {
      flushSync(() => setSelection(id));
      ecrireAdresse(id);
    });
  }, []);

  const charger = useCallback(() => {
    setEtat({ statut: "chargement" });
    getZones()
      .then((zones) => setEtat({ statut: "ok", zones }))
      .catch((e: unknown) => setEtat({ statut: "erreur", message: e instanceof Error ? e.message : String(e) }));
    // Le dernier épisode n'alimente qu'un indicateur : son absence ne bloque rien.
    getEvenements()
      .then((ev) => setEpisode(ev.find((e) => e.date_image) ?? null))
      .catch(() => setEpisode(null));
  }, []);

  useEffect(charger, [charger]);

  const proprietes = useMemo(() => (etat.statut === "ok" ? etat.zones.features.map((f) => f.properties) : []), [etat]);
  const synthese = useMemo(() => syntheseGlobale(proprietes), [proprietes]);
  const comptes = useMemo(() => {
    const c: Partial<Record<Priorite, number>> = {};
    for (const z of proprietes) c[z.priorite] = (c[z.priorite] ?? 0) + 1;
    return c;
  }, [proprietes]);
  const maquette = etat.statut === "ok" && estMaquette(proprietes.map((z) => z.nom));
  const vide = etat.statut === "ok" && proprietes.length === 0;

  return (
    <>
      <EnteteApercu statut={etat.statut} synthese={synthese} episode={episode} maquette={maquette} vide={vide} />

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-0 min-w-0 flex-1" data-plein-ecran>
          {etat.statut === "ok" && !vide && (
            <CarteZones
              zones={etat.zones}
              selection={selection}
              onSelection={choisir}
              prioritesMasquees={masquees}
              libelle="Carte des zones classées par priorité"
            />
          )}
          {etat.statut === "chargement" && (
            <div className="absolute inset-0 grid place-items-center bg-surface-3" aria-busy="true">
              <ChargeurGoutte libelle="Chargement des zones" />
            </div>
          )}
          {etat.statut === "erreur" && (
            <div className="absolute inset-0 grid place-items-center bg-surface-3 p-4">
              <AlerteErreur
                titre="Les zones n'ont pas pu être chargées"
                message={etat.message}
                onReessayer={charger}
                className="max-w-md shadow-pop"
              />
            </div>
          )}
          {vide && (
            <div className="absolute inset-0 grid place-items-center bg-surface-3 p-4">
              <EtatVide titre="Aucune zone calculée pour l'instant" className="max-w-md bg-surface">
                Le classement apparaîtra ici dès que le traitement satellite aura publié ses premiers résultats.
              </EtatVide>
            </div>
          )}
          {etat.statut === "ok" && !vide && <Legende comptes={comptes} masquees={masquees} onMasquees={setMasquees} />}
          {/* En maquette, la date du calcul est fictive elle aussi : le bandeau la remplace. */}
          {maquette ? (
            <BandeauMaquette compact className="absolute left-3 right-[72px] top-3 z-controle w-fit max-w-xl" />
          ) : (
            etat.statut === "ok" &&
            synthese.maj && (
              <p className="verre absolute left-3 top-3 z-controle rounded-pill px-3 py-1 text-mention text-ink-2 lg:hidden">
                Calcul du {formatDate(synthese.maj)}
              </p>
            )
          )}
        </div>

        <PanneauZones
          titre="Zones à traiter en premier"
          sousTitre={
            <span className="flex flex-wrap items-center justify-between gap-x-3">
              {PERIODE}
              <Link href="/zones" className="font-medium text-primary-ink underline-offset-4 hover:underline lg:hidden">
                Tout le classement
              </Link>
            </span>
          }
          ouvrirSur={selection}
          entete={
            selection && (
              <button
                type="button"
                onClick={() => choisir(null)}
                className="mx-4 inline-flex min-h-cible items-center gap-2 self-start rounded-sm font-medium text-primary-ink lg:mt-3"
              >
                <ArrowLeft {...ICONE} aria-hidden />
                Zones à traiter en premier
              </button>
            )
          }
        >
          {selection ? (
            <div style={{ viewTransitionName: "fiche" }} className="pt-2">
              <FicheZone key={selection} id={selection} />
            </div>
          ) : etat.statut === "ok" ? (
            <>
              <ListeZones
                zones={proprietes}
                selection={selection}
                onSelection={choisir}
                prioritesMasquees={masquees}
                onReinitialiser={() => setMasquees([])}
                zoneAnimee={zoneAnimee}
              />
              {!vide && (
                <div className="mt-4 border-t border-line pt-4">
                  <h3 className="mb-3 text-titre3">Synthèse des zones</h3>
                  {/* Sur téléphone, les indicateurs de la vue générale viennent ici, après le classement. */}
                  <RangeeIndicateurs synthese={synthese} episode={episode} className="mb-5 lg:hidden" />
                  <RepartitionsZones synthese={synthese} />
                </div>
              )}
            </>
          ) : etat.statut === "chargement" ? (
            <SqueletteListe lignes={5} libelle="Chargement du classement" />
          ) : (
            <p className="py-4 text-petit text-ink-2">
              Le classement s&apos;affichera quand les zones seront chargées.
            </p>
          )}
        </PanneauZones>
      </div>
    </>
  );
}
