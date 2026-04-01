import { describe, it, expect } from "vitest";
import { enfantSchema, allergieSchema, contactSchema } from "@/lib/schemas/enfant";

// ═══ ENFANT ═══

describe("enfantSchema", () => {
  const VALID = {
    prenom: "Lucas",
    nom: "Martin",
    date_naissance: "2025-03-15",
  };

  it("accepte des données valides minimales", () => {
    expect(enfantSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepte des données complètes", () => {
    const result = enfantSchema.safeParse({
      ...VALID,
      sexe: "GARCON",
      groupe: "Moyens",
      allergies: [{ allergene: "PLV", severite: "SEVERE" }],
      contacts: [{ nom: "Papa Martin", lien: "Père", telephone: "0612345678" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejette sans prénom", () => {
    expect(enfantSchema.safeParse({ ...VALID, prenom: "" }).success).toBe(false);
  });

  it("rejette sans nom", () => {
    expect(enfantSchema.safeParse({ ...VALID, nom: "" }).success).toBe(false);
  });

  it("rejette sans date_naissance", () => {
    expect(enfantSchema.safeParse({ ...VALID, date_naissance: "" }).success).toBe(false);
  });

  it("accepte sexe FILLE et GARCON", () => {
    expect(enfantSchema.safeParse({ ...VALID, sexe: "FILLE" }).success).toBe(true);
    expect(enfantSchema.safeParse({ ...VALID, sexe: "GARCON" }).success).toBe(true);
  });

  it("rejette un sexe invalide", () => {
    expect(enfantSchema.safeParse({ ...VALID, sexe: "AUTRE" }).success).toBe(false);
  });
});

// ═══ ALLERGIE ═══

describe("allergieSchema", () => {
  it("accepte des données valides", () => {
    expect(allergieSchema.safeParse({ allergene: "PLV", severite: "SEVERE" }).success).toBe(true);
  });

  it("accepte toutes les sévérités", () => {
    for (const s of ["LEGERE", "MODEREE", "SEVERE"] as const) {
      expect(allergieSchema.safeParse({ allergene: "Gluten", severite: s }).success).toBe(true);
    }
  });

  it("rejette sans allergène", () => {
    expect(allergieSchema.safeParse({ allergene: "", severite: "LEGERE" }).success).toBe(false);
  });

  it("rejette une sévérité invalide", () => {
    expect(allergieSchema.safeParse({ allergene: "PLV", severite: "CRITIQUE" }).success).toBe(false);
  });
});

// ═══ CONTACT ═══

describe("contactSchema", () => {
  const VALID = { nom: "Papa Martin", lien: "Père", telephone: "0612345678" };

  it("accepte des données valides", () => {
    expect(contactSchema.safeParse(VALID).success).toBe(true);
  });

  it("rejette un téléphone trop court", () => {
    expect(contactSchema.safeParse({ ...VALID, telephone: "06" }).success).toBe(false);
  });

  it("rejette sans nom", () => {
    expect(contactSchema.safeParse({ ...VALID, nom: "" }).success).toBe(false);
  });

  it("rejette sans lien", () => {
    expect(contactSchema.safeParse({ ...VALID, lien: "" }).success).toBe(false);
  });
});
