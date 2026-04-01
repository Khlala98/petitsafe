import { describe, it, expect } from "vitest";
import { transmissionSchema } from "@/lib/schemas/transmission";

const VALID_TRANSMISSION = {
  structure_id: "struct-1",
  contenu: "Lucas a bien dormi ce matin",
  type_transm: "ENFANT" as const,
  auteur: "Marie Dupont",
};

describe("transmissionSchema", () => {
  it("accepte des données valides (type ENFANT)", () => {
    const result = transmissionSchema.safeParse({ ...VALID_TRANSMISSION, enfant_id: "enfant-1" });
    expect(result.success).toBe(true);
  });

  it("accepte type GENERAL sans enfant_id", () => {
    const result = transmissionSchema.safeParse({ ...VALID_TRANSMISSION, type_transm: "GENERAL" });
    expect(result.success).toBe(true);
  });

  it("accepte type EQUIPE", () => {
    const result = transmissionSchema.safeParse({ ...VALID_TRANSMISSION, type_transm: "EQUIPE" });
    expect(result.success).toBe(true);
  });

  it("rejette un type invalide", () => {
    const result = transmissionSchema.safeParse({ ...VALID_TRANSMISSION, type_transm: "PRIVEE" });
    expect(result.success).toBe(false);
  });

  it("rejette sans contenu", () => {
    const result = transmissionSchema.safeParse({ ...VALID_TRANSMISSION, contenu: "" });
    expect(result.success).toBe(false);
  });

  it("rejette sans auteur", () => {
    const result = transmissionSchema.safeParse({ ...VALID_TRANSMISSION, auteur: "" });
    expect(result.success).toBe(false);
  });

  it("rejette sans structure_id", () => {
    const result = transmissionSchema.safeParse({ ...VALID_TRANSMISSION, structure_id: "" });
    expect(result.success).toBe(false);
  });
});
