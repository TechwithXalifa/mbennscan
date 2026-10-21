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
import type { Priorite, ZonesGeoJSON } from "@/types/contracts";

// Vue de départ : département de Keur Massar, zoom 12 (cahier des charges, section 6).
const CENTRE: [number, number] = [-17.315, 14.78];
const STYLE = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/positron";
const ATTRIBUTION = "© les contributeurs d'OpenStreetMap · Copernicus Sentinel · WorldPop";

function couleur(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

type Props = {
  zones: ZonesGeoJSON;
  selection?: string | null;
  onSelection?: (id: string) => void;
};

export default function CarteZones({ zones, selection = null, onSelection }: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const carte = useRef<CarteMapLibre | null>(null);
  const [prete, setPrete] = useState(false);
  const selPrecedente = useRef<string | null>(null);
  const rappel = useRef(onSelection);
  rappel.current = onSelection;

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

    const infobulle = new Popup({ closeButton: false, closeOnClick: false, offset: 8 });
    let survol: string | number | undefined;

    map.on("load", () => {
      map.addSource("zones", { type: "geojson", data: { type: "FeatureCollection", features: [] }, promoteId: "id" });
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
          "fill-opacity": 0.6,
        },
      });
      map.addLayer({
        id: "zones-contour",
        type: "line",
        source: "zones",
        paint: { "line-color": "#ffffff", "line-width": 1 },
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
      map.remove();
      carte.current = null;
    };
  }, []);

  useEffect(() => {
    if (!prete) return;
    (carte.current?.getSource("zones") as GeoJSONSource | undefined)?.setData(zones);
  }, [prete, zones]);

  useEffect(() => {
    const map = carte.current;
    if (!prete || !map) return;
    // MapLibre exige un id pour effacer une clé d'état : on n'efface que l'ancienne sélection.
    if (selPrecedente.current) map.removeFeatureState({ source: "zones", id: selPrecedente.current }, "selection");
    if (selection) map.setFeatureState({ source: "zones", id: selection }, { selection: true });
    selPrecedente.current = selection;
  }, [prete, selection, zones]);

  // La feuille de style MapLibre impose position: relative au conteneur, d'où l'enveloppe.
  return (
    <div className="absolute inset-0">
      <div ref={conteneur} className="h-full w-full" role="region" aria-label="Carte des zones" />
    </div>
  );
}
