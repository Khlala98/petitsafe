import { describe, it, expect } from "vitest";
import { demandeDemoSchema } from "@/lib/schemas/demo";

describe("demandeDemoSchema", () => {
  const VALID = {
    nom: "Marie Dupont",
    email: "marie@creche-soleil.fr",
    telephone: "0612345678",
    type_structure: "MICRO_CRECHE" as const,
    nombre_structures: "2",
  };

  it("accepte des données valides", () => {
    expect(demandeDemoSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepte tous les types de structure", () => {
    for (const t of ["CRECHE", "MICRO_CRECHE", "MAM", "ASS_MAT"] as const) {
      expect(demandeDemoSchema.safeParse({ ...VALID, type_structure: t }).success).toBe(true);
    }
  });

  it("rejette un email invalide", () => {
    expect(demandeDemoSchema.safeParse({ ...VALID, email: "pas-un-email" }).success).toBe(false);
  });

  it("rejette un nom trop court", () => {
    expect(demandeDemoSchema.safeParse({ ...VALID, nom: "A" }).success).toBe(false);
  });

  it("rejette un téléphone trop court", () => {
    expect(demandeDemoSchema.safeParse({ ...VALID, telephone: "06" }).success).toBe(false);
  });

  it("rejette un type de structure invalide", () => {
    expect(demandeDemoSchema.safeParse({ ...VALID, type_structure: "ECOLE" }).success).toBe(false);
  });

  it("rejette sans nombre_structures", () => {
    expect(demandeDemoSchema.safeParse({ ...VALID, nombre_structures: "" }).success).toBe(false);
  });
});
