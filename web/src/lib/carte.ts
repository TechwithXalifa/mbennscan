// Réglages et couches de la carte des zones (MapLibre), séparés du composant qui les affiche.
import type { ExpressionSpecification, Map as CarteMapLibre, StyleSpecification } from "maplibre-gl";
import { jeton } from "@/lib/design";
import { formatNombre } from "@/lib/format";
import { LIBELLE_CONFIANCE, LIBELLE_PRIORITE, PRIORITES, VARIABLE_PRIORITE } from "@/lib/priorite";
import type { Theme } from "@/lib/theme";
import type { ZoneSynthese } from "@/types/contracts";

// Vue de départ : département de Keur Massar, zoom 12 (cahier des charges, section 6).
export const CENTRE: [number, number] = [-17.315, 14.78];
export const ATTRIBUTION = "© les contributeurs d'OpenStreetMap · Copernicus Sentinel · WorldPop";
// Au-delà, le fond de carte est jugé lent : l'utilisateur peut réessayer ou continuer sans fond.
export const DELAI_FOND_MS = 12_000;

export type Couches = { priorite: boolean; confiance: boolean; eau: boolean };

/**
 * Marges du cadrage. Sur mobile, la feuille du bas couvre le bas de la carte :
 * `feuille` est la part de l'écran qu'elle occupe (aperçu ou moitié).
 */
export function marges(feuille: "apercu" | "moitie") {
  if (window.matchMedia("(min-width: 1024px)").matches) return { top: 72, right: 72, bottom: 48, left: 48 };
  const bas = feuille === "apercu" ? 140 : window.innerHeight / 2;
  // En haut, de quoi laisser voir la zone sous le bandeau.
  return { top: 96, right: 64, bottom: bas + 24, left: 24 };
}

/** Motif de hachures diagonales pour signaler une confiance moyenne ou faible, à la couleur de l'encre du thème. */
function hachures(opacite: number, encre: string): ImageData {
  const taille = 8;
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.canvas.width = ctx.canvas.height = taille;
  ctx.globalAlpha = opacite;
  ctx.strokeStyle = encre;
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

/** Fond uni, sans tuile : la carte reste utilisable si le fond de carte ne répond pas. */
export function styleVide(): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [{ id: "fond-uni", type: "background", paint: { "background-color": jeton("--surface-3") } }],
  };
}

export function themeDuDocument(): Theme {
  return document.documentElement.dataset.theme === "clair" ? "clair" : "sombre";
}

/** Contenu de l'infobulle de survol, aux couleurs des jetons (le texte est construit sans HTML). */
export function contenuInfobulle(p: ZoneSynthese, contour: boolean): HTMLElement {
  const racine = document.createElement("div");
  racine.className = "verre min-w-[180px] max-w-[260px] rounded-md px-3 py-2 text-petit text-ink";
  const ligne = (texte: string, classe: string) => {
    const el = document.createElement("p");
    el.className = classe;
    el.textContent = texte;
    racine.appendChild(el);
  };
  ligne(p.nom, "font-semibold leading-5");
  ligne(p.commune, "text-mention font-normal text-ink-3");
  if (!contour) {
    ligne(LIBELLE_PRIORITE[p.priorite], "mt-1 text-ink");
    if (p.priorite !== "nulle")
      ligne(
        `${formatNombre(Math.round(Number(p.habitants_jours_an)))} habitants-jours par an`,
        "tabular-nums text-ink-2",
      );
  }
  ligne(`Confiance ${LIBELLE_CONFIANCE[p.confiance].toLowerCase()}`, "text-ink-2");
  return racine;
}

/**
 * Motifs et couches des zones et de l'eau, aux couleurs du thème courant.
 * Les sources « zones » et « eau » doivent déjà exister. À refaire à chaque changement de style.
 */
export function ajouterCouches(map: CarteMapLibre, contour: boolean, sansFond: boolean) {
  const encre = jeton("--ink");
  if (!map.hasImage("hachures-legeres")) map.addImage("hachures-legeres", hachures(0.3, encre));
  if (!map.hasImage("hachures-fortes")) map.addImage("hachures-fortes", hachures(0.6, encre));

  // Fond sombre recoloré en bleu nuit, pour rester dans la palette de l'interface.
  if (themeDuDocument() === "sombre" && !sansFond) {
    if (map.getLayer("background")) map.setPaintProperty("background", "background-color", jeton("--bg"));
    if (map.getLayer("water")) map.setPaintProperty("water", "fill-color", jeton("--surface-3"));
  }

  const couleurPriorite = [
    "match",
    ["get", "priorite"],
    ...PRIORITES.flatMap((p) => [p, jeton(VARIABLE_PRIORITE[p])]),
    jeton("--prio-none"),
  ] as unknown as ExpressionSpecification;

  // Une maille H3 fait 300 m : de loin, un halo de sa couleur la garde visible.
  map.addLayer({
    id: "zones-halo",
    type: "line",
    source: "zones",
    paint: {
      "line-color": couleurPriorite,
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 12, 14, 4, 15, 0],
      "line-opacity": 0.55,
    },
  });
  map.addLayer({
    id: "zones-fond",
    type: "fill",
    source: "zones",
    paint: { "fill-color": couleurPriorite, "fill-opacity": contour ? 0 : Number(jeton("--zone-opacity")) || 0.6 },
  });
  map.addLayer({
    id: "zones-hachures",
    type: "fill",
    source: "zones",
    paint: {
      "fill-pattern": ["match", ["get", "confiance"], "faible", "hachures-fortes", "hachures-legeres"],
    },
  });
  map.addLayer({
    id: "zones-contour",
    type: "line",
    source: "zones",
    paint: { "line-color": contour ? jeton("--ink-2") : jeton("--surface"), "line-width": 1 },
  });
  map.addLayer({
    id: "zones-contour-faible",
    type: "line",
    source: "zones",
    paint: { "line-color": encre, "line-width": 1, "line-dasharray": [2, 2] },
  });
  map.addLayer({
    id: "eau-fond",
    type: "fill",
    source: "eau",
    paint: { "fill-color": jeton("--water"), "fill-opacity": Number(jeton("--water-opacity")) || 0.55 },
  });
  map.addLayer({
    id: "eau-contour",
    type: "line",
    source: "eau",
    paint: { "line-color": jeton("--water-line"), "line-width": 1 },
  });
  map.addLayer({
    id: "zones-etat",
    type: "line",
    source: "zones",
    paint: {
      "line-color": ["case", ["boolean", ["feature-state", "selection"], false], jeton("--primary-ink"), encre],
      // « pulse » (0 à 1) épaissit le contour une fois, à la sélection.
      "line-width": [
        "case",
        ["boolean", ["feature-state", "selection"], false],
        ["+", 3, ["*", 4, ["coalesce", ["feature-state", "pulse"], 0]]],
        1.5,
      ],
      "line-opacity": [
        "case",
        ["any", ["boolean", ["feature-state", "selection"], false], ["boolean", ["feature-state", "survol"], false]],
        1,
        0,
      ],
    },
  });
}
