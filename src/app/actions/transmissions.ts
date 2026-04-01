"use server";

import { prisma } from "@/lib/supabase/prisma";
import { transmissionSchema } from "@/lib/schemas/transmission";

export async function getTransmissionsDuJour(structureId: string, date?: string) {
  try {
    const targetDate = date ? new Date(date) : new Date();
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const transmissions = await prisma.transmission.findMany({
      where: { structure_id: structureId, date: { gte: dayStart, lte: dayEnd } },
      include: { enfant: { select: { id: true, prenom: true, nom: true } } },
      orderBy: { date: "desc" },
    });
    return { success: true as const, data: transmissions };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des transmissions." };
  }
}

export async function creerTransmission(data: {
  structure_id: string;
  enfant_id?: string;
  contenu: string;
  type_transm: string;
  auteur: string;
}) {
  try {
    const parsed = transmissionSchema.safeParse(data);
    if (!parsed.success) return { success: false as const, error: "Données invalides." };

    const transmission = await prisma.transmission.create({
      data: {
        structure_id: parsed.data.structure_id,
        enfant_id: parsed.data.enfant_id || null,
        date: new Date(),
        contenu: parsed.data.contenu,
        auteur: parsed.data.auteur,
        type_transm: parsed.data.type_transm as "GENERAL" | "ENFANT" | "EQUIPE",
      },
      include: { enfant: { select: { id: true, prenom: true, nom: true } } },
    });
    return { success: true as const, data: transmission };
  } catch {
    return { success: false as const, error: "Erreur lors de l'enregistrement." };
  }
}

export async function getTransmissionsEnfant(structureId: string, enfantId: string, limit = 20) {
  try {
    const transmissions = await prisma.transmission.findMany({
      where: { structure_id: structureId, enfant_id: enfantId },
      orderBy: { date: "desc" },
      take: limit,
    });
    return { success: true as const, data: transmissions };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}
