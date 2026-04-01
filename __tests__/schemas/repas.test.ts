import { describe, it, expect } from "vitest";
import { repasSchema } from "@/lib/schemas/repas";

const VALID_REPAS = {
  structure_id: "struct-1",
  enfant_id: "enfant-1",
  type_repas: "DEJEUNER" as const,
  professionnel_id: "pro-1",
};

describe("repasSchema", () => {
  it("accepte des données valides minimales", () => {
    const result = repasSchema.safeParse(VALID_REPAS);
    expect(result.success).toBe(true);
  });

  it("accepte des données valides complètes", () => {
    const result = repasSchema.safeParse({
      ...VALID_REPAS,
      entree: "Carottes râpées",
      entree_quantite: "BIEN",
      plat: "Poulet purée",
      plat_quantite: "TOUT",
      dessert: "Compote pomme",
      dessert_quantite: "PEU",
      observations: "A bien mangé",
    });
    expect(result.success).toBe(true);
  });

  it("accepte tous les types de repas", () => {
    for (const type of ["PETIT_DEJ", "DEJEUNER", "GOUTER", "DINER"] as const) {
      const result = repasSchema.safeParse({ ...VALID_REPAS, type_repas: type });
      expect(result.success).toBe(true);
    }
  });

  it("rejette un type de repas invalide", () => {
    const result = repasSchema.safeParse({ ...VALID_REPAS, type_repas: "BRUNCH" });
    expect(result.success).toBe(false);
  });

  it("rejette sans enfant_id", () => {
    const result = repasSchema.safeParse({ ...VALID_REPAS, enfant_id: "" });
    expect(result.success).toBe(false);
  });

  it("rejette sans professionnel_id", () => {
    const result = repasSchema.safeParse({ ...VALID_REPAS, professionnel_id: "" });
    expect(result.success).toBe(false);
  });

  it("accepte toutes les quantités valides", () => {
    for (const q of ["TOUT", "BIEN", "PEU", "RIEN"] as const) {
      const result = repasSchema.safeParse({ ...VALID_REPAS, plat_quantite: q });
      expect(result.success).toBe(true);
    }
  });

  it("rejette une quantité invalide", () => {
    const result = repasSchema.safeParse({ ...VALID_REPAS, plat_quantite: "MOYEN" });
    expect(result.success).toBe(false);
  });
});
