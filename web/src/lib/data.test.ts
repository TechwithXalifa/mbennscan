import { describe, expect, it, vi } from "vitest";
import { DUREE_PARTAGE_MS, partage } from "@/lib/data";

describe("lectures partagées", () => {
  it("ne fait qu'une requête pour deux appels simultanés", async () => {
    const lire = vi.fn().mockResolvedValue(42);
    const [a, b] = await Promise.all([partage("test:double", lire), partage("test:double", lire)]);
    expect([a, b]).toEqual([42, 42]);
    expect(lire).toHaveBeenCalledTimes(1);
  });

  it("oublie un échec pour que « Réessayer » relance la lecture", async () => {
    const lire = vi.fn().mockRejectedValueOnce(new Error("réseau")).mockResolvedValueOnce("ok");
    await expect(partage("test:echec", lire)).rejects.toThrow("réseau");
    await expect(partage("test:echec", lire)).resolves.toBe("ok");
    expect(lire).toHaveBeenCalledTimes(2);
  });

  it("relit après la durée de partage, pour voir un nouveau calcul", async () => {
    const lire = vi.fn().mockResolvedValueOnce("ancien").mockResolvedValueOnce("nouveau");
    const t0 = 1_000_000;
    await expect(partage("test:expire", lire, t0)).resolves.toBe("ancien");
    await expect(partage("test:expire", lire, t0 + DUREE_PARTAGE_MS - 1)).resolves.toBe("ancien");
    await expect(partage("test:expire", lire, t0 + DUREE_PARTAGE_MS)).resolves.toBe("nouveau");
  });
});
