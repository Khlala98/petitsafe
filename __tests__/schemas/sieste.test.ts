import { describe, it, expect } from "vitest";
import { debutSiesteSchema, finSiesteSchema } from "@/lib/schemas/sieste";

describe("debutSiesteSchema", () => {
  const VALID = {
    structure_id: "struct-1",
    enfant_id: "enfant-1",
    professionnel_id: "pro-1",
  };

  it("accepte des données valides", () => {
    expect(debutSiesteSchema.safeParse(VALID).success).toBe(true);
  });

  it("rejette sans enfant_id", () => {
    expect(debutSiesteSchema.safeParse({ ...VALID, enfant_id: "" }).success).toBe(false);
  });

  it("rejette sans structure_id", () => {
    expect(debutSiesteSchema.safeParse({ ...VALID, structure_id: "" }).success).toBe(false);
  });

  it("rejette sans professionnel_id", () => {
    expect(debutSiesteSchema.safeParse({ ...VALID, professionnel_id: "" }).success).toBe(false);
  });
});

describe("finSiesteSchema", () => {
  it("accepte avec sieste_id seul", () => {
    expect(finSiesteSchema.safeParse({ sieste_id: "sieste-1" }).success).toBe(true);
  });

  it("accepte avec qualité", () => {
    expect(finSiesteSchema.safeParse({ sieste_id: "sieste-1", qualite: "CALME" }).success).toBe(true);
  });

  it("accepte toutes les qualités", () => {
    for (const q of ["CALME", "AGITE", "DIFFICILE", "REVEILS"] as const) {
      expect(finSiesteSchema.safeParse({ sieste_id: "sieste-1", qualite: q }).success).toBe(true);
    }
  });

  it("rejette une qualité invalide", () => {
    expect(finSiesteSchema.safeParse({ sieste_id: "sieste-1", qualite: "PROFOND" }).success).toBe(false);
  });

  it("rejette sans sieste_id", () => {
    expect(finSiesteSchema.safeParse({ sieste_id: "" }).success).toBe(false);
  });
});
