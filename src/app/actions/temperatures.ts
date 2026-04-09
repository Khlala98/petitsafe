"use server";

import { prisma } from "@/lib/supabase/prisma";
import { verifierAdmin } from "@/lib/permissions";
import { validerPlageTemperature } from "@/lib/business-logic";

export async function getEquipements(structureId: string) {
  try {
    const equipements = await prisma.equipement.findMany({
      where: { structure_id: structureId, actif: true },
      orderBy: { nom: "asc" },
    });
    return { success: true as const, data: equipements };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}

export async function creerEquipement(data: {
  structure_id: string; nom: string; type: "REFRIGERATEUR" | "CONGELATEUR"; temperature_max: number;
}) {
  try {
    const equipement = await prisma.equipement.create({ data });
    return { success: true as const, data: equipement };
  } catch {
    return { success: false as const, error: "Erreur lors de la création." };
  }
}

export async function supprimerEquipement(equipementId: string, profilId?: string) {
  try {
    if (profilId && !(await verifierAdmin(profilId))) {
      return { success: false as const, error: "Action réservée aux administrateurs." };
    }
    await prisma.equipement.delete({ where: { id: equipementId } });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la suppression." };
  }
}

export async function supprimerReleve(releveId: string, profilId?: string) {
  try {
    if (profilId && !(await verifierAdmin(profilId))) {
      return { success: false as const, error: "Action réservée aux administrateurs." };
    }
    await prisma.releveTemperature.delete({ where: { id: releveId } });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la suppression." };
  }
}

export async function getReleves(structureId: string, date: string) {
  try {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);

    const releves = await prisma.releveTemperature.findMany({
      where: { structure_id: structureId, date: { gte: start, lte: end } },
      include: { equipement: true },
      orderBy: { heure: "desc" },
    });
    return { success: true as const, data: releves };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}

export async function creerReleve(data: {
  structure_id: string; equipement_id: string; temperature: number;
  conforme: boolean; action_corrective?: string; professionnel_id: string;
  profil_id?: string; heure?: string; plage_confirmee?: boolean;
}) {
  try {
    if (!data.conforme && !data.action_corrective) {
      return { success: false as const, error: "Action corrective obligatoire si non conforme." };
    }

    // Validation côté serveur de la plage de température
    const equipement = await prisma.equipement.findUnique({ where: { id: data.equipement_id } });
    if (equipement) {
      const plageErreur = validerPlageTemperature(data.temperature, equipement.type);
      if (plageErreur && !data.plage_confirmee) {
        return { success: false as const, error: plageErreur };
      }
    }

    const now = new Date();
    const heure = data.heure ? new Date(data.heure) : now;

    const releve = await prisma.releveTemperature.create({
      data: {
        structure_id: data.structure_id,
        equipement_id: data.equipement_id,
        date: now,
        heure,
        temperature: data.temperature,
        conforme: data.conforme,
        action_corrective: data.action_corrective || null,
        professionnel_id: data.professionnel_id,
        profil_id: data.profil_id || null,
      },
    });
    return { success: true as const, data: releve };
  } catch {
    return { success: false as const, error: "Erreur lors de l'enregistrement." };
  }
}

export async function getRelevesPlat(structureId: string, date: string) {
  try {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);

    const releves = await prisma.relevePlat.findMany({
      where: { structure_id: structureId, date: { gte: start, lte: end } },
      orderBy: { heure_apres: "desc" },
    });
    return { success: true as const, data: releves };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}

export async function creerRelevePlat(data: {
  structure_id: string; nom_plat: string; type_plat: "CHAUD" | "FROID";
  temperature_avant: number; heure_avant: string;
  temperature_apres: number; heure_apres: string; conforme: boolean;
  action_corrective?: string; professionnel_id: string; profil_id?: string;
}) {
  try {
    if (!data.conforme && !data.action_corrective) {
      return { success: false as const, error: "Action corrective obligatoire si non conforme." };
    }

    const releve = await prisma.relevePlat.create({
      data: {
        structure_id: data.structure_id,
        date: new Date(),
        nom_plat: data.nom_plat,
        type_plat: data.type_plat,
        temperature_avant: data.temperature_avant,
        heure_avant: new Date(data.heure_avant),
        temperature_apres: data.temperature_apres,
        heure_apres: new Date(data.heure_apres),
        conforme: data.conforme,
        action_corrective: data.action_corrective || null,
        professionnel_id: data.professionnel_id,
        profil_id: data.profil_id || null,
      },
    });
    return { success: true as const, data: releve };
  } catch {
    return { success: false as const, error: "Erreur lors de l'enregistrement." };
  }
}

export async function getRelevesHistorique(structureId: string, equipementId: string, jours: number) {
  try {
    const start = new Date(); start.setDate(start.getDate() - jours); start.setHours(0, 0, 0, 0);

    const releves = await prisma.releveTemperature.findMany({
      where: { structure_id: structureId, equipement_id: equipementId, date: { gte: start } },
      orderBy: { date: "asc" },
      select: { date: true, heure: true, temperature: true, conforme: true },
    });
    return { success: true as const, data: releves };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}
