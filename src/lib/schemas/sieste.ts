import { z } from "zod";

export const debutSiesteSchema = z.object({
  structure_id: z.string().min(1, "Structure requise"),
  enfant_id: z.string().min(1, "Enfant requis"),
  professionnel_id: z.string().min(1, "Professionnel requis"),
});

export const finSiesteSchema = z.object({
  sieste_id: z.string().min(1, "Sieste requise"),
  qualite: z.enum(["CALME", "AGITE", "DIFFICILE", "REVEILS"]).optional(),
});

export type DebutSiesteForm = z.infer<typeof debutSiesteSchema>;
export type FinSiesteForm = z.infer<typeof finSiesteSchema>;
