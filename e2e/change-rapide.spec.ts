import { test, expect } from "@playwright/test";

// ═══ SAISIE CHANGE EN 2 TAPS ═══

test.describe("Change rapide", () => {
  test.beforeEach(async ({ page }) => {
    // Connexion pro
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill("marie@rzpanda-demo.fr");
    await page.getByLabel(/mot de passe/i).fill("password123");
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test("saisie change en 2 taps — sélection enfant → clic bouton → enregistrement", async ({ page }) => {
    // Naviguer vers le suivi / changes
    await page.goto("/dashboard/suivi");
    await page.waitForLoadState("networkidle");

    // Sélectionner un enfant (premier enfant visible dans la liste)
    const enfantCard = page.locator("[data-testid='enfant-card'], [role='button']").filter({ hasText: /lucas|emma|léa/i }).first();
    if (await enfantCard.isVisible()) {
      await enfantCard.click();
    }

    // Cliquer sur le bouton de change rapide
    const boutonChange = page.getByRole("button", { name: /change|couche/i }).first();
    await expect(boutonChange).toBeVisible({ timeout: 5000 });
    await boutonChange.click();

    // Sélectionner le type de change
    const typeButton = page.getByRole("button", { name: /mouillée|selle|les deux/i }).first();
    if (await typeButton.isVisible()) {
      await typeButton.click();
    }

    // Valider
    const valider = page.getByRole("button", { name: /valider|enregistrer|confirmer/i }).first();
    if (await valider.isVisible()) {
      await valider.click();
    }

    // Vérifier l'enregistrement (toast de succès ou coche verte)
    const success = page.locator("[data-sonner-toast], [role='status']").filter({ hasText: /enregistré|succès|✓/i });
    await expect(success.or(page.locator("text=✓")).first()).toBeVisible({ timeout: 5000 });
  });
});
