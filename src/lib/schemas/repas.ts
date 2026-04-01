import { z } from "zod";

const quantiteEnum = z.enum(["TOUT", "BIEN", "PEU", "RIEN"]);

export const repasSchema = z.object({
  structure_id: z.string().min(1, "Structure requise"),
  enfant_id: z.string().min(1, "Enfant requis"),
  type_repas: z.enum(["PETIT_DEJ", "DEJEUNER", "GOUTER", "DINER"], {
    errorMap: () => ({ message: "Type de repas requis" }),
  }),
  entree: z.string().optional(),
  entree_quantite: quantiteEnum.optional(),
  plat: z.string().optional(),
  plat_quantite: quantiteEnum.optional(),
  dessert: z.string().optional(),
  dessert_quantite: quantiteEnum.optional(),
  observations: z.string().optional(),
  professionnel_id: z.string().min(1, "Professionnel requis"),
});

export type RepasForm = z.infer<typeof repasSchema>;
