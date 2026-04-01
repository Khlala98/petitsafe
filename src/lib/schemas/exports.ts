import { z } from "zod";

export const exportFormSchema = z.object({
  type_export: z.enum(["DDPP", "PMI", "INTERNE"]),
  periode_debut: z.string().min(1, "Date de début requise"),
  periode_fin: z.string().min(1, "Date de fin requise"),
}).refine(
  (data) => new Date(data.periode_debut) <= new Date(data.periode_fin),
  { message: "La date de début doit être avant la date de fin", path: ["periode_fin"] }
);

export type ExportFormData = z.infer<typeof exportFormSchema>;
