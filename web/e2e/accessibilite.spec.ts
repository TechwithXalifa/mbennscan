import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// WCAG 2.2 AA vérifié par axe sur chaque écran, dans les deux thèmes. Axe ne trouve qu'une partie des défauts :
// le clavier est testé à part (robustesse.spec.ts), le lecteur d'écran reste à essayer à la main.
const ECRANS = ["/", "/zones", "/zone/mock-01", "/apres/1", "/apres/2", "/balise/bal-01", "/methode", "/introuvable"];

for (const theme of ["sombre", "clair"] as const) {
  test.describe(`Thème ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("mbennscan:theme", t), theme);
    });

    for (const ecran of ECRANS) {
      test(`${ecran} : aucune violation WCAG 2.2 AA`, async ({ page }) => {
        await page.goto(ecran);
        // Laisse les données et la carte s'afficher (les états de chargement ne sont pas l'objet du test).
        await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(1500);
        const resultat = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        const resume = resultat.violations.map((v) => `${v.id} (${v.nodes.length}) : ${v.help}`);
        expect(resume).toEqual([]);
      });
    }
  });
}
