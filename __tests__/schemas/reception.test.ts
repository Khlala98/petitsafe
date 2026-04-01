import { describe, it, expect } from "vitest";
import { receptionMarchandiseSchema } from "@/lib/schemas/reception";

const VALID_RECEPTION = {
  structure_id: "struct-1",
  nom_produit: "Lait Gallia 1er âge",
  fournisseur: "Sodexo",
  numero_lot: "LOT-2026-042",
  dlc: "2026-06-15",
  emballage_conforme: true,
  conforme: true,
  professionnel_id: "pro-1",
};

describe("receptionMarchandiseSchema", () => {
  it("accepte des données valides", () => {
    expect(receptionMarchandiseSchema.safeParse(VALID_RECEPTION).success).toBe(true);
  });

  it("accepte avec température de réception", () => {
    const result = receptionMarchandiseSchema.safeParse({
      ...VALID_RECEPTION,
      temperature_reception: 3.2,
    });
    expect(result.success).toBe(true);
  });

  it("rejette sans numéro de lot", () => {
    expect(receptionMarchandiseSchema.safeParse({ ...VALID_RECEPTION, numero_lot: "" }).success).toBe(false);
  });

  it("rejette sans fournisseur", () => {
    expect(receptionMarchandiseSchema.safeParse({ ...VALID_RECEPTION, fournisseur: "" }).success).toBe(false);
  });

  it("rejette sans DLC", () => {
    expect(receptionMarchandiseSchema.safeParse({ ...VALID_RECEPTION, dlc: "" }).success).toBe(false);
  });

  it("rejette non conforme sans motif", () => {
    const result = receptionMarchandiseSchema.safeParse({
      ...VALID_RECEPTION,
      conforme: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("motif_non_conformite"))).toBe(true);
    }
  });

  it("rejette non conforme avec motif vide", () => {
    const result = receptionMarchandiseSchema.safeParse({
      ...VALID_RECEPTION,
      conforme: false,
      motif_non_conformite: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepte non conforme avec motif renseigné", () => {
    const result = receptionMarchandiseSchema.safeParse({
      ...VALID_RECEPTION,
      conforme: false,
      motif_non_conformite: "Emballage abîmé, température > 7°C",
    });
    expect(result.success).toBe(true);
  });

  it("rejette sans nom_produit", () => {
    expect(receptionMarchandiseSchema.safeParse({ ...VALID_RECEPTION, nom_produit: "" }).success).toBe(false);
  });
});
