"use server";

import { prisma } from "@/lib/supabase/prisma";

// ═══ REPAS ═══

export async function enregistrerRepas(data: {
  structure_id: string; enfant_id: string; type_repas: string;
  entree?: string; entree_quantite?: string; plat?: string; plat_quantite?: string;
  dessert?: string; dessert_quantite?: string; observations?: string; professionnel_id: string;
}) {
  try {
    const repas = await prisma.repas.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id,
        date: new Date(),
        type_repas: data.type_repas as "PETIT_DEJ" | "DEJEUNER" | "GOUTER" | "DINER",
        entree: data.entree || null,
        entree_quantite: data.entree_quantite as "TOUT" | "BIEN" | "PEU" | "RIEN" | undefined,
        plat: data.plat || null,
        plat_quantite: data.plat_quantite as "TOUT" | "BIEN" | "PEU" | "RIEN" | undefined,
        dessert: data.dessert || null,
        dessert_quantite: data.dessert_quantite as "TOUT" | "BIEN" | "PEU" | "RIEN" | undefined,
        observations: data.observations || null,
        professionnel_id: data.professionnel_id,
      },
    });
    return { success: true as const, data: repas };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de l'enregistrement du repas." };
  }
}

// ═══ CHANGE ═══

export async function enregistrerChange(data: {
  structure_id: string; enfant_id: string; type_change: string;
  observations?: string; professionnel_id: string;
}) {
  try {
    const now = new Date();
    const change = await prisma.change.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id,
        date: now,
        heure: now,
        type_change: data.type_change as "MOUILLEE" | "SELLE" | "LES_DEUX",
        observations: data.observations || null,
        professionnel_id: data.professionnel_id,
      },
    });
    return { success: true as const, data: change };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de l'enregistrement du change." };
  }
}

// ═══ SIESTE ═══

export async function debuterSieste(data: {
  structure_id: string; enfant_id: string; professionnel_id: string;
}) {
  try {
    const now = new Date();
    const sieste = await prisma.sieste.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id,
        date: now,
        heure_debut: now,
        professionnel_id: data.professionnel_id,
      },
    });
    return { success: true as const, data: sieste };
  } catch (error) {
    return { success: false as const, error: "Erreur lors du début de sieste." };
  }
}

export async function finirSieste(data: {
  sieste_id: string; qualite?: string;
}) {
  try {
    const now = new Date();
    const sieste = await prisma.sieste.findUnique({ where: { id: data.sieste_id } });
    if (!sieste) return { success: false as const, error: "Sieste non trouvée." };

    const duree = Math.round((now.getTime() - sieste.heure_debut.getTime()) / 60000);

    const updated = await prisma.sieste.update({
      where: { id: data.sieste_id },
      data: {
        heure_fin: now,
        duree_minutes: duree,
        qualite: data.qualite as "CALME" | "AGITE" | "DIFFICILE" | "REVEILS" | undefined,
      },
    });
    return { success: true as const, data: updated };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de la fin de sieste." };
  }
}

export async function getSiesteEnCours(structureId: string, enfantId: string) {
  try {
    const sieste = await prisma.sieste.findFirst({
      where: { structure_id: structureId, enfant_id: enfantId, heure_fin: null },
      orderBy: { heure_debut: "desc" },
    });
    return { success: true as const, data: sieste };
  } catch {
    return { success: true as const, data: null };
  }
}

// ═══ TRANSMISSION ═══

export async function enregistrerTransmission(data: {
  structure_id: string; enfant_id?: string; contenu: string;
  type_transm: string; auteur: string;
}) {
  try {
    const transmission = await prisma.transmission.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id || null,
        date: new Date(),
        contenu: data.contenu,
        auteur: data.auteur,
        type_transm: data.type_transm as "GENERAL" | "ENFANT" | "EQUIPE",
      },
    });
    return { success: true as const, data: transmission };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de l'enregistrement." };
  }
}

// ═══ DONNÉES DU JOUR (pour vue groupe) ═══

export async function getSuiviDuJour(structureId: string) {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [repas, changes, siestes, biberons, transmissions] = await Promise.all([
      prisma.repas.findMany({ where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } }, select: { enfant_id: true, id: true } }),
      prisma.change.findMany({ where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } }, select: { enfant_id: true, id: true } }),
      prisma.sieste.findMany({ where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } }, select: { enfant_id: true, id: true } }),
      prisma.biberon.findMany({ where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } }, select: { enfant_id: true, id: true } }),
      prisma.transmission.findMany({ where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd }, enfant_id: { not: null } }, select: { enfant_id: true, id: true } }),
    ]);

    // Count per enfant
    const counts: Record<string, { biberons: number; repas: number; changes: number; siestes: number; transmissions: number }> = {};
    const add = (enfantId: string, field: string) => {
      if (!counts[enfantId]) counts[enfantId] = { biberons: 0, repas: 0, changes: 0, siestes: 0, transmissions: 0 };
      (counts[enfantId] as Record<string, number>)[field]++;
    };

    biberons.forEach((b) => add(b.enfant_id, "biberons"));
    repas.forEach((r) => add(r.enfant_id, "repas"));
    changes.forEach((c) => add(c.enfant_id, "changes"));
    siestes.forEach((s) => add(s.enfant_id, "siestes"));
    transmissions.forEach((t) => { if (t.enfant_id) add(t.enfant_id, "transmissions"); });

    return { success: true as const, data: counts };
  } catch (error) {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}
