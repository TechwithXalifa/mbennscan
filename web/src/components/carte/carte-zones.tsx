"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  Map as CarteMapLibre,
  Popup,
  type FilterSpecification,
  type GeoJSONSource,
  type MapGeoJSONFeature,
} from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { BarreOutilsCarte } from "@/components/carte/barre-outils-carte";
import { EtatFondCarte, type EtatFond } from "@/components/carte/etat-fond";
import {
  ajouterCouches,
  ATTRIBUTION,
  CENTRE,
  contenuInfobulle,
  DELAI_FOND_MS,
  marges,
  styleVide,
  themeDuDocument,
  type Couches,
} from "@/lib/carte";
import { STYLE_CARTE, STYLE_CARTE_SOMBRE, jeton } from "@/lib/design";
import { emprise } from "@/lib/geo";
import { useTheme, type Theme } from "@/lib/theme";
import type { EauGeoJSON, Priorite, ZoneSynthese, ZonesGeoJSON } from "@/types/contracts";

type Props = {
  zones: ZonesGeoJSON;
  selection?: string | null;
  onSelection?: (id: string) => void;
  /** « contour » (écran Après une pluie) : zones seulement contourées pour que l'eau reste lisible */
  mode?: "priorite" | "contour";
  /** Eau détectée après un épisode, dessinée au-dessus des zones */
  eau?: EauGeoJSON | null;
  /** Hauteur de la feuille du bas à l'ouverture sur mobile, pour cadrer au-dessus */
  feuille?: "apercu" | "moitie";
  /** Niveaux de priorité cachés par le filtre de la légende */
  prioritesMasquees?: Priorite[];
  /**
   * Mini-carte de situation dans une page qui défile : sans barre d'outils, marges serrées,
   * deux doigts (ou Ctrl + molette) pour la déplacer.
   */
  miniature?: boolean;
  libelle?: string;
};

type Donnees = Parameters<GeoJSONSource["setData"]>[0];
const VIDE = { type: "FeatureCollection" as const, features: [] };
const VRAI: FilterSpecification = ["boolean", true];
const FAUX: FilterSpecification = ["boolean", false];

