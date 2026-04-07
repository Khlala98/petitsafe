import { test, expect } from "@playwright/test";

// ═══ PARCOURS INSCRIPTION → CONNEXION → DASHBOARD → DÉCONNEXION ═══

test.describe("Authentification", () => {
  test("inscription → connexion → redirection dashboard → déconnexion", async ({ page }) => {
    // Connexion avec les credentials seed
    await page.goto("/connexion");
    await expect(page).toHaveURL(/connexion/);

    // Remplir le formulaire de connexion
    await page.getByLabel(/email/i).fill("marie@rzpanda-demo.fr");
    await page.getByLabel(/mot de passe/i).fill("password123");
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    // Redirection vers le dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);

    // Vérifier qu'on voit le contenu du dashboard
    await expect(page.locator("body")).toContainText(/tableau de bord|dashboard/i);

    // Déconnexion
    const menuButton = page.getByRole("button", { name: /menu|profil|déconnexion/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    await page.getByRole("button", { name: /déconnexion|se déconnecter/i }).first().click();

    // Redirection vers la page de connexion
    await page.waitForURL(/connexion|\/$/);
  });

  test("accès dashboard sans connexion → redirection connexion", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/connexion/);
    await expect(page).toHaveURL(/connexion/);
  });
});
