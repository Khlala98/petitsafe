import { describe, it, expect } from "vitest";
import {
  getConformiteTemperature,
  getConformitePlat,
  getStatutBiberon,
  isBoiteLaitExpiree,
  getAlerteDLC,
  calculerAge,
  getTachesJour,
  isModuleActif,
  getModulesParCategorie,
} from "@/lib/business-logic";
import { PRESETS_MODULES } from "@/lib/constants";

// ═══ CONFORMITÉ TEMPÉRATURE ═══

describe("getConformiteTemperature", () => {
  it("frigo 3.5°C → conforme", () => {
    expect(getConformiteTemperature(3.5, "REFRIGERATEUR")).toBe("conforme");
  });

  it("frigo 4.5°C → attention", () => {
    expect(getConformiteTemperature(4.5, "REFRIGERATEUR")).toBe("attention");
  });

  it("frigo 5.5°C → alerte", () => {
    expect(getConformiteTemperature(5.5, "REFRIGERATEUR")).toBe("alerte");
  });

  it("frigo 0°C (limite basse) → conforme", () => {
    expect(getConformiteTemperature(0, "REFRIGERATEUR")).toBe("conforme");
  });

  it("frigo 4°C (limite haute) → conforme", () => {
    expect(getConformiteTemperature(4, "REFRIGERATEUR")).toBe("conforme");
  });

  it("congélateur -20°C → conforme", () => {
    expect(getConformiteTemperature(-20, "CONGELATEUR")).toBe("conforme");
  });

  it("congélateur -16°C → attention", () => {
    expect(getConformiteTemperature(-16, "CONGELATEUR")).toBe("attention");
  });

  it("congélateur -14°C → alerte", () => {
    expect(getConformiteTemperature(-14, "CONGELATEUR")).toBe("alerte");
  });

  it("congélateur -18°C (limite) → conforme", () => {
    expect(getConformiteTemperature(-18, "CONGELATEUR")).toBe("conforme");
  });
});

// ═══ CONFORMITÉ PLAT ═══

describe("getConformitePlat", () => {
  it("plat chaud 65°C → conforme", () => {
    expect(getConformitePlat(65, "CHAUD")).toBe("conforme");
  });

  it("plat chaud 63°C (limite) → conforme", () => {
    expect(getConformitePlat(63, "CHAUD")).toBe("conforme");
  });

  it("plat chaud 58°C → alerte", () => {
    expect(getConformitePlat(58, "CHAUD")).toBe("alerte");
  });

  it("plat chaud 72°C → conforme", () => {
    expect(getConformitePlat(72, "CHAUD")).toBe("conforme");
  });

  it("plat froid 2°C → conforme", () => {
    expect(getConformitePlat(2, "FROID")).toBe("conforme");
  });

  it("plat froid 3°C (limite) → conforme", () => {
    expect(getConformitePlat(3, "FROID")).toBe("conforme");
  });

  it("plat froid 8°C → alerte", () => {
    expect(getConformitePlat(8, "FROID")).toBe("alerte");
  });

  it("défaut (sans type) → se comporte comme CHAUD", () => {
    expect(getConformitePlat(65)).toBe("conforme");
    expect(getConformitePlat(58)).toBe("alerte");
  });
});

// ═══ TIMER ANSES BIBERON ═══

describe("getStatutBiberon", () => {
  it("préparé il y a 30 min → ok", () => {
    const maintenant = new Date("2026-04-01T10:30:00");
    const preparation = new Date("2026-04-01T10:00:00");
    expect(getStatutBiberon(preparation, maintenant)).toBe("ok");
  });

  it("préparé il y a 50 min → attention", () => {
    const maintenant = new Date("2026-04-01T10:50:00");
    const preparation = new Date("2026-04-01T10:00:00");
    expect(getStatutBiberon(preparation, maintenant)).toBe("attention");
  });

  it("préparé il y a 65 min → alerte", () => {
    const maintenant = new Date("2026-04-01T11:05:00");
    const preparation = new Date("2026-04-01T10:00:00");
    expect(getStatutBiberon(preparation, maintenant)).toBe("alerte");
  });

  it("préparé il y a 45 min exactement → attention", () => {
    const maintenant = new Date("2026-04-01T10:46:00"); // 46 min > 45
    const preparation = new Date("2026-04-01T10:00:00");
    expect(getStatutBiberon(preparation, maintenant)).toBe("attention");
  });

  it("préparé il y a 60 min exactement → attention (pas encore alerte)", () => {
    const maintenant = new Date("2026-04-01T11:00:00"); // pile 60 min
    const preparation = new Date("2026-04-01T10:00:00");
    // 60 min n'est PAS > 60, donc pas alerte
    expect(getStatutBiberon(preparation, maintenant)).toBe("attention");
  });

  it("préparé il y a 61 min → alerte", () => {
    const maintenant = new Date("2026-04-01T11:01:00");
    const preparation = new Date("2026-04-01T10:00:00");
    expect(getStatutBiberon(preparation, maintenant)).toBe("alerte");
  });
});