export default function CarteZones({
  zones,
  selection = null,
  onSelection,
  mode = "priorite",
  eau = null,
  feuille = "apercu",
  prioritesMasquees = [],
  miniature = false,
  libelle = "Carte des zones",
}: Props) {
  const cadrer = useCallback((f: "apercu" | "moitie") => (miniature ? 32 : marges(f)), [miniature]);
  const conteneur = useRef<HTMLDivElement>(null);
  const carte = useRef<CarteMapLibre | null>(null);
  const { theme } = useTheme();
  const [prete, setPrete] = useState(false);
  const [etatFond, setEtatFond] = useState<EtatFond>("chargement");
  const [couches, setCouches] = useState<Couches>({ priorite: true, confiance: true, eau: true });
  const [sansFond, setSansFond] = useState(false);
  const selPrecedente = useRef<string | null>(null);
  const dejaCadre = useRef<unknown>(null);
  const rappel = useRef(onSelection);
  rappel.current = onSelection;
  // Tout ce que la carte doit redessiner quand son style change (thème, fond) : lu au moment voulu.
  const etat = useRef({ zones, eau, selection, prioritesMasquees, couches, mode, theme: "clair" as Theme, sansFond });
  etat.current = { ...etat.current, zones, eau, selection, prioritesMasquees, couches, mode, sansFond };
  const minuteur = useRef<ReturnType<typeof setTimeout>>();

  const surveillerFond = useCallback(() => {
    clearTimeout(minuteur.current);
    setEtatFond("chargement");
    minuteur.current = setTimeout(() => setEtatFond((e) => (e === "pret" ? e : "lent")), DELAI_FOND_MS);
  }, []);

  const appliquerFiltres = useCallback((map: CarteMapLibre) => {
    const { prioritesMasquees: masquees, mode: m } = etat.current;
    const contour = m === "contour";
    const priorite: FilterSpecification = masquees.length
      ? ["!", ["in", ["get", "priorite"], ["literal", masquees]]]
      : VRAI;
    const base: Record<string, FilterSpecification> = {
      "zones-halo": contour ? FAUX : VRAI,
      "zones-fond": VRAI,
      "zones-hachures": contour ? FAUX : ["!=", ["get", "confiance"], "elevee"],
      "zones-contour": VRAI,
      "zones-contour-faible": ["==", ["get", "confiance"], "faible"],
      "zones-etat": VRAI,
    };
    for (const [id, filtre] of Object.entries(base)) {
      if (map.getLayer(id)) map.setFilter(id, ["all", filtre, priorite] as FilterSpecification);
    }
  }, []);

  const appliquerCouches = useCallback((map: CarteMapLibre) => {
    const { couches: c, mode: m } = etat.current;
    const visible = (oui: boolean) => (oui ? "visible" : "none");
    const poser = (id: string, oui: boolean) =>
      map.getLayer(id) && map.setLayoutProperty(id, "visibility", visible(oui));
    poser("zones-halo", c.priorite);
    // Le remplissage reste cliquable même caché : opacité nulle plutôt que couche masquée.
    if (map.getLayer("zones-fond"))
      map.setPaintProperty(
        "zones-fond",
        "fill-opacity",
        m === "contour" || !c.priorite ? 0 : Number(jeton("--zone-opacity")) || 0.6,
      );
    poser("zones-hachures", c.confiance);
    poser("zones-contour-faible", c.confiance);
    poser("eau-fond", c.eau);
    poser("eau-contour", c.eau);
  }, []);

  /** Sources et couches : à refaire à chaque changement de style (thème, fond). */
  const installer = useCallback(
    (map: CarteMapLibre) => {
      const { zones: z, eau: e, mode: m, selection: sel, sansFond: sans } = etat.current;
      if (!map.getSource("zones")) map.addSource("zones", { type: "geojson", data: z as Donnees, promoteId: "id" });
      if (!map.getSource("eau")) map.addSource("eau", { type: "geojson", data: (e ?? VIDE) as Donnees });
      ajouterCouches(map, m === "contour", sans);
      appliquerFiltres(map);
      appliquerCouches(map);
      if (sel) map.setFeatureState({ source: "zones", id: sel }, { selection: true });
    },
    [appliquerFiltres, appliquerCouches],
  );

  useEffect(() => {
    if (!conteneur.current) return;
    const themeInitial = themeDuDocument();
    etat.current.theme = themeInitial;
    const map = new CarteMapLibre({
      container: conteneur.current,
      style: themeInitial === "sombre" ? STYLE_CARTE_SOMBRE : STYLE_CARTE,
      center: CENTRE,
      zoom: 12,
      // Attribution toujours visible en bas à droite (cahier des charges, section 6).
      attributionControl: { compact: false, customAttribution: ATTRIBUTION },
      cooperativeGestures: miniature,
    });
    carte.current = map;
    surveillerFond();
    // Le verre devient opaque pendant un déplacement : le flou recalculé à chaque image coûte cher sur téléphone.
    const racine = document.documentElement;
    map.on("movestart", () => racine.setAttribute("data-carte-bouge", ""));
    map.on("moveend", () => racine.removeAttribute("data-carte-bouge"));

    map.on("style.load", () => {
      installer(map);
      clearTimeout(minuteur.current);
      setEtatFond("pret");
      setPrete(true);
    });
    // Le style sombre d'OpenFreeMap cite des motifs absents de son sprite : une image vide les remplace.
    map.on("styleimagemissing", (e) => {
      if (!map.hasImage(e.id)) map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) });
    });
    // Avant le premier affichage, une erreur vient du style, du sprite ou des polices : on le dit.
    map.on("error", () => setEtatFond((e) => (e === "pret" ? e : "erreur")));

    const infobulle = new Popup({ closeButton: false, closeOnClick: false, offset: 12, className: "carte-infobulle" });
    let survol: string | number | undefined;

    map.on("mousemove", ["zones-fond", "zones-halo"], (e) => {
      const f: MapGeoJSONFeature | undefined = e.features?.[0];
      if (!f) return;
      if (survol !== undefined) map.setFeatureState({ source: "zones", id: survol }, { survol: false });
      survol = f.id;
      map.setFeatureState({ source: "zones", id: survol! }, { survol: true });
      map.getCanvas().style.cursor = "pointer";
      infobulle
        .setLngLat(e.lngLat)
        .setDOMContent(contenuInfobulle(f.properties as ZoneSynthese, etat.current.mode === "contour"))
        .addTo(map);
    });
    map.on("mouseleave", ["zones-fond", "zones-halo"], () => {
      if (survol !== undefined) map.setFeatureState({ source: "zones", id: survol }, { survol: false });
      survol = undefined;
      map.getCanvas().style.cursor = "";
      infobulle.remove();
    });
    map.on("click", ["zones-fond", "zones-halo"], (e) => {
      const id = e.features?.[0]?.id;
      if (id !== undefined) rappel.current?.(String(id));
    });

    return () => {
      clearTimeout(minuteur.current);
      racine.removeAttribute("data-carte-bouge");
      infobulle.remove();
      map.remove();
      carte.current = null;
    };
    // La carte n'est créée qu'une fois ; les changements passent par les effets ci-dessous.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Recharge le style (thème, fond de carte ou nouvel essai) puis réinstalle les couches. */
  const changerStyle = useCallback(
    (sans: boolean) => {
      const map = carte.current;
      if (!map) return;
      surveillerFond();
      const t = themeDuDocument();
      etat.current.theme = t;
      etat.current.sansFond = sans;
      map.setStyle(sans ? styleVide() : t === "sombre" ? STYLE_CARTE_SOMBRE : STYLE_CARTE, { diff: false });
    },
    [surveillerFond],
  );

  // Changement de thème : le fond de carte et les couleurs des couches suivent.
  // Comparé au document (et non à `theme`, qui n'est connu qu'après le premier rendu).
  useEffect(() => {
    if (!carte.current || themeDuDocument() === etat.current.theme) return;
    changerStyle(etat.current.sansFond);
  }, [theme, changerStyle]);

  useEffect(() => {
    if (!prete) return;
    (carte.current?.getSource("zones") as GeoJSONSource | undefined)?.setData(zones);
  }, [prete, zones]);

  useEffect(() => {
    if (!prete) return;
    (carte.current?.getSource("eau") as GeoJSONSource | undefined)?.setData((eau ?? VIDE) as Donnees);
  }, [prete, eau]);

  // Filtre de la légende : instantané, sans déplacer la carte.
  const cleMasquees = prioritesMasquees.join(",");
  useEffect(() => {
    if (prete && carte.current) appliquerFiltres(carte.current);
  }, [prete, cleMasquees, appliquerFiltres]);

  useEffect(() => {
    if (prete && carte.current) appliquerCouches(carte.current);
  }, [prete, couches, appliquerCouches]);

  /** Cadre l'eau détectée s'il y en a, sinon les zones. */
  const recentrer = useCallback(
    (duree: number) => {
      const map = carte.current;
      const cible = eau?.features.length ? eau : zones;
      const rect = emprise(cible.features);
      if (map && rect) map.fitBounds(rect, { padding: cadrer(feuille), maxZoom: 15, duration: duree });
    },
    [eau, zones, feuille, cadrer],
  );

  // Cadrage une fois par jeu de données.
  useEffect(() => {
    const cible = eau?.features.length ? eau : zones;
    if (!prete || !carte.current || dejaCadre.current === cible) return;
    dejaCadre.current = cible;
    // Une zone déjà choisie (lien partagé) sera cadrée par l'effet de sélection.
    if (!selection) recentrer(0);
  }, [prete, zones, eau, selection, recentrer]);

  useEffect(() => {
    const map = carte.current;
    if (!prete || !map) return;
    // MapLibre exige un id pour effacer une clé d'état : on n'efface que l'ancienne sélection.
    if (selPrecedente.current) map.removeFeatureState({ source: "zones", id: selPrecedente.current }, "selection");
    selPrecedente.current = selection;
    if (!selection) return;
    map.setFeatureState({ source: "zones", id: selection }, { selection: true });
    // Le contour pulse une fois pour que l'œil retrouve la zone sur la carte.
    let image = 0;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const debut = performance.now();
      const pas = (t: number) => {
        const p = Math.min(1, (t - debut) / 700);
        map.setFeatureState({ source: "zones", id: selection }, { pulse: Math.sin(Math.PI * p) });
        if (p < 1) image = requestAnimationFrame(pas);
      };
      image = requestAnimationFrame(pas);
    }
    // La fiche s'ouvre à mi-hauteur sur mobile : centrer la zone dans la partie visible.
    const zone = zones.features.find((f) => f.properties.id === selection);
    const rect = zone && emprise([zone]);
    if (rect) map.fitBounds(rect, { padding: cadrer("moitie"), maxZoom: Math.max(map.getZoom(), 15) });
    return () => cancelAnimationFrame(image);
  }, [prete, selection, zones, cadrer]);

  function choisirFond(sans: boolean) {
    setSansFond(sans);
    changerStyle(sans);
  }

  // La feuille de style MapLibre impose position: relative au conteneur, d'où l'enveloppe.
  return (
    <div className="absolute inset-0">
      <div ref={conteneur} className="h-full w-full" role="region" aria-label={libelle} />
      {!miniature && (
        <BarreOutilsCarte
          onZoomer={(sens) => (sens > 0 ? carte.current?.zoomIn() : carte.current?.zoomOut())}
          onRecentrer={() => recentrer(600)}
          cible={() =>
            conteneur.current?.closest<HTMLElement>("[data-plein-ecran]") ?? conteneur.current?.parentElement ?? null
          }
          contour={mode === "contour"}
          couches={couches}
          onCouches={setCouches}
          eauDisponible={Boolean(eau?.features.length)}
          sansFond={sansFond}
          onFond={choisirFond}
        />
      )}
      <EtatFondCarte
        etat={etatFond}
        prete={prete}
        onReessayer={() => changerStyle(sansFond)}
        onSansFond={() => choisirFond(true)}
      />
    </div>
  );
}
