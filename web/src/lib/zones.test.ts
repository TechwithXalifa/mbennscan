import { describe, expect, it } from "vitest";
import { actifs, comparer, FILTRES_VIDES, filtrer, normaliser } from "@/lib/zones";
import type { ZoneSynthese } from "@/types/contracts";

const base: ZoneSynthese = {
  id: "z",
  nom: "Zone",
  commune: "Keur Massar",
  population: 1000,
  part_bati: 0.5,
  habitants_jours_an: 0,
  priorite: "faible",
  rang: 1,
  classe_eau: null,
  confiance: "elevee",
  batiments_touches: 0,
  ecoles_touchees: 0,
  ecoles_noms: [],
  routes_km: 0,
  maj: "2026-10-19T12:00:00Z",
};

const zones: ZoneSynthese[] = [
  {
    ...base,
    id: "a",
    nom: "[FICTIF] Médina Gounass",
    commune: "Guédiawaye",
    rang: 2,
    priorite: "forte",
    population: null,
  },
  { ...base, id: "b", nom: "[FICTIF] Malika, maille 4", commune: "Malika", rang: 1, confiance: "faible" },
  { ...base, id: "c", nom: "[FICTIF] Yeumbeul Sud", commune: "Yeumbeul", rang: null, priorite: "nulle" },
];

describe("normaliser", () => {
  it("retire la marque [FICTIF], les accents et les majuscules", () => {
    expect(normaliser("[FICTIF] Médina Gounass")).toBe("medina gounass");
  });
});

describe("filtrer", () => {
  it("garde tout sans filtre", () => {
    expect(filtrer(zones, FILTRES_VIDES)).toHaveLength(3);
    expect(actifs(FILTRES_VIDES)).toBe(false);
  });

  it("trouve un nom sans accent et une commune", () => {
    expect(filtrer(zones, { ...FILTRES_VIDES, recherche: "medina" }).map((z) => z.id)).toEqual(["a"]);
    expect(filtrer(zones, { ...FILTRES_VIDES, recherche: "GUEDIAWAYE" }).map((z) => z.id)).toEqual(["a"]);
  });

  it("combine priorité et confiance", () => {
    const f = { ...FILTRES_VIDES, priorites: ["faible" as const], confiance: "faible" as const };
    expect(filtrer(zones, f).map((z) => z.id)).toEqual(["b"]);
    expect(actifs(f)).toBe(true);
  });
});

describe("comparer", () => {
  it("classe par rang et laisse la zone non classée à la fin, dans les deux sens", () => {
    const asc = [...zones].sort((x, y) => comparer(x, y, { colonne: "rang", sens: "asc" }));
    const desc = [...zones].sort((x, y) => comparer(x, y, { colonne: "rang", sens: "desc" }));
    expect(asc.map((z) => z.id)).toEqual(["b", "a", "c"]);
    expect(desc.map((z) => z.id)).toEqual(["a", "b", "c"]);
  });

  it("met la population inconnue à la fin", () => {
    const tri = [...zones].sort((x, y) => comparer(x, y, { colonne: "population", sens: "desc" }));
    expect(tri.at(-1)?.id).toBe("a");
  });

  it("trie les noms sans tenir compte des accents ni de [FICTIF]", () => {
    const tri = [...zones].sort((x, y) => comparer(x, y, { colonne: "nom", sens: "asc" }));
    expect(tri.map((z) => z.id)).toEqual(["b", "a", "c"]);
  });
});
