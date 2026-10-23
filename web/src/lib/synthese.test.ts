import { describe, expect, it } from "vitest";
import { historique, ordinal, phraseSynthese, syntheseGlobale } from "@/lib/synthese";
import type { IndicateurSaison, ZoneSynthese } from "@/types/contracts";

function zone(p: Partial<ZoneSynthese>): ZoneSynthese {
  return {
    id: "z",
    nom: "Zone",
    commune: "Keur Massar",
    population: 1000,
    part_bati: 0.5,
    habitants_jours_an: 0,
    priorite: "nulle",
    rang: null,
    classe_eau: null,
    confiance: "elevee",
    batiments_touches: 0,
    ecoles_touchees: 0,
    ecoles_noms: [],
    routes_km: 0,
    maj: "2026-10-19T12:00:00Z",
    ...p,
  };
}

function saison(p: Partial<IndicateurSaison>): IndicateurSaison {
  return {
    zone_id: "z",
    annee: 2020,
    images_valides: 10,
    images_inondees: 0,
    frequence: 0,
    duree_moy_jours: null,
    classe_eau: null,
    habitants_jours: 0,
    ...p,
  };
}

describe("historique", () => {
  it("rend null sans saison", () => {
    expect(historique([])).toBeNull();
  });

  it("calcule la fréquence sur les images valides de toutes les saisons, année sans image comprise", () => {
    const h = historique([
      saison({ annee: 2023, images_valides: 5, images_inondees: 2, duree_moy_jours: 10 }),
      saison({ annee: 2024, images_valides: 0, images_inondees: 0, frequence: null }),
      saison({ annee: 2025, images_valides: 5, images_inondees: 3, duree_moy_jours: 14 }),
    ]);
    expect(h).toEqual({ imagesValides: 10, imagesInondees: 5, frequence: 0.5, dureeMoyJours: 12 });
  });

  it("n'invente pas de durée quand l'eau n'a jamais été vue", () => {
    expect(historique([saison({ duree_moy_jours: 0 })])?.dureeMoyJours).toBeNull();
  });
});

describe("syntheseGlobale", () => {
  it("dit « non disponible » (null) sans eau observée", () => {
    const s = syntheseGlobale([zone({})]);
    expect(s.avecEau).toBe(0);
    expect(s.partFortes).toBeNull();
    expect(s.maj).toBe("2026-10-19T12:00:00Z");
  });

  it("additionne les habitants-jours des zones avec eau et la part des zones fortes", () => {
    const s = syntheseGlobale([
      zone({ priorite: "forte", habitants_jours_an: 300, classe_eau: "stagnation", confiance: "faible" }),
      zone({ priorite: "moyenne", habitants_jours_an: 100, classe_eau: "ruissellement" }),
      zone({ priorite: "nulle", habitants_jours_an: 0 }),
    ]);
    expect(s.habitantsJours).toBe(400);
    expect(s.partFortes).toBe(0.75);
    expect(s.typesEau).toEqual({ ruissellement: 1, intermediaire: 0, stagnation: 1 });
    expect(s.confiance).toEqual({ elevee: 2, moyenne: 0, faible: 1 });
  });
});

describe("phraseSynthese", () => {
  it("dit qu'aucune eau persistante n'a été vue pour une zone sans priorité", () => {
    expect(phraseSynthese(zone({ priorite: "nulle" }), null)).toMatch(/pas observé d'eau persistante/);
  });

  it("arrondit les habitants", () => {
    // Intl sépare les milliers par une espace fine insécable : ramenée à une espace simple pour comparer.
    const phrase = phraseSynthese(zone({ priorite: "forte", population: 2449 }), null).replace(/\s/g, " ");
    expect(phrase).toContain("2 400 habitants");
  });
});

describe("ordinal", () => {
  it("écrit 1re puis 2e", () => {
    expect([ordinal(1), ordinal(2), ordinal(10)]).toEqual(["1re", "2e", "10e"]);
  });
});
