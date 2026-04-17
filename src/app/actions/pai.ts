"use server";

import { prisma } from "@/lib/supabase/prisma";

export interface PAIInput {
  enfant_id: string;
  actif: boolean;
  allergenes: string[];
  medicaments_autorises?: string;
  protocole_urgence?: string;
  medecin_nom?: string;
  medecin_telephone?: string;
  numero_urgence?: string;
  document_url?: string;
  date_revision?: string;
  notes?: string;
}

export async function getPAI(enfantId: string) {
  try {
    const pai = await prisma.pAI.findUnique({ where: { enfant_id: enfantId } });
    return { success: true as const, data: pai };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement du PAI." };
  }
}

export async function listerEnfantsAvecPAI(structureId: string) {
  try {
    const pais = await prisma.pAI.findMany({
      where: { structure_id: structureId, actif: true, enfant: { actif: true } },
      select: { enfant_id: true },
    });
    return { success: true as const, data: pais.map((p) => p.enfant_id) };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des PAI." };
  }
}

export async function upsertPAI(structureId: string, data: PAIInput) {
  try {
    if (!data.enfant_id) return { success: false as const, error: "Enfant requis." };

    const payload = {
      structure_id: structureId,
      enfant_id: data.enfant_id,
      actif: data.actif,
      allergenes: data.allergenes,
      medicaments_autorises: data.medicaments_autorises?.trim() || null,
      protocole_urgence: data.protocole_urgence?.trim() || null,
      medecin_nom: data.medecin_nom?.trim() || null,
      medecin_telephone: data.medecin_telephone?.trim() || null,
      numero_urgence: data.numero_urgence?.trim() || null,
      document_url: data.document_url?.trim() || null,
      date_revision: data.date_revision ? new Date(data.date_revision) : null,
      notes: data.notes?.trim() || null,
    };

    const pai = await prisma.pAI.upsert({
      where: { enfant_id: data.enfant_id },
      create: payload,
      update: {
        actif: payload.actif,
        allergenes: payload.allergenes,
        medicaments_autorises: payload.medicaments_autorises,
        protocole_urgence: payload.protocole_urgence,
        medecin_nom: payload.medecin_nom,
        medecin_telephone: payload.medecin_telephone,
        numero_urgence: payload.numero_urgence,
        document_url: payload.document_url,
        date_revision: payload.date_revision,
        notes: payload.notes,
      },
    });
    return { success: true as const, data: pai };
  } catch {
    return { success: false as const, error: "Erreur lors de l'enregistrement du PAI." };
  }
}

export async function supprimerPAI(enfantId: string) {
  try {
    await prisma.pAI.delete({ where: { enfant_id: enfantId } });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la suppression du PAI." };
  }
}
