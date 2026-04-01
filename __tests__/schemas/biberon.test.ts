import { describe, it, expect } from "vitest";
import { biberonSchema } from "@/lib/schemas/biberon";

const VALID_BIBERON = {
  structure_id: "struct-1",
  enfant_id: "enfant-1",
  type_lait: "MATERNEL",
  numero_lot: "LOT-2026-001",
  quantite_preparee_ml: 120,
  preparateur_nom: "Marie Dupont",
  professionnel_id: "pro-1",
};

describe("biberonSchema", () => {
  it("accepte des données valides complètes", () => {
    const result = biberonSchema.safeParse({
      ...VALID_BIBERON,
      nom_lait: "Gallia 1er âge",
      nombre_dosettes: 4,
      observations: "Bébé un peu agité",
    });
    expect(result.success).toBe(true);
  });

  it("accepte des données valides minimales", () => {
    const result = biberonSchema.safeParse(VALID_BIBERON);
    expect(result.success).toBe(true);
  });

  it("rejette sans numéro de lot", () => {
    const result = biberonSchema.safeParse({ ...VALID_BIBERON, numero_lot: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("numero_lot"))).toBe(true);
    }
  });

  it("rejette quantité = 0", () => {
    const result = biberonSchema.safeParse({ ...VALID_BIBERON, quantite_preparee_ml: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("quantite_preparee_ml"))).toBe(true);
    }
  });

  it("rejette quantité négative", () => {
    const result = biberonSchema.safeParse({ ...VALID_BIBERON, quantite_preparee_ml: -50 });
    expect(result.success).toBe(false);
  });

  it("rejette sans enfant_id", () => {
    const result = biberonSchema.safeParse({ ...VALID_BIBERON, enfant_id: "" });
    expect(result.success).toBe(false);
  });

  it("rejette sans type_lait", () => {
    const result = biberonSchema.safeParse({ ...VALID_BIBERON, type_lait: "" });
    expect(result.success).toBe(false);
  });

  it("rejette sans preparateur_nom", () => {
    const result = biberonSchema.safeParse({ ...VALID_BIBERON, preparateur_nom: "" });
    expect(result.success).toBe(false);
  });

  it("accepte nombre_dosettes positif", () => {
    const result = biberonSchema.safeParse({ ...VALID_BIBERON, nombre_dosettes: 3 });
    expect(result.success).toBe(true);
  });

  it("rejette nombre_dosettes = 0", () => {
    const result = biberonSchema.safeParse({ ...VALID_BIBERON, nombre_dosettes: 0 });
    expect(result.success).toBe(false);
  });
});
