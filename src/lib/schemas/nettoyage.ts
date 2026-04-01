import { z } from "zod";

export const validationNettoyageSchema = z.object({
  tache_id: z.string().min(1, "Tâche requise"),
  professionnel_id: z.string().min(1),
  professionnel_nom: z.string().min(1, "Nom requis"),
  observations: z.string().optional(),
});

export type ValidationNettoyageForm = z.infer<typeof validationNettoyageSchema>;

export const zoneNettoyageSchema = z.object({
  nom: z.string().min(1, "Nom de zone requis"),
  couleur_code: z.string().optional(),
  ordre: z.number().int().min(0).default(0),
});

export type ZoneNettoyageForm = z.infer<typeof zoneNettoyageSchema>;

export const tacheNettoyageSchema = z.object({
  zone_id: z.string().min(1, "Zone requise"),
  nom: z.string().min(1, "Nom de tâche requis"),
  frequence: z.enum(["APRES_UTILISATION", "QUOTIDIEN", "BIQUOTIDIEN", "HEBDO", "BIMENSUEL", "MENSUEL"]),
  methode: z.string().min(1, "Méthode requise"),
  produit: z.string().optional(),
  notes: z.string().optional(),
});

export type TacheNettoyageForm = z.infer<typeof tacheNettoyageSchema>;
