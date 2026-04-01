import { z } from "zod";

export const CATEGORIES_PROTOCOLE = [
  "Hygiène",
  "Sécurité",
  "Alimentation",
  "Change",
  "Biberonnerie",
  "Autre",
] as const;

export const protocoleSchema = z.object({
  titre: z.string().min(1, "Titre requis"),
  categorie: z.enum(CATEGORIES_PROTOCOLE),
  contenu_markdown: z.string().min(1, "Contenu requis"),
});

export type ProtocoleForm = z.infer<typeof protocoleSchema>;
