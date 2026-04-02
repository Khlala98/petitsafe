import { z } from "zod";

export const stockSchema = z.object({
  structure_id: z.string().min(1, "Structure requise"),
  categorie: z.enum(["COUCHES", "ENTRETIEN", "LAIT", "COMPOTES", "AUTRE"], {
    errorMap: () => ({ message: "Catégorie requise" }),
  }),
  produit_nom: z.string().min(1, "Nom du produit requis"),
  quantite: z.number().int("Quantité doit être un nombre entier").min(0, "Quantité doit être ≥ 0").max(99999, "Quantité ne peut pas dépasser 99 999"),
  unite: z.string().min(1, "Unité requise"),
  seuil_alerte: z.number().min(0, "Seuil doit être ≥ 0"),
  maj_par: z.string().min(1, "Responsable requis"),
});

export const ajustementStockSchema = z.object({
  stockId: z.string().min(1, "Stock requis"),
  delta: z.number().refine((v) => v !== 0, "La quantité ne peut pas être 0"),
  par: z.string().min(1, "Responsable requis"),
});

export type StockForm = z.infer<typeof stockSchema>;
export type AjustementStockForm = z.infer<typeof ajustementStockSchema>;
