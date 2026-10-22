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
import { LIBELLE_PRIORITE, VARIABLE_PRIORITE } from "@/lib/priorite";
import type { EauGeoJSON, Priorite, ZonesGeoJSON } from "@/types/contracts";

// Vue de départ : département de Keur Massar, zoom 12 (cahier des charges, section 6).
const CENTRE: [number, number] = [-17.315, 14.78];
const STYLE = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/positron";
const ATTRIBUTION = "© les contributeurs d'OpenStreetMap · Copernicus Sentinel · WorldPop";

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
};

const VIDE = { type: "FeatureCollection" as const, features: [] };

export default function CarteZones({ zones, selection = null, onSelection, mode = "priorite", eau = null }: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const carte = useRef<CarteMapLibre | null>(null);
  const [prete, setPrete] = useState(false);
  const selPrecedente = useRef<string | null>(null);
  const rappel = useRef(onSelection);
  rappel.current = onSelection;
  const contour = useRef(mode === "contour");

  useEffect(() => {
    if (!conteneur.current) return;
    const map = new CarteMapLibre({
      container: conteneur.current,
      style: STYLE,
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
      map.addLayer({
        id: "zones-fond",
        type: "fill",
        source: "zones",
        paint: {
          "fill-color": [
            "match",
            ["get", "priorite"],
            ...priorites.flatMap((p) => [p, couleur(VARIABLE_PRIORITE[p])]),
            couleur("--prio-none"),
          ] as unknown as string,
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
          "line-width": ["case", ["boolean", ["feature-state", "selection"], false], 3, 1.5],
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

    map.on("mousemove", "zones-fond", (e) => {
      const f: MapGeoJSONFeature | undefined = e.features?.[0];
      if (!f) return;
      if (survol !== undefined) map.setFeatureState({ source: "zones", id: survol }, { survol: false });
      survol = f.id;
      map.setFeatureState({ source: "zones", id: survol! }, { survol: true });
      map.getCanvas().style.cursor = "pointer";
      const p = f.properties as { nom: string; priorite: Priorite };
      infobulle.setLngLat(e.lngLat).setText(`${p.nom} · ${LIBELLE_PRIORITE[p.priorite]}`).addTo(map);
    });
    map.on("mouseleave", "zones-fond", () => {
      if (survol !== undefined) map.setFeatureState({ source: "zones", id: survol }, { survol: false });
      survol = undefined;
      map.getCanvas().style.cursor = "";
      infobulle.remove();
    });
    map.on("click", "zones-fond", (e) => {
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

  useEffect(() => {
    const map = carte.current;
    if (!prete || !map) return;
    // MapLibre exige un id pour effacer une clé d'état : on n'efface que l'ancienne sélection.
    if (selPrecedente.current) map.removeFeatureState({ source: "zones", id: selPrecedente.current }, "selection");
    selPrecedente.current = selection;
    if (!selection) return;
    map.setFeatureState({ source: "zones", id: selection }, { selection: true });
    // Choix depuis la liste : centrer la zone si elle est hors de la vue.
    const anneau = zones.features.find((f) => f.properties.id === selection)?.geometry.coordinates[0];
    if (!anneau) return;
    const centre: [number, number] = [
      anneau.reduce((s, p) => s + p[0], 0) / anneau.length,
      anneau.reduce((s, p) => s + p[1], 0) / anneau.length,
    ];
    if (!map.getBounds().contains(centre)) map.easeTo({ center: centre, zoom: Math.max(map.getZoom(), 14) });
  }, [prete, selection, zones]);

  // La feuille de style MapLibre impose position: relative au conteneur, d'où l'enveloppe.
  return (
    <div className="absolute inset-0">
      <div ref={conteneur} className="h-full w-full" role="region" aria-label="Carte des zones" />
    </div>
  );
}
