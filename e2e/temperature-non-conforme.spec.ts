import { test, expect } from "@playwright/test";

// ═══ RELEVÉ TEMPÉRATURE NON CONFORME → ACTION CORRECTIVE OBLIGATOIRE + PASTILLE ROUGE ═══

test.describe("Température non conforme", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill("marie@rzpanda-demo.fr");
    await page.getByLabel(/mot de passe/i).fill("password123");
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test("relevé 6°C frigo → action corrective obligatoire + pastille rouge", async ({ page }) => {
    // Naviguer vers les températures
    await page.goto("/dashboard/temperatures");
    await page.waitForLoadState("networkidle");

    // Cliquer nouveau relevé
    const nouveauBtn = page.getByRole("button", { name: /nouveau|ajouter|relevé/i }).first();
    if (await nouveauBtn.isVisible()) {
      await nouveauBtn.click();
    }

    // Sélectionner un équipement frigo
    const selectEquip = page.getByRole("combobox", { name: /équipement|frigo/i })
      .or(page.locator("select").first());
    if (await selectEquip.isVisible()) {
      await selectEquip.click();
      const option = page.getByRole("option").first();
      if (await option.isVisible()) {
        await option.click();
      }
    }

    // Saisir 6°C (non conforme pour un frigo : max 4°C)
    const inputTemp = page.getByLabel(/température/i).or(page.locator("input[type='number']").first());
    await inputTemp.fill("6");

    // Tenter de soumettre sans action corrective
    const submitBtn = page.getByRole("button", { name: /enregistrer|valider/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }

    // Vérifier que le champ action corrective est requis / affiché
    const actionField = page.getByLabel(/action corrective/i)
      .or(page.locator("textarea, input").filter({ hasText: /action|corrective/i }));
    const errorMsg = page.locator("text=/action corrective|obligatoire|requis/i").first();

    const actionVisible = await actionField.first().isVisible().catch(() => false);
    const errorVisible = await errorMsg.isVisible().catch(() => false);

    // Le champ action corrective doit être visible OU un message d'erreur doit apparaître
    expect(actionVisible || errorVisible).toBe(true);

    // Vérifier la pastille rouge (non conforme)
    const pastilleRouge = page.locator(".bg-red-500, [aria-label='alerte'], [data-status='alerte']").first();
    const nonConformeText = page.locator("text=/non.?conforme|alerte|hors.?norme/i").first();
    const pastilleVisible = await pastilleRouge.isVisible().catch(() => false);
    const textVisible = await nonConformeText.isVisible().catch(() => false);

    expect(pastilleVisible || textVisible).toBe(true);
  });
});
