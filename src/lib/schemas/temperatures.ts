import { z } from "zod";

export const equipementSchema = z.object({
  structure_id: z.string().min(1, "Structure requise"),
  nom: z.string().min(1, "Nom requis"),
  type: z.enum(["REFRIGERATEUR", "CONGELATEUR"], {
    errorMap: () => ({ message: "Type d'équipement requis" }),
  }),
  temperature_max: z.number({ required_error: "Température max requise" }),
});

export const releveTemperatureSchema = z.object({
  structure_id: z.string().min(1, "Structure requise"),
  equipement_id: z.string().min(1, "Équipement requis"),
  temperature: z.number({ required_error: "Température requise" }),
  conforme: z.boolean(),
  action_corrective: z.string().optional(),
  professionnel_id: z.string().min(1, "Professionnel requis"),
  heure: z.string().optional(),
}).refine(
  (data) => data.conforme || (data.action_corrective && data.action_corrective.length > 0),
  { message: "Action corrective obligatoire si non conforme", path: ["action_corrective"] }
);

export const relevePlatSchema = z.object({
  structure_id: z.string().min(1, "Structure requise"),
  nom_plat: z.string().min(1, "Nom du plat requis"),
  temperature_avant: z.number({ required_error: "Température avant requise" }),
  heure_avant: z.string().min(1, "Heure avant requise"),
  temperature_apres: z.number({ required_error: "Température après requise" }),
  heure_apres: z.string().min(1, "Heure après requise"),
  conforme: z.boolean(),
  action_corrective: z.string().optional(),
  professionnel_id: z.string().min(1, "Professionnel requis"),
}).refine(
  (data) => data.conforme || (data.action_corrective && data.action_corrective.length > 0),
  { message: "Action corrective obligatoire si non conforme", path: ["action_corrective"] }
);

export type EquipementForm = z.infer<typeof equipementSchema>;
export type ReleveTemperatureForm = z.infer<typeof releveTemperatureSchema>;
export type RelevePlatForm = z.infer<typeof relevePlatSchema>;
