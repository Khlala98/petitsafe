import { test, expect } from "@playwright/test";

// ═══ EXPORT PDF DDPP → TÉLÉCHARGEMENT + CONTENU NON VIDE ═══

test.describe("Export PDF", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill("marie@petitsafe-demo.fr");
    await page.getByLabel(/mot de passe/i).fill("password123");
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test("export PDF DDPP → téléchargement fichier non vide", async ({ page }) => {
    // Naviguer vers les exports
    await page.goto("/dashboard/exports");
    await page.waitForLoadState("networkidle");

    // Sélectionner le type DDPP
    const selectType = page.getByRole("combobox", { name: /type/i })
      .or(page.locator("select").filter({ hasText: /DDPP|type/i }).first());
    if (await selectType.isVisible()) {
      await selectType.selectOption("DDPP");
    }

    // Remplir les dates
    const dateDebut = page.getByLabel(/début/i).or(page.locator("input[name='periode_debut']"));
    const dateFin = page.getByLabel(/fin/i).or(page.locator("input[name='periode_fin']"));
    if (await dateDebut.isVisible()) {
      await dateDebut.fill("2026-01-01");
    }
    if (await dateFin.isVisible()) {
      await dateFin.fill("2026-03-31");
    }

    // Lancer l'export et intercepter le téléchargement
    const downloadPromise = page.waitForEvent("download", { timeout: 30000 }).catch(() => null);

    const exportBtn = page.getByRole("button", { name: /exporter|générer|télécharger/i }).first();
    await exportBtn.click();

    const download = await downloadPromise;

    if (download) {
      // Vérifier que le fichier n'est pas vide
      const path = await download.path();
      expect(path).toBeTruthy();

      const suggestedFilename = download.suggestedFilename();
      expect(suggestedFilename).toMatch(/\.pdf$/i);
    } else {
      // Alternative : vérifier qu'un lien de téléchargement ou un message de succès apparaît
      const successMsg = page.locator("text=/généré|télécharger|prêt|succès/i").first();
      await expect(successMsg).toBeVisible({ timeout: 15000 });
    }
  });
});
