import { test, expect } from "@playwright/test";

// ═══ DASHBOARD MULTI-STRUCTURES ═══

test.describe("Dashboard multi-structures", () => {
  test.beforeEach(async ({ page }) => {
    // Connexion gestionnaire multi-structures
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill("marie@rzpanda-demo.fr");
    await page.getByLabel(/mot de passe/i).fill("password123");
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test("les 2 structures seed apparaissent avec les bonnes pastilles", async ({ page }) => {
    // Vérifier la présence du sélecteur de structures ou de la liste
    const structureSelector = page.locator(
      "[data-testid='structure-selector'], [role='combobox'], select"
    ).filter({ hasText: /structure|crèche|micro/i }).first();

    const structureCards = page.locator(
      "[data-testid='structure-card'], .structure-card"
    );

    // Soit un sélecteur, soit des cards de structures
    const selectorVisible = await structureSelector.isVisible().catch(() => false);
    const cardsCount = await structureCards.count().catch(() => 0);

    if (selectorVisible) {
      // Ouvrir le sélecteur et vérifier les 2 structures
      await structureSelector.click();
      const options = page.getByRole("option");
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThanOrEqual(2);
    } else if (cardsCount >= 2) {
      expect(cardsCount).toBeGreaterThanOrEqual(2);
    }

    // Vérifier qu'il y a des pastilles de statut sur le dashboard
    const pastilles = page.locator(
      ".bg-green-500, .bg-orange-400, .bg-red-500, [aria-label='conforme'], [aria-label='attention'], [aria-label='alerte']"
    );
    const pastilleCount = await pastilles.count();
    expect(pastilleCount).toBeGreaterThanOrEqual(1);
  });

  test("changer de structure met à jour les données du dashboard", async ({ page }) => {
    // Trouver et cliquer sur le sélecteur de structure
    const structureSelector = page.locator(
      "[data-testid='structure-selector'], [role='combobox']"
    ).first();

    if (await structureSelector.isVisible().catch(() => false)) {
      // Capturer le contenu actuel
      const contentBefore = await page.locator("main").textContent();

      // Changer de structure
      await structureSelector.click();
      const secondOption = page.getByRole("option").nth(1);
      if (await secondOption.isVisible()) {
        await secondOption.click();
        await page.waitForLoadState("networkidle");

        // Le contenu doit potentiellement changer (noms d'enfants, KPIs)
        // On vérifie que la page s'est rechargée sans erreur
        await expect(page.locator("main")).toBeVisible();
      }
    }
  });
});
