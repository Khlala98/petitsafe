import { test, expect } from "@playwright/test";

// ═══ BIBERON ENFANT ALLERGIQUE PLV → BLOCAGE ═══

test.describe("Biberon — Blocage allergie PLV", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill("marie@rzpanda-demo.fr");
    await page.getByLabel(/mot de passe/i).fill("password123");
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test("préparation biberon pour enfant allergique PLV → formulaire bloqué", async ({ page }) => {
    // Naviguer vers la biberonnerie
    await page.goto("/dashboard/biberonnerie");
    await page.waitForLoadState("networkidle");

    // Cliquer sur "Nouveau biberon" ou "Préparer"
    const nouveauBtn = page.getByRole("button", { name: /nouveau|préparer|ajouter/i }).first();
    if (await nouveauBtn.isVisible()) {
      await nouveauBtn.click();
    }

    // Sélectionner un enfant allergique PLV (Emma dans les seed data)
    const selectEnfant = page.getByRole("combobox", { name: /enfant/i }).or(page.locator("select").first());
    if (await selectEnfant.isVisible()) {
      await selectEnfant.click();
      // Chercher l'enfant allergique PLV
      const optionAllergique = page.getByRole("option", { name: /emma/i }).or(page.locator("text=Emma").first());
      if (await optionAllergique.isVisible()) {
        await optionAllergique.click();
      }
    }

    // Sélectionner un lait PLV (1er âge classique)
    const selectLait = page.locator("[name='type_lait'], select").filter({ hasText: /lait/i }).first();
    if (await selectLait.isVisible()) {
      await selectLait.selectOption({ index: 1 });
    }

    // Vérifier le message d'alerte rouge allergie
    const alerteAllergie = page.locator("[role='alert'], .bg-red-50, .border-red-500, [data-testid='badge-allergie']").first();
    await expect(alerteAllergie).toBeVisible({ timeout: 5000 });
    await expect(alerteAllergie).toContainText(/allergi|PLV/i);

    // Vérifier que le bouton de soumission est désactivé ou que le message de blocage est visible
    const submitBtn = page.getByRole("button", { name: /enregistrer|valider|préparer/i }).first();
    const blocage = page.locator("text=/bloqu|interdit|impossible|lait.*PLV/i").first();
    const isDisabled = await submitBtn.isDisabled().catch(() => false);
    const blocageVisible = await blocage.isVisible().catch(() => false);

    // Au moins un des deux doit être vrai : bouton désactivé OU message de blocage visible
    expect(isDisabled || blocageVisible).toBe(true);
  });
});
