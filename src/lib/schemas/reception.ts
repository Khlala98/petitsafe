import { z } from "zod";

export const receptionMarchandiseSchema = z.object({
  structure_id: z.string().min(1, "Structure requise"),
  nom_produit: z.string().min(1, "Nom du produit requis"),
  fournisseur: z.string().min(1, "Fournisseur requis"),
  numero_lot: z.string().min(1, "Numéro de lot obligatoire (traçabilité)"),
  dlc: z.string().min(1, "DLC requise"),
  temperature_reception: z.number().optional(),
  emballage_conforme: z.boolean(),
  conforme: z.boolean(),
  motif_non_conformite: z.string().optional(),
  professionnel_id: z.string().min(1, "Professionnel requis"),
}).refine(
  (data) => data.conforme || (data.motif_non_conformite && data.motif_non_conformite.length > 0),
  { message: "Motif de non-conformité obligatoire si produit non conforme", path: ["motif_non_conformite"] }
);

export type ReceptionMarchandiseForm = z.infer<typeof receptionMarchandiseSchema>;
