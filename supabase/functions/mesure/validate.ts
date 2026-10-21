// Validation du corps envoyé par la balise.
// Contrat : contracts/schemas/mesure_entrante.schema.json (à garder aligné).

export type MesureEntrante = {
  balise_id: string;
  distance_cm: number;
  batterie_v: number | null;
  rssi: number | null;
  /** Secondes écoulées depuis la mesure ; 0 si absent. */
  age_s: number;
};

export type Validation =
  | { ok: true; mesure: MesureEntrante }
  | { ok: false; erreur: string };

const CHAMPS_PERMIS = new Set(["balise_id", "distance_cm", "batterie_v", "rssi", "age_s"]);
const AGE_MAX_S = 86400; // 24 h

const refus = (erreur: string): Validation => ({ ok: false, erreur });

const nombreDans = (x: unknown, min: number, max: number): x is number =>
  typeof x === "number" && Number.isFinite(x) && x >= min && x <= max;

export function validerMesure(corps: unknown): Validation {
  if (typeof corps !== "object" || corps === null || Array.isArray(corps)) {
    return refus("le corps doit être un objet JSON");
  }
  const c = corps as Record<string, unknown>;

  for (const cle of Object.keys(c)) {
    if (!CHAMPS_PERMIS.has(cle)) return refus(`champ inconnu : ${cle}`);
  }

  if (typeof c.balise_id !== "string" || !/^bal-[0-9]{2}$/.test(c.balise_id)) {
    return refus("balise_id manquant ou invalide (attendu : bal-NN)");
  }
  if (!nombreDans(c.distance_cm, 20, 600)) {
    return refus("distance_cm manquant ou hors bornes (20 à 600)");
  }

  let batterie_v: number | null = null;
  if (c.batterie_v !== undefined && c.batterie_v !== null) {
    if (!nombreDans(c.batterie_v, 2.5, 5.5)) return refus("batterie_v hors bornes (2,5 à 5,5)");
    batterie_v = c.batterie_v;
  }

  let rssi: number | null = null;
  if (c.rssi !== undefined && c.rssi !== null) {
    if (!nombreDans(c.rssi, -120, 0) || !Number.isInteger(c.rssi)) {
      return refus("rssi doit être un entier entre -120 et 0");
    }
    rssi = c.rssi;
  }

  let age_s = 0;
  if (c.age_s !== undefined) {
    if (!nombreDans(c.age_s, 0, AGE_MAX_S) || !Number.isInteger(c.age_s)) {
      return refus(`age_s doit être un entier entre 0 et ${AGE_MAX_S}`);
    }
    age_s = c.age_s;
  }

  return { ok: true, mesure: { balise_id: c.balise_id, distance_cm: c.distance_cm, batterie_v, rssi, age_s } };
}
