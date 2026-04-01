import { describe, it, expect } from "vitest";
import { stockSchema, ajustementStockSchema } from "@/lib/schemas/stock";

// ═══ STOCK ═══

describe("stockSchema", () => {
  const VALID = {
    structure_id: "struct-1",
    categorie: "COUCHES" as const,
    produit_nom: "Couches taille 3",
    quantite: 50,
    unite: "paquets",
    seuil_alerte: 10,
    maj_par: "Marie Dupont",
  };

  it("accepte des données valides", () => {
    expect(stockSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepte toutes les catégories", () => {
    for (const c of ["COUCHES", "ENTRETIEN", "LAIT", "COMPOTES", "AUTRE"] as const) {
      expect(stockSchema.safeParse({ ...VALID, categorie: c }).success).toBe(true);
    }
  });

  it("rejette une catégorie invalide", () => {
    expect(stockSchema.safeParse({ ...VALID, categorie: "JOUETS" }).success).toBe(false);
  });

  it("rejette quantité négative", () => {
    expect(stockSchema.safeParse({ ...VALID, quantite: -1 }).success).toBe(false);
  });

  it("accepte quantité = 0", () => {
    expect(stockSchema.safeParse({ ...VALID, quantite: 0 }).success).toBe(true);
  });

  it("rejette sans produit_nom", () => {
    expect(stockSchema.safeParse({ ...VALID, produit_nom: "" }).success).toBe(false);
  });

  it("rejette sans unite", () => {
    expect(stockSchema.safeParse({ ...VALID, unite: "" }).success).toBe(false);
  });

  it("rejette seuil négatif", () => {
    expect(stockSchema.safeParse({ ...VALID, seuil_alerte: -5 }).success).toBe(false);
  });
});

// ═══ AJUSTEMENT STOCK ═══

describe("ajustementStockSchema", () => {
  it("accepte un delta positif", () => {
    expect(ajustementStockSchema.safeParse({ stockId: "s-1", delta: 10, par: "Marie" }).success).toBe(true);
  });

  it("accepte un delta négatif", () => {
    expect(ajustementStockSchema.safeParse({ stockId: "s-1", delta: -5, par: "Marie" }).success).toBe(true);
  });

  it("rejette un delta = 0", () => {
    expect(ajustementStockSchema.safeParse({ stockId: "s-1", delta: 0, par: "Marie" }).success).toBe(false);
  });

  it("rejette sans stockId", () => {
    expect(ajustementStockSchema.safeParse({ stockId: "", delta: 5, par: "Marie" }).success).toBe(false);
  });

  it("rejette sans par", () => {
    expect(ajustementStockSchema.safeParse({ stockId: "s-1", delta: 5, par: "" }).success).toBe(false);
  });
});
