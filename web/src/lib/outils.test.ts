// Formats, géométrie, repères de la balise et navigation.
import { describe, expect, it } from "vitest";
import { niveauValide, repereHumain } from "@/lib/balise";
import { formatDepuis, formatHabitants, formatPourcent } from "@/lib/format";
import { emprise, surfaceHectares } from "@/lib/geo";
import { contexteDe, modeDe } from "@/lib/navigation";
import type { EauGeoJSON } from "@/types/contracts";

// Espaces insécables de Intl remplacées par des espaces simples pour comparer.
const simple = (s: string) => s.replace(/\s/g, " ");

describe("formats", () => {
  it("arrondit les habitants à la dizaine sous 1 000, à la centaine au-delà", () => {
    expect(simple(formatHabitants(834))).toBe("830");
    expect(simple(formatHabitants(2449))).toBe("2 400");
  });

  it("écrit les pourcentages et les durées en français", () => {
    expect(simple(formatPourcent(0.43))).toBe("43 %");
    expect(formatDepuis(4)).toBe("il y a 4 s");
    expect(formatDepuis(3 * 86400)).toBe("il y a 3 j");
  });
});

describe("géométrie", () => {
  it("rend null pour un ensemble vide", () => {
    expect(emprise([])).toBeNull();
  });

  it("mesure environ 1 ha pour un carré de 100 m à Keur Massar", () => {
    // 100 m ≈ 0,000898° de latitude et 0,000929° de longitude à 14,78° N
    const [o, s, dLon, dLat] = [-17.3, 14.78, 0.000929, 0.000898];
    const carre: EauGeoJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [o, s],
                [o + dLon, s],
                [o + dLon, s + dLat],
                [o, s + dLat],
                [o, s],
              ],
            ],
          },
        },
      ],
    };
    expect(surfaceHectares(carre)).toBeGreaterThan(0.98);
    expect(surfaceHectares(carre)).toBeLessThan(1.02);
  });
});

describe("repères de la balise", () => {
  it("rien à comparer sans eau", () => {
    expect(repereHumain(0)).toBeNull();
  });

  it.each([
    [5, "sous la cheville"],
    [12, "hauteur d'une cheville"],
    [38, "entre la cheville et le genou"],
    [48, "hauteur d'un genou"],
    [70, "entre le genou et la hanche"],
    [175, "plus haut qu'un adulte"],
  ])("%s cm → %s", (cm, attendu) => {
    expect(repereHumain(cm)).toContain(attendu);
  });

  it.each([
    [0, true],
    [12.5, true],
    [-0.5, false],
    [null, false],
    [Number.NaN, false],
  ])("niveau %s valide : %s", (cm, attendu) => {
    expect(niveauValide(cm)).toBe(attendu);
  });
});

describe("navigation", () => {
  it("donne le mode et le contexte de chaque page", () => {
    expect(modeDe("/zones")).toBe("avant");
    expect(modeDe("/apres/1")).toBe("apres");
    expect(modeDe("/methode")).toBeNull();
    expect(contexteDe("/zone/mock-01").page).toBe("Fiche zone");
    expect(contexteDe("/balise/bal-01").periode).toBe("Temps réel");
  });
});
