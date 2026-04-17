"use server";

import { prisma } from "@/lib/supabase/prisma";
import type { TypeBoiteLait } from "@prisma/client";

export interface BoiteLaitInput {
  marque: string;
  type: TypeBoiteLait;
  numero_lot: string;
  dlc: string;
  date_ouverture?: string;
  notes?: string;
}

export async function listerBoitesLait(structureId: string, opts?: { actifsSeulement?: boolean }) {
  try {
    const boites = await prisma.boiteLait.findMany({
      where: {
        structure_id: structureId,
        ...(opts?.actifsSeulement ? { actif: true } : {}),
      },
      orderBy: [{ actif: "desc" }, { marque: "asc" }, { dlc: "asc" }],
    });
    return { success: true as const, data: boites };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des boîtes." };
  }
}

export async function creerBoiteLait(structureId: string, data: BoiteLaitInput) {
  try {
    if (!data.marque?.trim()) return { success: false as const, error: "Marque obligatoire." };
    if (!data.numero_lot?.trim()) return { success: false as const, error: "Numéro de lot obligatoire." };
    if (!data.dlc) return { success: false as const, error: "DLC obligatoire." };

    const boite = await prisma.boiteLait.create({
      data: {
        structure_id: structureId,
        marque: data.marque.trim(),
        type: data.type,
        numero_lot: data.numero_lot.trim(),
        dlc: new Date(data.dlc),
        date_ouverture: data.date_ouverture ? new Date(data.date_ouverture) : null,
        notes: data.notes?.trim() || null,
      },
    });
    return { success: true as const, data: boite };
  } catch {
    return { success: false as const, error: "Erreur lors de la création de la boîte." };
  }
}

export async function modifierBoiteLait(boiteId: string, data: Partial<BoiteLaitInput> & { actif?: boolean }) {
  try {
    const boite = await prisma.boiteLait.update({
      where: { id: boiteId },
      data: {
        ...(data.marque !== undefined ? { marque: data.marque.trim() } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.numero_lot !== undefined ? { numero_lot: data.numero_lot.trim() } : {}),
        ...(data.dlc !== undefined ? { dlc: new Date(data.dlc) } : {}),
        ...(data.date_ouverture !== undefined ? { date_ouverture: data.date_ouverture ? new Date(data.date_ouverture) : null } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
        ...(data.actif !== undefined ? { actif: data.actif } : {}),
      },
    });
    return { success: true as const, data: boite };
  } catch {
    return { success: false as const, error: "Erreur lors de la modification." };
  }
}

export async function desactiverBoiteLait(boiteId: string) {
  try {
    await prisma.boiteLait.update({ where: { id: boiteId }, data: { actif: false } });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la désactivation." };
  }
}

export async function supprimerBoiteLait(boiteId: string) {
  try {
    const usage = await prisma.biberon.count({ where: { boite_lait_id: boiteId } });
    if (usage > 0) {
      return { success: false as const, error: `Impossible de supprimer : cette boîte est utilisée par ${usage} biberon(s). Désactivez-la à la place.` };
    }
    await prisma.boiteLait.delete({ where: { id: boiteId } });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la suppression." };
  }
}
