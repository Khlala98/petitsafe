import { describe, it, expect } from "vitest";
import {
  validationNettoyageSchema,
  zoneNettoyageSchema,
  tacheNettoyageSchema,
} from "@/lib/schemas/nettoyage";

// ═══ VALIDATION NETTOYAGE ═══

describe("validationNettoyageSchema", () => {
  const VALID = {
    tache_id: "tache-1",
    professionnel_id: "pro-1",
    professionnel_nom: "Marie Dupont",
  };

  it("accepte des données valides", () => {
    expect(validationNettoyageSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepte avec observations", () => {
    expect(validationNettoyageSchema.safeParse({ ...VALID, observations: "RAS" }).success).toBe(true);
  });

  it("rejette sans tache_id", () => {
    expect(validationNettoyageSchema.safeParse({ ...VALID, tache_id: "" }).success).toBe(false);
  });

  it("rejette sans professionnel_nom", () => {
    expect(validationNettoyageSchema.safeParse({ ...VALID, professionnel_nom: "" }).success).toBe(false);
  });
});

// ═══ ZONE NETTOYAGE ═══

describe("zoneNettoyageSchema", () => {
  it("accepte des données valides", () => {
    expect(zoneNettoyageSchema.safeParse({ nom: "Cuisine" }).success).toBe(true);
  });

  it("accepte avec couleur et ordre", () => {
    expect(zoneNettoyageSchema.safeParse({ nom: "Salle de change", couleur_code: "#FF5733", ordre: 2 }).success).toBe(true);
  });

  it("rejette sans nom", () => {
    expect(zoneNettoyageSchema.safeParse({ nom: "" }).success).toBe(false);
  });
});

// ═══ TÂCHE NETTOYAGE ═══

describe("tacheNettoyageSchema", () => {
  const VALID = {
    zone_id: "zone-1",
    nom: "Nettoyage plans de travail",
    frequence: "QUOTIDIEN" as const,
    methode: "Spray désinfectant + lingette",
  };

  it("accepte des données valides", () => {
    expect(tacheNettoyageSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepte toutes les fréquences", () => {
    for (const f of ["APRES_UTILISATION", "QUOTIDIEN", "BIQUOTIDIEN", "HEBDO", "BIMENSUEL", "MENSUEL"] as const) {
      expect(tacheNettoyageSchema.safeParse({ ...VALID, frequence: f }).success).toBe(true);
    }
  });

  it("rejette une fréquence invalide", () => {
    expect(tacheNettoyageSchema.safeParse({ ...VALID, frequence: "ANNUEL" }).success).toBe(false);
  });

  it("rejette sans méthode", () => {
    expect(tacheNettoyageSchema.safeParse({ ...VALID, methode: "" }).success).toBe(false);
  });

  it("rejette sans zone_id", () => {
    expect(tacheNettoyageSchema.safeParse({ ...VALID, zone_id: "" }).success).toBe(false);
  });

  it("accepte avec produit et notes", () => {
    const result = tacheNettoyageSchema.safeParse({ ...VALID, produit: "Sanytol", notes: "Bien rincer" });
    expect(result.success).toBe(true);
  });
});
