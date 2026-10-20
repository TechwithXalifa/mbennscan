// Seule couche d'accès aux données de l'application.
// NEXT_PUBLIC_USE_MOCKS=true : lit public/mocks/ (copie de contracts/mocks, valeurs [FICTIF]).
// Sinon : Supabase avec la clé anon uniquement (lecture seule, RLS).
// Les appels sont faits depuis le navigateur (chemins relatifs vers public/).

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Balise,
  Evenement,
  ImpactEvenement,
  IndicateurSaison,
  Mesure,
  RunMeta,
  ZoneDetail,
  ZoneSynthese,
  ZonesGeoJSON,
} from "@/types/contracts";

export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export class DataError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DataError";
  }
}

let client: SupabaseClient | null = null;

// Chargé à la demande : le mode mocks n'embarque pas le client Supabase.
async function supabase(): Promise<SupabaseClient> {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new DataError(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis quand NEXT_PUBLIC_USE_MOCKS n'est pas à true.",
    );
  }
  const { createClient } = await import("@supabase/supabase-js");
  client = createClient(url, anonKey, { auth: { persistSession: false } });
  return client;
}

async function lireJson<T>(chemin: string): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(chemin);
  } catch (cause) {
    throw new DataError(`Réseau indisponible (${chemin})`, { cause });
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new DataError(`Lecture impossible : ${chemin} (${res.status})`);
  return (await res.json()) as T;
}

async function lireMock<T>(fichier: string): Promise<T | null> {
  return lireJson<T>(`/mocks/${fichier}`);
}

function verifier<T>(data: T | null, error: { message: string } | null, quoi: string): T {
  if (error) throw new DataError(`${quoi} : ${error.message}`, { cause: error });
  if (data === null) throw new DataError(`${quoi} : réponse vide`);
  return data;
}

// ── E1 : carte et top 10 ────────────────────────────────────────────────────

export async function getZones(): Promise<ZonesGeoJSON> {
  if (USE_MOCKS) {
    const zones = await lireMock<ZonesGeoJSON>("zones.json");
    return zones ?? { type: "FeatureCollection", features: [] };
  }
  const { data, error } = await (await supabase()).rpc("zones_geojson");
  return verifier(data as ZonesGeoJSON | null, error, "Zones");
}

// ── E2 : fiche zone ─────────────────────────────────────────────────────────

type LigneSynthese = Omit<ZoneSynthese, "id" | "nom" | "commune" | "population" | "part_bati"> & {
  zone_id: string;
};

type LigneZone = Pick<ZoneSynthese, "id" | "nom" | "commune" | "population" | "part_bati"> & {
  // Relation 1-1 : PostgREST renvoie un objet, parfois un tableau selon la version.
  syntheses: LigneSynthese | LigneSynthese[] | null;
  indicateurs_saison: IndicateurSaison[];
};

export async function getZoneDetail(id: string): Promise<ZoneDetail | null> {
  if (USE_MOCKS) {
    const detail = await lireMock<ZoneDetail>(`zone_detail_${id}.json`);
    if (detail) return detail;
    // Les mocks n'ont qu'une fiche complète : pour les autres zones, synthèse seule.
    const zones = await getZones();
    const zone = zones.features.find((f) => f.properties.id === id)?.properties;
    return zone ? { zone, indicateurs_saison: [] } : null;
  }
  const { data, error } = await (
    await supabase()
  )
    .from("zones")
    .select("id,nom,commune,population,part_bati,syntheses(*),indicateurs_saison(*)")
    .eq("id", id)
    .maybeSingle<LigneZone>();
  if (error) throw new DataError(`Zone ${id} : ${error.message}`, { cause: error });
  if (!data) return null;
  const synthese = Array.isArray(data.syntheses) ? data.syntheses[0] : data.syntheses;
  if (!synthese) return null;
  const { zone_id: _zoneId, ...reste } = synthese;
  void _zoneId;
  return {
    zone: {
      id: data.id,
      nom: data.nom,
      commune: data.commune,
      population: data.population,
      part_bati: data.part_bati,
      ...reste,
    },
    indicateurs_saison: [...data.indicateurs_saison].sort((a, b) => a.annee - b.annee),
  };
}

