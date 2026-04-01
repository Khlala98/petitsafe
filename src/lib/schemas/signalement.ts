import { z } from "zod";

export const signalementAbsenceSchema = z.object({
  enfant_id: z.string().min(1, "Enfant requis"),
  date: z.string().min(1, "Date requise"),
  motif: z.enum(["maladie", "vacances", "autre"]),
  commentaire: z.string().optional(),
});

export type SignalementAbsenceData = z.infer<typeof signalementAbsenceSchema>;

export const signalementApportSchema = z.object({
  enfant_id: z.string().min(1, "Enfant requis"),
  date: z.string().min(1, "Date requise"),
  description: z.string().min(1, "Description requise"),
});

export type SignalementApportData = z.infer<typeof signalementApportSchema>;
