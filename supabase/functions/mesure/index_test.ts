import { deepStrictEqual } from "node:assert";

const assertEquals = (a: unknown, b: unknown) => deepStrictEqual(a, b);
import { type Acces, egalTempsConstant, traiter } from "./index.ts";
import { validerMesure } from "./validate.ts";

const CLE = "cle-secrete-bal-01";
const HASH = Array.from(
  new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(CLE)),
  ),
  (b) => b.toString(16).padStart(2, "0"),
).join("");

function faux(
  opts: {
    hash?: Record<string, string>;
    dernier?: number | null;
    echec?: boolean;
  } = {},
) {
  const inserees: unknown[] = [];
  const acces: Acces = {
    cleHash: (id) => {
      if (opts.echec) throw new Error("base indisponible");
      return Promise.resolve((opts.hash ?? { "bal-01": HASH })[id] ?? null);
    },
    dernierTs: () => Promise.resolve(opts.dernier ?? null),
    inserer: (m) => {
      inserees.push(m);
      return Promise.resolve();
    },
  };
  return { acces, inserees };
}

const requete = (corps: unknown, cle: string | null = CLE, methode = "POST") =>
  new Request("http://x/mesure", {
    method: methode,
    headers: cle === null ? {} : { Authorization: `Bearer ${cle}` },
    body: methode === "GET"
      ? undefined
      : typeof corps === "string"
      ? corps
      : JSON.stringify(corps),
  });

const OK = { balise_id: "bal-01", distance_cm: 37.4 };

Deno.test("201 : mesure valide enregistrée (champs facultatifs à null)", async () => {
  const { acces, inserees } = faux();
  const r = await traiter(requete({ ...OK, rssi: null }), acces);
  assertEquals(r.status, 201);
  assertEquals(inserees, [{
    balise_id: "bal-01",
    distance_cm: 37.4,
    batterie_v: null,
    rssi: null,
  }]);
});

Deno.test("405 : GET refusé", async () => {
  assertEquals(
    (await traiter(requete(null, CLE, "GET"), faux().acces)).status,
    405,
  );
});

Deno.test("401 : clé absente", async () => {
  assertEquals((await traiter(requete(OK, null), faux().acces)).status, 401);
});

Deno.test("401 : mauvaise clé, rien d'écrit", async () => {
  const { acces, inserees } = faux();
  assertEquals((await traiter(requete(OK, "autre"), acces)).status, 401);
  assertEquals(inserees.length, 0);
});

Deno.test("401 : balise inconnue", async () => {
  const r = await traiter(
    requete({ ...OK, balise_id: "bal-09" }),
    faux().acces,
  );
  assertEquals(r.status, 401);
});

Deno.test("401 : la clé de bal-01 n'écrit pas pour bal-02", async () => {
  const { acces, inserees } = faux({
    hash: { "bal-01": HASH, "bal-02": "f".repeat(64) },
  });
  assertEquals(
    (await traiter(requete({ ...OK, balise_id: "bal-02" }), acces)).status,
    401,
  );
  assertEquals(inserees.length, 0);
});

Deno.test("400 : JSON invalide, champ inconnu, distance hors bornes, rssi décimal", async () => {
  const { acces } = faux();
  assertEquals((await traiter(requete("{pas du json"), acces)).status, 400);
  assertEquals((await traiter(requete({ ...OK, ts: 1 }), acces)).status, 400);
  assertEquals(
    (await traiter(requete({ ...OK, distance_cm: 10 }), acces)).status,
    400,
  );
  assertEquals(
    (await traiter(requete({ ...OK, rssi: -61.5 }), acces)).status,
    400,
  );
});

Deno.test("429 : deuxième mesure moins d'une seconde après", async () => {
  const t = 1_000_000;
  const { acces, inserees } = faux({ dernier: t - 400 });
  const r = await traiter(requete(OK), acces, t);
  assertEquals(r.status, 429);
  assertEquals(r.headers.get("Retry-After"), "1");
  assertEquals(inserees.length, 0);
});

Deno.test("201 : mesure une seconde après la précédente", async () => {
  const t = 1_000_000;
  assertEquals(
    (await traiter(requete(OK), faux({ dernier: t - 1000 }).acces, t)).status,
    201,
  );
});

Deno.test("500 : base indisponible, sans détail renvoyé", async () => {
  const r = await traiter(requete(OK), faux({ echec: true }).acces);
  assertEquals(r.status, 500);
  assertEquals(await r.json(), { erreur: "erreur serveur" });
});

Deno.test("egalTempsConstant", () => {
  assertEquals(egalTempsConstant("abc", "abc"), true);
  assertEquals(egalTempsConstant("abc", "abd"), false);
  assertEquals(egalTempsConstant("abc", "abcd"), false);
});

Deno.test("validerMesure : bornes de batterie_v et de distance_cm", () => {
  assertEquals(validerMesure({ ...OK, distance_cm: 20 }).ok, true);
  assertEquals(validerMesure({ ...OK, distance_cm: 600 }).ok, true);
  assertEquals(validerMesure({ ...OK, distance_cm: 601 }).ok, false);
  assertEquals(validerMesure({ ...OK, distance_cm: NaN }).ok, false);
  assertEquals(validerMesure({ ...OK, batterie_v: 5.6 }).ok, false);
  assertEquals(
    validerMesure({ balise_id: "bal-1", distance_cm: 30 }).ok,
    false,
  );
  assertEquals(validerMesure([]).ok, false);
});