// ── E3 : après une pluie ────────────────────────────────────────────────────

export async function getEvenements(): Promise<Evenement[]> {
  if (USE_MOCKS) {
    const evenements = (await lireMock<Evenement[]>("evenements.json")) ?? [];
    return [...evenements].sort((a, b) => b.date_pluie.localeCompare(a.date_pluie));
  }
  const { data, error } = await (
    await supabase()
  )
    .from("evenements")
    .select("id,date_pluie,pluie_mm,station,date_image,eau_geojson")
    .order("date_pluie", { ascending: false });
  return verifier(data as Evenement[] | null, error, "Épisodes");
}

export async function getImpacts(evenementId: number): Promise<ImpactEvenement[]> {
  if (USE_MOCKS) {
    const impacts = (await lireMock<ImpactEvenement[]>(`impacts_evenement_${evenementId}.json`)) ?? [];
    return [...impacts].sort((a, b) => b.habitants_touches - a.habitants_touches);
  }
  const { data, error } = await (
    await supabase()
  )
    .from("impacts_evenement")
    .select("*")
    .eq("evenement_id", evenementId)
    .order("habitants_touches", { ascending: false });
  return verifier(data as ImpactEvenement[] | null, error, `Impacts de l'épisode ${evenementId}`);
}

// ── E5 : balise ─────────────────────────────────────────────────────────────

export async function getBalise(id: string): Promise<Balise | null> {
  if (USE_MOCKS) {
    const balises = (await lireMock<Balise[]>("balises.json")) ?? [];
    return balises.find((b) => b.id === id) ?? null;
  }
  const { data, error } = await (
    await supabase()
  )
    .from("balises_publiques")
    .select("*")
    .eq("id", id)
    .maybeSingle<Balise>();
  if (error) throw new DataError(`Balise ${id} : ${error.message}`, { cause: error });
  return data;
}

/** Dernières mesures d'une balise, de la plus récente à la plus ancienne. */
export async function getMesures(baliseId: string, limite = 500): Promise<Mesure[]> {
  if (USE_MOCKS) {
    const mesures = (await lireMock<Mesure[]>("mesures.json")) ?? [];
    return mesures
      .filter((m) => m.balise_id === baliseId)
      .sort((a, b) => b.ts.localeCompare(a.ts))
      .slice(0, limite);
  }
  const { data, error } = await (
    await supabase()
  )
    .from("mesures")
    .select("*")
    .eq("balise_id", baliseId)
    .order("ts", { ascending: false })
    .limit(limite);
  return verifier(data as Mesure[] | null, error, `Mesures de ${baliseId}`);
}

/**
 * Nouvelles mesures en direct (Supabase Realtime). Renvoie la fonction de désabonnement.
 * En mode mocks, aucune mesure n'arrive.
 */
export function abonnerMesures(baliseId: string, onMesure: (mesure: Mesure) => void): () => void {
  if (USE_MOCKS) return () => {};
  let actif = true;
  let arreter = () => {};
  void supabase().then((sb) => {
    if (!actif) return;
    const canal = sb
      .channel(`mesures:${baliseId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mesures", filter: `balise_id=eq.${baliseId}` },
        (payload) => onMesure(payload.new as Mesure),
      )
      .subscribe();
    arreter = () => void sb.removeChannel(canal);
  });
  return () => {
    actif = false;
    arreter();
  };
}

// ── E6 : méthode ────────────────────────────────────────────────────────────

/** run_meta n'est pas dans Supabase : hors mocks, il est lu dans public/data/run_meta.json. */
export async function getRunMeta(): Promise<RunMeta | null> {
  return USE_MOCKS ? lireMock<RunMeta>("run_meta.json") : lireJson<RunMeta>("/data/run_meta.json");
}