// ═══ BOÎTE LAIT ═══

describe("isBoiteLaitExpiree", () => {
  it("ouverte depuis 25 jours → pas expirée", () => {
    const maintenant = new Date("2026-04-26T10:00:00");
    const ouverture = new Date("2026-04-01T10:00:00");
    expect(isBoiteLaitExpiree(ouverture, maintenant)).toBe(false);
  });

  it("ouverte depuis 35 jours → expirée", () => {
    const maintenant = new Date("2026-05-06T10:00:00");
    const ouverture = new Date("2026-04-01T10:00:00");
    expect(isBoiteLaitExpiree(ouverture, maintenant)).toBe(true);
  });

  it("ouverte depuis 30 jours exactement → pas expirée", () => {
    const maintenant = new Date("2026-05-01T10:00:00");
    const ouverture = new Date("2026-04-01T10:00:00");
    expect(isBoiteLaitExpiree(ouverture, maintenant)).toBe(false);
  });

  it("ouverte depuis 31 jours → expirée", () => {
    const maintenant = new Date("2026-05-02T10:00:00");
    const ouverture = new Date("2026-04-01T10:00:00");
    expect(isBoiteLaitExpiree(ouverture, maintenant)).toBe(true);
  });
});

// ═══ DLC ═══

describe("getAlerteDLC", () => {
  it("DLC dans 5 jours → null", () => {
    const maintenant = new Date("2026-04-01T10:00:00");
    const dlc = new Date("2026-04-06T00:00:00");
    expect(getAlerteDLC(dlc, maintenant)).toBeNull();
  });

  it("DLC dans 2 jours → warning", () => {
    const maintenant = new Date("2026-04-01T10:00:00");
    const dlc = new Date("2026-04-03T00:00:00");
    expect(getAlerteDLC(dlc, maintenant)).toBe("warning");
  });

  it("DLC dans 1 jour → warning", () => {
    const maintenant = new Date("2026-04-01T10:00:00");
    const dlc = new Date("2026-04-02T00:00:00");
    expect(getAlerteDLC(dlc, maintenant)).toBe("warning");
  });

  it("DLC aujourd'hui → alerte", () => {
    const maintenant = new Date("2026-04-01T14:00:00");
    const dlc = new Date("2026-04-01T00:00:00");
    expect(getAlerteDLC(dlc, maintenant)).toBe("alerte");
  });

  it("DLC hier → critique", () => {
    const maintenant = new Date("2026-04-02T10:00:00");
    const dlc = new Date("2026-04-01T00:00:00");
    expect(getAlerteDLC(dlc, maintenant)).toBe("critique");
  });

  it("DLC dans 3 jours → null (> DLC_ALERTE_JOURS)", () => {
    const maintenant = new Date("2026-04-01T10:00:00");
    const dlc = new Date("2026-04-04T00:00:00");
    expect(getAlerteDLC(dlc, maintenant)).toBeNull();
  });
});

// ═══ ÂGE ═══

describe("calculerAge", () => {
  it("né il y a 8 mois → '8 mois'", () => {
    const maintenant = new Date("2026-04-01T10:00:00");
    const naissance = new Date("2025-08-01T00:00:00");
    expect(calculerAge(naissance, maintenant)).toBe("8 mois");
  });

  it("né il y a 26 mois → '2 ans et 2 mois'", () => {
    const maintenant = new Date("2026-04-01T10:00:00");
    const naissance = new Date("2024-02-01T00:00:00");
    expect(calculerAge(naissance, maintenant)).toBe("2 ans et 2 mois");
  });

  it("né il y a 12 mois → '12 mois'", () => {
    const maintenant = new Date("2026-04-01T10:00:00");
    const naissance = new Date("2025-04-01T00:00:00");
    expect(calculerAge(naissance, maintenant)).toBe("12 mois");
  });

  it("né il y a 24 mois → '2 ans'", () => {
    const maintenant = new Date("2026-04-01T10:00:00");
    const naissance = new Date("2024-04-01T00:00:00");
    expect(calculerAge(naissance, maintenant)).toBe("2 ans");
  });

  it("né il y a 36 mois → '3 ans'", () => {
    const maintenant = new Date("2026-04-01T10:00:00");
    const naissance = new Date("2023-04-01T00:00:00");
    expect(calculerAge(naissance, maintenant)).toBe("3 ans");
  });

  it("né il y a 7 ans (84 mois) → '7 ans'", () => {
    const maintenant = new Date("2026-04-01T10:00:00");
    const naissance = new Date("2019-04-01T00:00:00");
    expect(calculerAge(naissance, maintenant)).toBe("7 ans");
  });

  it("né il y a 5 ans et 6 mois → '5 ans et 6 mois'", () => {
    const maintenant = new Date("2026-04-01T10:00:00");
    const naissance = new Date("2020-10-01T00:00:00");
    expect(calculerAge(naissance, maintenant)).toBe("5 ans et 6 mois");
  });
});

