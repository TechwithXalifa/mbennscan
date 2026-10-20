// Types écrits d'après contracts/schemas/. Aucun champ ne doit être ajouté ici
// sans PR « contract » (schéma + mocks + supabase/schema.sql).

export type Priorite = "forte" | "moyenne" | "faible" | "nulle";
export type ClasseEau = "ruissellement" | "intermediaire" | "stagnation";
export type Confiance = "elevee" | "moyenne" | "faible";
export type ActionSuggeree = "pomper" | "recenser" | "visiter";

/** [lon, lat] en WGS84 */
export type Position = [number, number];

// zones.schema.json
export interface ZoneSynthese {
  id: string;
  nom: string;
  commune: string;
  population: number | null;
  part_bati: number | null;
  habitants_jours_an: number;
  priorite: Priorite;
  rang: number | null;
  classe_eau: ClasseEau | null;
  confiance: Confiance;
  batiments_touches: number;
  ecoles_touchees: number;
  ecoles_noms: string[];
  routes_km: number;
  maj: string;
}

export interface ZonePolygon {
  type: "Polygon";
  coordinates: Position[][];
}

export interface ZoneFeature {
  type: "Feature";
  geometry: ZonePolygon;
  properties: ZoneSynthese;
}

export interface ZonesGeoJSON {
  type: "FeatureCollection";
  features: ZoneFeature[];
}

// zone_detail.schema.json
export interface IndicateurSaison {
  zone_id: string;
  annee: number;
  images_valides: number;
  images_inondees: number;
  /** null si aucune image valide : afficher « données insuffisantes » */
  frequence: number | null;
  duree_moy_jours: number | null;
  classe_eau: ClasseEau | null;
  habitants_jours: number;
}

export interface ZoneDetail {
  zone: ZoneSynthese;
  indicateurs_saison: IndicateurSaison[];
}

// evenements.schema.json
export interface EauGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: Position[][] | Position[][][];
}

export interface EauFeature {
  type: "Feature";
  geometry: EauGeometry;
  properties?: Record<string, unknown> | null;
}

export interface EauGeoJSON {
  type: "FeatureCollection";
  features: EauFeature[];
}

export interface Evenement {
  id: number;
  date_pluie: string;
  pluie_mm: number | null;
  station: string | null;
  /** Première image radar exploitable après la pluie ; null si aucune */
  date_image: string | null;
  eau_geojson: EauGeoJSON | null;
}

// impacts_evenement.schema.json
export interface ImpactEvenement {
  evenement_id: number;
  zone_id: string;
  surface_eau_pct: number;
  /** Arrondi à la dizaine */
  habitants_touches: number;
  batiments_touches: number;
  ecoles_touchees: number;
  action_suggeree: ActionSuggeree;
}

// balises.schema.json (vue balises_publiques, sans la clé)
export interface Balise {
  id: string;
  nom: string;
  lon: number;
  lat: number;
  hauteur_capteur_cm: number;
  seuil_alerte_cm: number | null;
}

// mesures.schema.json
export interface Mesure {
  id: number;
  balise_id: string;
  ts: string;
  distance_cm: number;
  /** Peut être négatif si la balise est mal étalonnée : afficher 0 et signaler */
  niveau_cm: number | null;
  batterie_v: number | null;
  rssi: number | null;
}

// mesure_entrante.schema.json (envoyée par le firmware, non lue par le web)
export interface MesureEntrante {
  balise_id: string;
  distance_cm: number;
  batterie_v?: number | null;
  rssi?: number | null;
}

// run_meta.schema.json
export interface RunMeta {
  date_calcul: string;
  version_pipeline: string;
  /** [lon_min, lat_min, lon_max, lat_max] */
  zone_etude_bbox: [number, number, number, number];
  periode: { debut: string; fin: string };
  parametres: {
    seuil_pluie_mm: number;
    seuil_db_defaut: number;
    seuil_db_min: number;
    seuil_db_max: number;
    baisse_min_db: number;
    part_zone_inondee_min: number;
    h3_resolution: number;
    persistance_courte_j: number;
    persistance_longue_j: number;
    occurrence_eau_permanente_min: number;
    pente_max_deg: number;
  };
  images: {
    id: string;
    date: string;
    orbite_relative: number;
    satellite: "S1A" | "S1B" | "S1C" | "S1D";
  }[];
  sources: string[];
}
