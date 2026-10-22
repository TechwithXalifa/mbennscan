"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  Map as CarteMapLibre,
  NavigationControl,
  Popup,
  type GeoJSONSource,
  type MapGeoJSONFeature,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { ChargeurGoutte } from "@/components/ui/chargeur-goutte";
import { STYLE_CARTE } from "@/lib/design";
import { emprise } from "@/lib/geo";
import { LIBELLE_PRIORITE, VARIABLE_PRIORITE } from "@/lib/priorite";
import type { EauGeoJSON, Priorite, ZonesGeoJSON } from "@/types/contracts";

// Vue de départ : département de Keur Massar, zoom 12 (cahier des charges, section 6).
const CENTRE: [number, number] = [-17.315, 14.78];
const ATTRIBUTION = "© les contributeurs d'OpenStreetMap · Copernicus Sentinel · WorldPop";

/**
 * Marges du cadrage. Sur mobile, la feuille du bas couvre le bas de la carte :
 * `feuille` est la part de l'écran qu'elle occupe (aperçu ou moitié).
 */
function marges(feuille: "apercu" | "moitie") {
  if (window.matchMedia("(min-width: 1024px)").matches) return { top: 64, right: 64, bottom: 48, left: 48 };
  const bas = feuille === "apercu" ? 140 : window.innerHeight / 2;
  // En haut, de quoi laisser voir la zone sous le bandeau (trois lignes en maquette).
  return { top: 120, right: 56, bottom: bas + 24, left: 24 };
}

