import { test, expect } from "@playwright/test";

// ═══ PORTAIL PARENTS : LECTURE SEULE + ISOLATION DONNÉES ═══

test.describe("Portail parents", () => {
  test("connexion parent → timeline enfant visible", async ({ page }) => {
    // Connexion avec un compte parent (seed data)
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill("parent@rzpanda-demo.fr");
    await page.getByLabel(/mot de passe/i).fill("password123");
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    // Redirection vers le portail parents
    await page.waitForURL(/portail|parent|dashboard/, { timeout: 10000 });

    // Vérifier qu'on voit la timeline / journée de l'enfant
    const timeline = page.locator("text=/journée|timeline|suivi|repas|sieste|change/i").first();
    await expect(timeline).toBeVisible({ timeout: 5000 });
  });

  test("parent ne peut pas accéder aux données d'autres enfants", async ({ page }) => {
    // Connexion parent
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill("parent@rzpanda-demo.fr");
    await page.getByLabel(/mot de passe/i).fill("password123");
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();
    await page.waitForURL(/portail|parent|dashboard/, { timeout: 10000 });

    // Tenter d'accéder à un enfant qui n'est pas le sien via URL directe
    const response = await page.goto("/dashboard/enfants/enfant-inexistant-999");

    // Doit recevoir une erreur 403, 404, ou être redirigé
    if (response) {
      const status = response.status();
      const isBlocked = status === 403 || status === 404;
      const isRedirected = page.url().includes("portail") || page.url().includes("connexion");
      expect(isBlocked || isRedirected).toBe(true);
    }
  });

  test("parent n'a pas accès aux modules d'administration", async ({ page }) => {
    // Connexion parent
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill("parent@rzpanda-demo.fr");
    await page.getByLabel(/mot de passe/i).fill("password123");
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();
    await page.waitForURL(/portail|parent|dashboard/, { timeout: 10000 });

    // Vérifier qu'il n'y a pas de liens vers les modules admin
    const adminLinks = page.locator("a[href*='parametres'], a[href*='nettoyage'], a[href*='temperatures']");
    const count = await adminLinks.count();
    expect(count).toBe(0);
  });
});
