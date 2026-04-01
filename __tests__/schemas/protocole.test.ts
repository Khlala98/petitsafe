import { describe, it, expect } from "vitest";
import { protocoleSchema } from "@/lib/schemas/protocole";

describe("protocoleSchema", () => {
  const VALID = {
    titre: "Protocole change",
    categorie: "Change" as const,
    contenu_markdown: "## Étapes\n1. Préparer le matériel\n2. Changer l'enfant",
  };

  it("accepte des données valides", () => {
    expect(protocoleSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepte toutes les catégories", () => {
    for (const c of ["Hygiène", "Sécurité", "Alimentation", "Change", "Biberonnerie", "Autre"] as const) {
      expect(protocoleSchema.safeParse({ ...VALID, categorie: c }).success).toBe(true);
    }
  });

  it("rejette une catégorie invalide", () => {
    expect(protocoleSchema.safeParse({ ...VALID, categorie: "Sport" }).success).toBe(false);
  });

  it("rejette sans titre", () => {
    expect(protocoleSchema.safeParse({ ...VALID, titre: "" }).success).toBe(false);
  });

  it("rejette sans contenu", () => {
    expect(protocoleSchema.safeParse({ ...VALID, contenu_markdown: "" }).success).toBe(false);
  });
});
