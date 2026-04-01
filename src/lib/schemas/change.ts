import { z } from "zod";

export const changeSchema = z.object({
  structure_id: z.string().min(1, "Structure requise"),
  enfant_id: z.string().min(1, "Enfant requis"),
  type_change: z.enum(["MOUILLEE", "SELLE", "LES_DEUX"], {
    errorMap: () => ({ message: "Type de change requis" }),
  }),
  observations: z.string().optional(),
  professionnel_id: z.string().min(1, "Professionnel requis"),
});

export type ChangeForm = z.infer<typeof changeSchema>;
