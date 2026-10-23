import { expect, test } from "@playwright/test";

// États qui ne se voient pas pendant la démo : erreur, vide, hors ligne, fond de carte absent, thème, clavier.
// Le service worker est bloqué pour que les requêtes interceptées ici ne passent pas par lui.
test.use({ serviceWorkers: "block" });

test("Erreur réseau : le message, puis « Réessayer » relit les zones", async ({ page }) => {
  let refuser = true;
  await page.route("**/mocks/zones.json", (route) => (refuser ? route.fulfill({ status: 500 }) : route.continue()));
  await page.goto("/");
  await expect(page.getByText("Les zones n'ont pas pu être chargées")).toBeVisible();
  refuser = false;
  await page.getByRole("button", { name: "Réessayer" }).click();
  await expect(page.getByRole("button", { name: /Jaxaay, maille 1/ })).toBeVisible();
});

test("Aucune zone : un état vide qui dit pourquoi", async ({ page }) => {
  await page.route("**/mocks/zones.json", (route) =>
    route.fulfill({ json: { type: "FeatureCollection", features: [] } }),
  );
  await page.goto("/");
  await expect(page.getByText("Aucune zone calculée pour l'instant")).toBeVisible();
});

test("Hors ligne : le bandeau le dit", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /Jaxaay, maille 1/ })).toBeVisible();
  await context.setOffline(true);
  await expect(page.getByText(/Vous êtes hors ligne/)).toBeVisible();
  await context.setOffline(false);
});

test("Fond de carte injoignable : la carte continue sans fond", async ({ page }) => {
  await page.route("https://tiles.openfreemap.org/**", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByText(/Le fond de carte (n'a pas pu être chargé|tarde à venir)/)).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "Continuer sans fond" }).click();
  await expect(page.getByText(/Le fond de carte (n'a pas pu être chargé|tarde à venir)/)).toBeHidden();
});

test("Balise mal étalonnée : « Mesure invalide », pas « 0 cm »", async ({ page }) => {
  const ts = new Date().toISOString();
  await page.route("**/mocks/mesures.json", (route) =>
    route.fulfill({
      json: [
        { id: 1, balise_id: "bal-01", ts, recu_le: ts, distance_cm: 83, niveau_cm: -3, batterie_v: 4.1, rssi: -60 },
      ],
    }),
  );
  await page.goto("/balise/bal-01");
  await expect(page.getByText("Mesure invalide", { exact: true })).toBeVisible();
  await expect(page.getByText(/Le capteur lit plus loin que le fond du bac/)).toBeVisible();
  await expect(page.getByText(/Sous le seuil|d'eau dans le bac/)).toHaveCount(0);
  await expect(page.getByRole("meter")).not.toHaveAttribute("aria-valuenow");
});

test("Thème : sombre par défaut, le clair est gardé après rechargement", async ({ page }) => {
  await page.goto("/methode");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");
  await page.evaluate(() => localStorage.setItem("mbennscan:theme", "clair"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "clair");
});

test("Lien partagé : /?zone= ouvre la fiche de la zone", async ({ page }) => {
  await page.goto("/?zone=mock-02");
  await expect(page.getByRole("heading", { name: /Keur Massar Nord, maille 2/ })).toBeVisible();
});

test.describe("Clavier", () => {
  test.skip(({ isMobile }) => isMobile, "parcours au clavier, sur ordinateur");

  test("Le tri du classement garde le focus sur l'en-tête", async ({ page }) => {
    await page.goto("/zones");
    const entete = page.getByRole("button", { name: /Habitants-jours \/ an/ });
    await entete.focus();
    await page.keyboard.press("Enter");
    await expect(entete).toBeFocused();
    await expect(page.locator("th[aria-sort='descending']")).toHaveCount(1);
  });

  test("Une flèche dans la liste des épisodes ne change pas de page", async ({ page }) => {
    await page.goto("/apres/1");
    const liste = page.getByRole("combobox", { name: "Épisode de pluie" });
    await liste.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page).toHaveURL(/\/apres\/1$/);
    await page.getByRole("button", { name: "Afficher", exact: true }).click();
    await expect(page).toHaveURL(/\/apres\/2$/);
  });
});
