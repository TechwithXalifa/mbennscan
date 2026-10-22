// Surface des polygones d'eau, calculée sur la sphère (même formule que d3-geo et Turf).
import type { EauGeoJSON, Position } from "@/types/contracts";

const RAYON_M = 6378137;
const rad = (d: number) => (d * Math.PI) / 180;

function aireAnneau(anneau: Position[]): number {
  let total = 0;
  for (let i = 0; i < anneau.length - 1; i++) {
    const [lon1, lat1] = anneau[i];
    const [lon2, lat2] = anneau[i + 1];
    total += rad(lon2 - lon1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return Math.abs((total * RAYON_M * RAYON_M) / 2);
}

function airePolygone(anneaux: Position[][]): number {
  // Premier anneau = contour extérieur, les suivants = trous.
  return anneaux.reduce((s, a, i) => (i === 0 ? s + aireAnneau(a) : s - aireAnneau(a)), 0);
}

type Emprise = [[number, number], [number, number]];

/** Rectangle [[ouest, sud], [est, nord]] qui contient toutes les géométries, ou null si elles sont vides. */
export function emprise(features: { geometry: { coordinates: unknown } }[]): Emprise | null {
  let [o, s, e, n] = [Infinity, Infinity, -Infinity, -Infinity];
  const parcourir = (c: unknown): void => {
    if (!Array.isArray(c)) return;
    if (typeof c[0] === "number") {
      o = Math.min(o, c[0]);
      e = Math.max(e, c[0]);
      s = Math.min(s, c[1] as number);
      n = Math.max(n, c[1] as number);
    } else c.forEach(parcourir);
  };
  features.forEach((f) => parcourir(f.geometry.coordinates));
  const sudOuest: [number, number] = [o, s];
  const nordEst: [number, number] = [e, n];
  return o === Infinity ? null : [sudOuest, nordEst];
}

/** Surface totale en hectares. */
export function surfaceHectares(eau: EauGeoJSON): number {
  let m2 = 0;
  for (const f of eau.features) {
    const g = f.geometry;
    if (g.type === "Polygon") m2 += airePolygone(g.coordinates as Position[][]);
    else for (const p of g.coordinates as Position[][][]) m2 += airePolygone(p);
  }
  return m2 / 10000;
}
