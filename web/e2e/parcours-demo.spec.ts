import { expect, test } from "@playwright/test";

// Les quatre étapes de la démo de 30 secondes, sur les mocks.
test("E1 → E2 : de la carte à la fiche de la première zone", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("note").filter({ hasText: "Maquette" }).first()).toBeVisible();
  await page.getByRole("button", { name: /Jaxaay, maille 1/ }).click();
  await expect(page.getByRole("heading", { name: /Jaxaay, maille 1/ })).toBeVisible();
  await expect(page.getByText("1re sur 6 zones")).toBeVisible();
  await expect(page.getByText(/remontée de nappe est probable/)).toBeVisible();
});

test("E3 : après la pluie du 4 octobre, bilan et fiche d'urgence", async ({ page }) => {
  await page.goto("/apres");
  await expect(page).toHaveURL(/\/apres\/1$/);
  await expect(page.getByText(/2 jours après la pluie/)).toBeVisible();
  await expect(page.getByText("habitants dans l'eau")).toBeVisible();
  await page.getByRole("button", { name: /Jaxaay, maille 1/ }).click();
  await expect(page.getByText("34,5 %")).toBeVisible();
});

test("E3 : un épisode sans image radar le dit", async ({ page }) => {
  await page.goto("/apres/2");
  await expect(page.getByText(/Aucune image radar exploitable/)).toBeVisible();
});

test("E5 : la balise affiche son niveau", async ({ page }) => {
  await page.goto("/balise/bal-01");
  await expect(page.getByRole("meter")).toBeVisible();
  await expect(page.getByText("d'eau dans le bac")).toBeVisible();
});

test("E6 : la méthode affiche les paramètres du calcul", async ({ page }) => {
  await page.goto("/methode");
  await expect(page.getByText("H3, résolution 9")).toBeVisible();
});

test("Classement : recherche et tri des zones", async ({ page }) => {
  await page.goto("/zones");
  await expect(page.getByRole("heading", { name: "Zones prioritaires" })).toBeVisible();
  await page.getByRole("searchbox", { name: /Rechercher une zone/ }).fill("malika");
  await expect(page.getByText("1 zone sur 6")).toBeVisible();
  await page.getByRole("searchbox", { name: /Rechercher une zone/ }).fill("introuvable");
  await expect(page.getByText("Aucune zone ne correspond")).toBeVisible();
});

test("Recherche : une zone choisie s'ouvre sur la carte", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /Rechercher une zone ou une page/ })
    .first()
    .click();
  await page.getByRole("combobox", { name: "Rechercher une zone ou une page" }).fill("malika");
  await page.getByRole("option", { name: /Malika, maille 4/ }).click();
  await expect(page).toHaveURL(/zone=mock-04/);
  await expect(page.getByRole("heading", { name: /Malika, maille 4/ })).toBeVisible();
});
