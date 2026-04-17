"use server";

import { prisma } from "@/lib/supabase/prisma";
import type { StatutLaitMaternel } from "@prisma/client";

export interface LaitMaternelInput {
  enfant_id: string;
  date_recueil: string;
  congele: boolean;
  date_decongelation?: string;
  quantite_ml: number;
  notes?: string;
}

const HEURES_FRIGO = 24;
const MOIS_CONGELATEUR = 6;

function calculerDlcLaitMaternel(dateRecueil: Date, congele: boolean, dateDecongelation: Date | null): Date {
  const dlc = new Date(dateRecueil);
  if (congele) {
    if (dateDecongelation) {
      const decongel = new Date(dateDecongelation);
      decongel.setHours(decongel.getHours() + HEURES_FRIGO);
      return decongel;
    }
    dlc.setMonth(dlc.getMonth() + MOIS_CONGELATEUR);
    return dlc;
  }
  dlc.setHours(dlc.getHours() + HEURES_FRIGO);
  return dlc;
}

export async function listerLaitsMaternels(structureId: string, opts?: { enfantId?: string; statut?: StatutLaitMaternel }) {
  try {
    const list = await prisma.laitMaternel.findMany({
      where: {
        structure_id: structureId,
        ...(opts?.enfantId ? { enfant_id: opts.enfantId } : {}),
        ...(opts?.statut ? { statut: opts.statut } : {}),
      },
      include: { enfant: { select: { id: true, prenom: true, nom: true } } },
      orderBy: [{ statut: "asc" }, { dlc: "asc" }],
    });
    return { success: true as const, data: list };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des laits maternels." };
  }
}

export async function creerLaitMaternel(structureId: string, data: LaitMaternelInput) {
  try {
    if (!data.enfant_id) return { success: false as const, error: "Enfant requis." };
    if (!data.date_recueil) return { success: false as const, error: "Date de recueil requise." };
    if (!data.quantite_ml || data.quantite_ml <= 0) return { success: false as const, error: "Quantité invalide." };

    const dateRecueil = new Date(data.date_recueil);
    const dateDecongel = data.date_decongelation ? new Date(data.date_decongelation) : null;
    const dlc = calculerDlcLaitMaternel(dateRecueil, data.congele, dateDecongel);

    const lm = await prisma.laitMaternel.create({
      data: {
        structure_id: structureId,
        enfant_id: data.enfant_id,
        date_recueil: dateRecueil,
        congele: data.congele,
        date_decongelation: dateDecongel,
        quantite_ml: data.quantite_ml,
        quantite_restante_ml: data.quantite_ml,
        dlc,
        notes: data.notes?.trim() || null,
      },
    });
    return { success: true as const, data: lm };
  } catch {
    return { success: false as const, error: "Erreur lors de la création." };
  }
}

export async function modifierLaitMaternel(id: string, data: Partial<LaitMaternelInput> & { statut?: StatutLaitMaternel }) {
  try {
    const existing = await prisma.laitMaternel.findUnique({ where: { id } });
    if (!existing) return { success: false as const, error: "Lait maternel introuvable." };

    const dateRecueil = data.date_recueil ? new Date(data.date_recueil) : existing.date_recueil;
    const congele = data.congele !== undefined ? data.congele : existing.congele;
    const dateDecongel =
      data.date_decongelation !== undefined ? (data.date_decongelation ? new Date(data.date_decongelation) : null) : existing.date_decongelation;

    const dlc = calculerDlcLaitMaternel(dateRecueil, congele, dateDecongel);

    const lm = await prisma.laitMaternel.update({
      where: { id },
      data: {
        date_recueil: dateRecueil,
        congele,
        date_decongelation: dateDecongel,
        ...(data.quantite_ml !== undefined ? { quantite_ml: data.quantite_ml } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
        ...(data.statut !== undefined ? { statut: data.statut } : {}),
        dlc,
      },
    });
    return { success: true as const, data: lm };
  } catch {
    return { success: false as const, error: "Erreur lors de la modification." };
  }
}

export async function decongelerLaitMaternel(id: string) {
  try {
    const lm = await prisma.laitMaternel.findUnique({ where: { id } });
    if (!lm) return { success: false as const, error: "Lait maternel introuvable." };
    if (!lm.congele) return { success: false as const, error: "Ce lait n'est pas congelé." };
    const now = new Date();
    const dlc = calculerDlcLaitMaternel(lm.date_recueil, true, now);
    const updated = await prisma.laitMaternel.update({
      where: { id },
      data: { date_decongelation: now, dlc },
    });
    return { success: true as const, data: updated };
  } catch {
    return { success: false as const, error: "Erreur lors de la décongélation." };
  }
}

export async function changerStatutLaitMaternel(id: string, statut: StatutLaitMaternel) {
  try {
    const updated = await prisma.laitMaternel.update({ where: { id }, data: { statut } });
    return { success: true as const, data: updated };
  } catch {
    return { success: false as const, error: "Erreur lors du changement de statut." };
  }
}

export async function supprimerLaitMaternel(id: string) {
  try {
    const usage = await prisma.biberon.count({ where: { lait_maternel_id: id } });
    if (usage > 0) {
      return { success: false as const, error: `Impossible de supprimer : ${usage} biberon(s) lié(s).` };
    }
    await prisma.laitMaternel.delete({ where: { id } });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la suppression." };
  }
}
