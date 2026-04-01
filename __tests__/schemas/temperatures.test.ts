import { describe, it, expect } from "vitest";
import { equipementSchema, releveTemperatureSchema, relevePlatSchema } from "@/lib/schemas/temperatures";

// ═══ EQUIPEMENT ═══

describe("equipementSchema", () => {
  const VALID = {
    structure_id: "struct-1",
    nom: "Frigo cuisine",
    type: "REFRIGERATEUR" as const,
    temperature_max: 4,
  };

  it("accepte des données valides", () => {
    expect(equipementSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepte CONGELATEUR", () => {
    expect(equipementSchema.safeParse({ ...VALID, type: "CONGELATEUR" }).success).toBe(true);
  });

  it("rejette un type invalide", () => {
    expect(equipementSchema.safeParse({ ...VALID, type: "FOUR" }).success).toBe(false);
  });

  it("rejette sans nom", () => {
    expect(equipementSchema.safeParse({ ...VALID, nom: "" }).success).toBe(false);
  });
});

// ═══ RELEVÉ TEMPÉRATURE ═══

describe("releveTemperatureSchema", () => {
  const VALID_CONFORME = {
    structure_id: "struct-1",
    equipement_id: "equip-1",
    temperature: 3.5,
    conforme: true,
    professionnel_id: "pro-1",
  };

  it("accepte un relevé conforme sans action corrective", () => {
    expect(releveTemperatureSchema.safeParse(VALID_CONFORME).success).toBe(true);
  });

  it("accepte un relevé non conforme avec action corrective", () => {
    const result = releveTemperatureSchema.safeParse({
      ...VALID_CONFORME,
      temperature: 6,
      conforme: false,
      action_corrective: "Vérification thermostat + re-relevé dans 30 min",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un relevé non conforme SANS action corrective", () => {
    const result = releveTemperatureSchema.safeParse({
      ...VALID_CONFORME,
      temperature: 6,
      conforme: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("action_corrective"))).toBe(true);
    }
  });

  it("rejette un relevé non conforme avec action corrective vide", () => {
    const result = releveTemperatureSchema.safeParse({
      ...VALID_CONFORME,
      conforme: false,
      action_corrective: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejette sans equipement_id", () => {
    expect(releveTemperatureSchema.safeParse({ ...VALID_CONFORME, equipement_id: "" }).success).toBe(false);
  });

  it("accepte avec heure optionnelle", () => {
    expect(releveTemperatureSchema.safeParse({ ...VALID_CONFORME, heure: "08:30" }).success).toBe(true);
  });
});

// ═══ RELEVÉ PLAT ═══

describe("relevePlatSchema", () => {
  const VALID_PLAT = {
    structure_id: "struct-1",
    nom_plat: "Purée de carottes",
    temperature_avant: 5,
    heure_avant: "11:00",
    temperature_apres: 65,
    heure_apres: "11:30",
    conforme: true,
    professionnel_id: "pro-1",
  };

  it("accepte des données valides", () => {
    expect(relevePlatSchema.safeParse(VALID_PLAT).success).toBe(true);
  });

  it("rejette sans nom_plat", () => {
    expect(relevePlatSchema.safeParse({ ...VALID_PLAT, nom_plat: "" }).success).toBe(false);
  });

  it("rejette non conforme sans action corrective", () => {
    const result = relevePlatSchema.safeParse({ ...VALID_PLAT, conforme: false });
    expect(result.success).toBe(false);
  });

  it("accepte non conforme avec action corrective", () => {
    const result = relevePlatSchema.safeParse({
      ...VALID_PLAT,
      conforme: false,
      action_corrective: "Réchauffage supplémentaire",
    });
    expect(result.success).toBe(true);
  });
});