// ═══ TÂCHES NETTOYAGE (fréquence) ═══

describe("getTachesJour", () => {
  const taches = [
    { frequence: "QUOTIDIEN" as const, actif: true },
    { frequence: "HEBDO" as const, actif: true },
    { frequence: "MENSUEL" as const, actif: true },
    { frequence: "BIQUOTIDIEN" as const, actif: true },
    { frequence: "APRES_UTILISATION" as const, actif: true },
    { frequence: "BIMENSUEL" as const, actif: true },
    { frequence: "QUOTIDIEN" as const, actif: false }, // inactive
  ];

  it("un lundi non 1er → QUOTIDIEN + HEBDO + BIQUOTIDIEN + APRES_UTILISATION, pas MENSUEL", () => {
    // 6 avril 2026 = lundi, pas le 1er
    const lundi = new Date("2026-04-06T10:00:00");
    const result = getTachesJour(taches, lundi);
    expect(result).toContainEqual({ frequence: "QUOTIDIEN", actif: true });
    expect(result).toContainEqual({ frequence: "HEBDO", actif: true });
    expect(result).toContainEqual({ frequence: "BIQUOTIDIEN", actif: true });
    expect(result).toContainEqual({ frequence: "APRES_UTILISATION", actif: true });
    expect(result).not.toContainEqual({ frequence: "MENSUEL", actif: true });
  });

  it("un 1er du mois (pas lundi) → QUOTIDIEN + MENSUEL + BIMENSUEL, pas HEBDO", () => {
    // 1er avril 2026 = mercredi
    const premier = new Date("2026-04-01T10:00:00");
    const result = getTachesJour(taches, premier);
    expect(result).toContainEqual({ frequence: "QUOTIDIEN", actif: true });
    expect(result).toContainEqual({ frequence: "MENSUEL", actif: true });
    expect(result).toContainEqual({ frequence: "BIMENSUEL", actif: true });
    expect(result).not.toContainEqual({ frequence: "HEBDO", actif: true });
  });

  it("un 15 du mois → inclut BIMENSUEL", () => {
    const quinze = new Date("2026-04-15T10:00:00");
    const result = getTachesJour(taches, quinze);
    expect(result).toContainEqual({ frequence: "BIMENSUEL", actif: true });
  });

  it("exclut les tâches inactives", () => {
    const date = new Date("2026-04-01T10:00:00");
    const result = getTachesJour(taches, date);
    expect(result).not.toContainEqual({ frequence: "QUOTIDIEN", actif: false });
  });

  it("un mardi 7 → QUOTIDIEN + BIQUOTIDIEN + APRES_UTILISATION seulement", () => {
    // 7 avril 2026 = mardi, pas le 1er ni le 15
    const mardi = new Date("2026-04-07T10:00:00");
    const result = getTachesJour(taches, mardi);
    const frequences = result.map((t) => t.frequence);
    expect(frequences).toContain("QUOTIDIEN");
    expect(frequences).toContain("BIQUOTIDIEN");
    expect(frequences).toContain("APRES_UTILISATION");
    expect(frequences).not.toContain("HEBDO");
    expect(frequences).not.toContain("MENSUEL");
    expect(frequences).not.toContain("BIMENSUEL");
  });
});

// ═══ MODULES ═══

describe("isModuleActif", () => {
  it("temperatures actif → true", () => {
    expect(isModuleActif(["temperatures", "nettoyage"], "temperatures")).toBe(true);
  });

  it("repas pas actif → false", () => {
    expect(isModuleActif(["temperatures", "nettoyage"], "repas")).toBe(false);
  });

  it("tableau vide → false", () => {
    expect(isModuleActif([], "temperatures")).toBe(false);
  });
});

describe("getModulesParCategorie", () => {
  it("preset haccp_essentiel → 4 modules haccp, 0 suivi, 0 gestion", () => {
    const result = getModulesParCategorie(PRESETS_MODULES.haccp_essentiel);
    expect(result.haccp).toEqual(["temperatures", "tracabilite", "nettoyage", "biberonnerie"]);
    expect(result.suivi).toEqual([]);
    expect(result.gestion).toEqual([]);
  });

  it("preset complet → tous les modules répartis", () => {
    const result = getModulesParCategorie(PRESETS_MODULES.complet);
    expect(result.haccp).toHaveLength(4);
    expect(result.suivi).toHaveLength(4);
    expect(result.gestion).toHaveLength(2);
  });

  it("tableau vide → tout vide", () => {
    const result = getModulesParCategorie([]);
    expect(result.haccp).toEqual([]);
    expect(result.suivi).toEqual([]);
    expect(result.gestion).toEqual([]);
  });
});