function couleur(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/** Motif de hachures diagonales pour signaler une confiance moyenne ou faible. */
function hachures(opacite: number): ImageData {
  const taille = 8;
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.canvas.width = ctx.canvas.height = taille;
  ctx.strokeStyle = `rgba(16, 24, 40, ${opacite})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, taille);
  ctx.lineTo(taille, 0);
  ctx.moveTo(-taille / 2, taille / 2);
  ctx.lineTo(taille / 2, -taille / 2);
  ctx.moveTo(taille / 2, taille * 1.5);
  ctx.lineTo(taille * 1.5, taille / 2);
  ctx.stroke();
  return ctx.getImageData(0, 0, taille, taille);
}

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
};

const VIDE = { type: "FeatureCollection" as const, features: [] };

export default function CarteZones({
  zones,
  selection = null,
  onSelection,
  mode = "priorite",
  eau = null,
  feuille = "apercu",
}: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const carte = useRef<CarteMapLibre | null>(null);
  const [prete, setPrete] = useState(false);
  const selPrecedente = useRef<string | null>(null);
  const dejaCadre = useRef<unknown>(null);
  const rappel = useRef(onSelection);
  rappel.current = onSelection;
  const contour = useRef(mode === "contour");

  useEffect(() => {
    if (!conteneur.current) return;
    const map = new CarteMapLibre({
      container: conteneur.current,
      style: STYLE_CARTE,
      center: CENTRE,
      zoom: 12,
      attributionControl: { compact: false, customAttribution: ATTRIBUTION },
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    carte.current = map;
    // Le verre devient opaque pendant un déplacement : le flou recalculé à chaque image coûte cher sur téléphone.
    const racine = document.documentElement;
    map.on("movestart", () => racine.setAttribute("data-carte-bouge", ""));
    map.on("moveend", () => racine.removeAttribute("data-carte-bouge"));

    const infobulle = new Popup({ closeButton: false, closeOnClick: false, offset: 8 });
    let survol: string | number | undefined;

    map.on("load", () => {
      map.addImage("hachures-legeres", hachures(0.25));
      map.addImage("hachures-fortes", hachures(0.55));
      map.addSource("zones", { type: "geojson", data: VIDE, promoteId: "id" });
      map.addSource("eau", { type: "geojson", data: VIDE });
      const priorites: Priorite[] = ["forte", "moyenne", "faible", "nulle"];
      const couleurPriorite = [
        "match",
        ["get", "priorite"],
        ...priorites.flatMap((p) => [p, couleur(VARIABLE_PRIORITE[p])]),
        couleur("--prio-none"),
      ] as unknown as string;
      // Une maille H3 fait 300 m : de loin, un halo de sa couleur la garde visible.
      map.addLayer({
        id: "zones-halo",
        type: "line",
        source: "zones",
        filter: contour.current ? ["boolean", false] : ["boolean", true],
        paint: {
          "line-color": couleurPriorite,
          "line-width": ["interpolate", ["linear"], ["zoom"], 11, 12, 14, 4, 15, 0],
          "line-opacity": 0.6,
        },
      });
      map.addLayer({
        id: "zones-fond",
        type: "fill",
        source: "zones",
        paint: {
          "fill-color": couleurPriorite,
          "fill-opacity": contour.current ? 0 : 0.6,
        },
      });
      map.addLayer({
        id: "zones-hachures",
        type: "fill",
        source: "zones",
        filter: contour.current ? ["boolean", false] : ["!=", ["get", "confiance"], "elevee"],
        paint: {
          "fill-pattern": ["match", ["get", "confiance"], "faible", "hachures-fortes", "hachures-legeres"],
        },
      });
      map.addLayer({
        id: "zones-contour",
        type: "line",
        source: "zones",
        paint: { "line-color": contour.current ? couleur("--ink-2") : "#ffffff", "line-width": 1 },
      });
      map.addLayer({
        id: "zones-contour-faible",
        type: "line",
        source: "zones",
        filter: ["==", ["get", "confiance"], "faible"],
        paint: { "line-color": couleur("--ink"), "line-width": 1, "line-dasharray": [2, 2] },
      });
      map.addLayer({
        id: "eau-fond",
        type: "fill",
        source: "eau",
        paint: { "fill-color": couleur("--water"), "fill-opacity": Number(couleur("--water-opacity")) || 0.55 },
      });
      map.addLayer({
        id: "eau-contour",
        type: "line",
        source: "eau",
        paint: { "line-color": couleur("--water-line"), "line-width": 1 },
      });
      map.addLayer({
        id: "zones-etat",
        type: "line",
        source: "zones",
        paint: {
          "line-color": [
            "case",
            ["boolean", ["feature-state", "selection"], false],
            couleur("--primary"),
            couleur("--ink"),
          ],
          // « pulse » (0 à 1) épaissit le contour une fois, à la sélection.
          "line-width": [
            "case",
            ["boolean", ["feature-state", "selection"], false],
            ["+", 3, ["*", 4, ["number", ["feature-state", "pulse"], 0]]],
            1.5,
          ],
          "line-opacity": [
            "case",
            [
              "any",
              ["boolean", ["feature-state", "selection"], false],
              ["boolean", ["feature-state", "survol"], false],
            ],
            1,
            0,
          ],
        },
      });
      setPrete(true);
    });

    map.on("mousemove", ["zones-fond", "zones-halo"], (e) => {
      const f: MapGeoJSONFeature | undefined = e.features?.[0];
      if (!f) return;
      if (survol !== undefined) map.setFeatureState({ source: "zones", id: survol }, { survol: false });
      survol = f.id;
      map.setFeatureState({ source: "zones", id: survol! }, { survol: true });
      map.getCanvas().style.cursor = "pointer";
      const p = f.properties as { nom: string; priorite: Priorite };
      infobulle.setLngLat(e.lngLat).setText(`${p.nom} · ${LIBELLE_PRIORITE[p.priorite]}`).addTo(map);
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
      racine.removeAttribute("data-carte-bouge");
      map.remove();
      carte.current = null;
    };
  }, []);

  useEffect(() => {
    if (!prete) return;
    (carte.current?.getSource("zones") as GeoJSONSource | undefined)?.setData(zones);
  }, [prete, zones]);

  useEffect(() => {
    if (!prete) return;
    (carte.current?.getSource("eau") as GeoJSONSource | undefined)?.setData(
      (eau ?? VIDE) as Parameters<GeoJSONSource["setData"]>[0],
    );
  }, [prete, eau]);

  // Cadrage sur l'eau détectée s'il y en a, sinon sur les zones ; une fois par jeu de données.
  useEffect(() => {
    const map = carte.current;
    const cible = eau?.features.length ? eau : zones;
    if (!prete || !map || dejaCadre.current === cible) return;
    dejaCadre.current = cible;
    const rect = emprise(cible.features);
    if (rect) map.fitBounds(rect, { padding: marges(feuille), maxZoom: 15, duration: 0 });
  }, [prete, zones, eau, feuille]);

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
    if (rect) map.fitBounds(rect, { padding: marges("moitie"), maxZoom: Math.max(map.getZoom(), 15) });
    return () => cancelAnimationFrame(image);
  }, [prete, selection, zones]);

  // La feuille de style MapLibre impose position: relative au conteneur, d'où l'enveloppe.
  return (
    <div className="absolute inset-0">
      <div ref={conteneur} className="h-full w-full" role="region" aria-label="Carte des zones" />
      {!prete && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-line">
          <ChargeurGoutte libelle="Chargement du fond de carte" />
          <p className="text-petit text-ink-2" aria-hidden>
            Chargement du fond de carte…
          </p>
        </div>
      )}
    </div>
  );
}
