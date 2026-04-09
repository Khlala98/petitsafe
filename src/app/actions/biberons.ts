"use server";

import { prisma } from "@/lib/supabase/prisma";

export async function creerBiberon(data: {
  structure_id: string; enfant_id: string; type_lait: string; nom_lait?: string;
  numero_lot: string; date_peremption_lait?: string; date_ouverture_boite?: string;
  nombre_dosettes?: number; quantite_preparee_ml: number; preparateur_nom: string; professionnel_id: string;
  profil_id?: string; observations?: string;
}) {
  try {
    if (!data.numero_lot) return { success: false as const, error: "Numéro de lot obligatoire (traçabilité)." };
    if (!data.preparateur_nom) return { success: false as const, error: "Nom du préparateur obligatoire (émargement)." };

    const now = new Date();
    const biberon = await prisma.biberon.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id,
        date: now,
        heure_preparation: now,
        type_lait: data.type_lait,
        nom_lait: data.nom_lait || null,
        numero_lot: data.numero_lot,
        date_peremption_lait: data.date_peremption_lait ? new Date(data.date_peremption_lait) : null,
        date_ouverture_boite: data.date_ouverture_boite ? new Date(data.date_ouverture_boite) : null,
        nombre_dosettes: data.nombre_dosettes ?? null,
        quantite_preparee_ml: data.quantite_preparee_ml,
        preparateur_nom: data.preparateur_nom,
        professionnel_id: data.professionnel_id,
        profil_id: data.profil_id || null,
        observations: data.observations || null,
      },
    });
    return { success: true as const, data: biberon };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de la création du biberon." };
  }
}

export async function marquerServi(biberonId: string, quantiteBueMl?: number) {
  try {
    const biberon = await prisma.biberon.update({
      where: { id: biberonId },
      data: { heure_service: new Date(), quantite_bue_ml: quantiteBueMl ?? null },
    });
    return { success: true as const, data: biberon };
  } catch {
    return { success: false as const, error: "Erreur lors du marquage." };
  }
}

export async function marquerNettoye(biberonId: string) {
  try {
    const biberon = await prisma.biberon.update({
      where: { id: biberonId },
      data: { nettoyage_effectue: true, heure_nettoyage: new Date() },
    });
    return { success: true as const, data: biberon };
  } catch {
    return { success: false as const, error: "Erreur lors du marquage nettoyage." };
  }
}

export async function getBiberonsDuJour(structureId: string) {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const biberons = await prisma.biberon.findMany({
      where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } },
      include: { enfant: { include: { allergies: true } } },
      orderBy: { heure_preparation: "asc" },
    });
    return { success: true as const, data: biberons };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}
