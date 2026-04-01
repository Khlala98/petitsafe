import { z } from "zod";

export const demandeDemoSchema = z.object({
  nom: z.string().min(2, "Nom requis (2 caractères min.)"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(10, "Téléphone requis (10 caractères min.)"),
  type_structure: z.enum(["CRECHE", "MICRO_CRECHE", "MAM", "ASS_MAT"], {
    errorMap: () => ({ message: "Sélectionnez un type de structure" }),
  }),
  nombre_structures: z.string().min(1, "Nombre de structures requis"),
});

export type DemandeDemoForm = z.infer<typeof demandeDemoSchema>;
