// Edge Function « mesure » : reçoit les mesures de la balise (ESP32).
//
// POST  Authorization: Bearer <clé de la balise>
//       {"balise_id":"bal-01","distance_cm":37.4,"batterie_v":null,"rssi":-61}
//
// 201 enregistrée · 400 corps invalide · 401 clé absente/fausse · 405 mauvaise méthode
// 429 plus d'une mesure par seconde et par balise · 500 erreur serveur
//
// Déploiement : supabase functions deploy mesure   (verify_jwt = false dans config.toml :
// la clé de balise n'est pas un JWT).

import { createClient } from "npm:@supabase/supabase-js@2";
import { type MesureEntrante, validerMesure } from "./validate.ts";

/** Accès à la base, injectable pour les tests. */
export interface Acces {
  /** Hachage SHA-256 (hex) de la clé de la balise, ou null si la balise n'existe pas. */
  cleHash(baliseId: string): Promise<string | null>;
  /** Date (ms) de la dernière mesure de la balise, ou null s'il n'y en a pas. */
  dernierTs(baliseId: string): Promise<number | null>;
  inserer(m: MesureEntrante): Promise<void>;
}

const INTERVALLE_MIN_MS = 1000;
// Comparé quand la balise n'existe pas, pour que le temps de réponse ne révèle pas son existence.
const HASH_FICTIF = "0".repeat(64);

const json = (statut: number, corps: unknown, entetes: HeadersInit = {}) =>
  new Response(JSON.stringify(corps), {
    status: statut,
    headers: { "Content-Type": "application/json", ...entetes },
  });

async function sha256Hex(texte: string): Promise<string> {
  const octets = new TextEncoder().encode(texte);
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", octets));
  return Array.from(h, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparaison en temps constant (pas de sortie anticipée sur le premier octet différent). */
export function egalTempsConstant(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function traiter(
  req: Request,
  acces: Acces,
  maintenant = Date.now(),
): Promise<Response> {
  if (req.method !== "POST") {
    return json(405, { erreur: "méthode non autorisée" }, { Allow: "POST" });
  }

  const auth = req.headers.get("Authorization") ?? "";
  const cle = /^Bearer (.+)$/.exec(auth)?.[1]?.trim();
  if (!cle) return json(401, { erreur: "clé manquante" });

  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return json(400, { erreur: "JSON invalide" });
  }
  const v = validerMesure(corps);
  if (!v.ok) return json(400, { erreur: v.erreur });
  const { mesure } = v;

  try {
    // La clé est cherchée pour le balise_id du corps : la clé de bal-01 ne peut pas écrire pour bal-02.
    const attendu = await acces.cleHash(mesure.balise_id);
    const fourni = await sha256Hex(cle);
    const cleOk = egalTempsConstant(
      fourni,
      (attendu ?? HASH_FICTIF).toLowerCase(),
    );
    if (attendu === null || !cleOk) {
      return json(401, { erreur: "clé invalide" });
    }

    // Limite lue en base (une Edge Function peut tourner en plusieurs copies : pas de compteur en mémoire).
    const dernier = await acces.dernierTs(mesure.balise_id);
    if (dernier !== null && maintenant - dernier < INTERVALLE_MIN_MS) {
      return json(429, { erreur: "une mesure par seconde au maximum" }, {
        "Retry-After": "1",
      });
    }

    await acces.inserer(mesure);
    return json(201, { ok: true });
  } catch (e) {
    console.error("[mesure]", e);
    return json(500, { erreur: "erreur serveur" });
  }
}

function accesSupabase(): Acces {
  const url = Deno.env.get("SUPABASE_URL");
  const cleService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !cleService) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY absents");
  }
  const db = createClient(url, cleService, { auth: { persistSession: false } });

  return {
    async cleHash(id) {
      const { data, error } = await db.from("balises").select("cle_api_hash")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data?.cle_api_hash ?? null;
    },
    async dernierTs(id) {
      const { data, error } = await db.from("mesures").select("ts").eq(
        "balise_id",
        id,
      )
        .order("ts", { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data ? new Date(data.ts).getTime() : null;
    },
    async inserer(m) {
      // niveau_cm est calculé par le trigger ; ts vaut now() par défaut.
      const { error } = await db.from("mesures").insert(m);
      if (error) throw error;
    },
  };
}

if (import.meta.main) {
  Deno.serve((req) => traiter(req, accesSupabase()));
}
