import { describe, it, expect } from "vitest";
import { changeSchema } from "@/lib/schemas/change";

const VALID_CHANGE = {
  structure_id: "struct-1",
  enfant_id: "enfant-1",
  type_change: "MOUILLEE" as const,
  professionnel_id: "pro-1",
};

describe("changeSchema", () => {
  it("accepte des données valides", () => {
    const result = changeSchema.safeParse(VALID_CHANGE);
    expect(result.success).toBe(true);
  });

  it("accepte avec observations", () => {
    const result = changeSchema.safeParse({ ...VALID_CHANGE, observations: "Rougeurs légères" });
    expect(result.success).toBe(true);
  });

  it("accepte tous les types de change", () => {
    for (const type of ["MOUILLEE", "SELLE", "LES_DEUX"] as const) {
      const result = changeSchema.safeParse({ ...VALID_CHANGE, type_change: type });
      expect(result.success).toBe(true);
    }
  });

  it("rejette un type de change invalide", () => {
    const result = changeSchema.safeParse({ ...VALID_CHANGE, type_change: "PROPRE" });
    expect(result.success).toBe(false);
  });

  it("rejette sans enfant_id", () => {
    const result = changeSchema.safeParse({ ...VALID_CHANGE, enfant_id: "" });
    expect(result.success).toBe(false);
  });

  it("rejette sans structure_id", () => {
    const result = changeSchema.safeParse({ ...VALID_CHANGE, structure_id: "" });
    expect(result.success).toBe(false);
  });

  it("rejette sans professionnel_id", () => {
    const result = changeSchema.safeParse({ ...VALID_CHANGE, professionnel_id: "" });
    expect(result.success).toBe(false);
  });
});
