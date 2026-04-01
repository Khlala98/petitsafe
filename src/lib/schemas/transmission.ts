import { z } from "zod";

export const transmissionSchema = z.object({
  structure_id: z.string().min(1),
  enfant_id: z.string().optional(),
  contenu: z.string().min(1, "Le contenu est requis"),
  type_transm: z.enum(["GENERAL", "ENFANT", "EQUIPE"]),
  auteur: z.string().min(1),
});

export type TransmissionForm = z.infer<typeof transmissionSchema>;
