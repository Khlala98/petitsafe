import { z } from "zod";

export const biberonSchema = z.object({
  structure_id: z.string().min(1, "Structure requise"),
  enfant_id: z.string().min(1, "Enfant requis"),
  type_lait: z.string().min(1, "Type de lait requis"),
  nom_lait: z.string().optional(),
  numero_lot: z.string().min(1, "Numéro de lot obligatoire (traçabilité)"),
  date_peremption_lait: z.string().optional(),
  date_ouverture_boite: z.string().optional(),
  nombre_dosettes: z.number().int().positive().optional(),
  quantite_preparee_ml: z.number().int().positive("Quantité doit être > 0"),
  preparateur_nom: z.string().min(1, "Nom du préparateur requis"),
  professionnel_id: z.string().min(1, "Professionnel requis"),
  observations: z.string().optional(),
});

export type BiberonForm = z.infer<typeof biberonSchema>;
