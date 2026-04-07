import { z } from "zod";

export const allergieSchema = z.object({
  allergene: z.string().min(1, "Allergène requis"),
  severite: z.enum(["LEGERE", "MODEREE", "SEVERE"]),
  protocole: z.string().optional(),
  document_pai: z.string().optional(),
});

export const contactSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  lien: z.string().min(1, "Lien requis"),
  telephone: z.string().min(8, "Téléphone invalide"),
  est_autorise_recuperer: z.boolean().default(true),
  ordre_priorite: z.number().int().min(1).default(1),
});

export const enfantSchema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  date_naissance: z
    .string()
    .min(1, "Date de naissance requise")
    .refine((v) => {
      const d = new Date(v);
      if (isNaN(d.getTime())) return false;
      const now = new Date();
      const minDate = new Date(now.getFullYear() - 7, now.getMonth(), now.getDate());
      return d <= now && d >= minDate;
    }, "Date de naissance invalide (l'enfant doit avoir moins de 7 ans et être déjà né)"),
  sexe: z.enum(["FILLE", "GARCON"]).optional().nullable(),
  groupe: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  allergies: z.array(allergieSchema).default([]),
  contacts: z.array(contactSchema).default([]),
  regimes: z.array(z.string()).default([]),
});

export const importEnfantSchema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  date_naissance: z.string().optional(),
  sexe: z.string().optional(),
  groupe: z.string().optional(),
  allergene_1: z.string().optional(),
  severite_1: z.string().optional(),
  allergene_2: z.string().optional(),
  severite_2: z.string().optional(),
  allergene_3: z.string().optional(),
  severite_3: z.string().optional(),
});

export type EnfantForm = z.infer<typeof enfantSchema>;
export type AllergieForm = z.infer<typeof allergieSchema>;
export type ContactForm = z.infer<typeof contactSchema>;
export type ImportEnfantRow = z.infer<typeof importEnfantSchema>;
