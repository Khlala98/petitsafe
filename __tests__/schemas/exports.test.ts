import { describe, it, expect } from "vitest";
import { exportFormSchema } from "@/lib/schemas/exports";

describe("exportFormSchema", () => {
  const VALID = {
    type_export: "DDPP" as const,
    periode_debut: "2026-01-01",
    periode_fin: "2026-03-31",
  };

  it("accepte des données valides", () => {
    expect(exportFormSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepte tous les types d'export", () => {
    for (const t of ["DDPP", "PMI", "INTERNE"] as const) {
      expect(exportFormSchema.safeParse({ ...VALID, type_export: t }).success).toBe(true);
    }
  });

  it("rejette un type invalide", () => {
    expect(exportFormSchema.safeParse({ ...VALID, type_export: "CSV" }).success).toBe(false);
  });

  it("rejette sans date de début", () => {
    expect(exportFormSchema.safeParse({ ...VALID, periode_debut: "" }).success).toBe(false);
  });

  it("rejette sans date de fin", () => {
    expect(exportFormSchema.safeParse({ ...VALID, periode_fin: "" }).success).toBe(false);
  });

  it("rejette si date début > date fin", () => {
    const result = exportFormSchema.safeParse({
      ...VALID,
      periode_debut: "2026-04-01",
      periode_fin: "2026-03-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("periode_fin"))).toBe(true);
    }
  });

  it("accepte même jour début = fin", () => {
    const result = exportFormSchema.safeParse({
      ...VALID,
      periode_debut: "2026-03-15",
      periode_fin: "2026-03-15",
    });
    expect(result.success).toBe(true);
  });
});
