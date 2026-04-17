"use server";

import { prisma } from "@/lib/supabase/prisma";

export async function creerBiberon(data: {
  structure_id: string; enfant_id: string; type_lait: string; nom_lait?: string;
  numero_lot: string; date_peremption_lait?: string; date_ouverture_boite?: string;
  nombre_dosettes?: number; quantite_preparee_ml: number; preparateur_nom: string; professionnel_id: string;
  profil_id?: string; observations?: string;
  boite_lait_id?: string; lait_maternel_id?: string;
}) {
  try {
    if (!data.preparateur_nom) return { success: false as const, error: "Nom du préparateur obligatoire (émargement)." };

    let nomLait = data.nom_lait || null;
    let numeroLot = data.numero_lot;
    let datePeremption = data.date_peremption_lait ? new Date(data.date_peremption_lait) : null;
    let dateOuverture = data.date_ouverture_boite ? new Date(data.date_ouverture_boite) : null;

    // Si une boîte de lait est sélectionnée, on récupère ses infos pour la traçabilité
    if (data.boite_lait_id) {
      const boite = await prisma.boiteLait.findUnique({ where: { id: data.boite_lait_id } });
      if (!boite) return { success: false as const, error: "Boîte de lait introuvable." };
      if (!boite.actif) return { success: false as const, error: "Cette boîte de lait est désactivée." };
      nomLait = nomLait || boite.marque;
      numeroLot = boite.numero_lot;
      datePeremption = boite.dlc;
      dateOuverture = dateOuverture || boite.date_ouverture;
    }

    if (!data.lait_maternel_id && !numeroLot) {
      return { success: false as const, error: "Numéro de lot obligatoire (traçabilité)." };
    }

    // Si lait maternel, récupère ses infos
    if (data.lait_maternel_id) {
      const lm = await prisma.laitMaternel.findUnique({ where: { id: data.lait_maternel_id } });
      if (!lm) return { success: false as const, error: "Lait maternel introuvable." };
      if (lm.statut !== "DISPONIBLE") return { success: false as const, error: "Ce lait maternel n'est plus disponible." };
      numeroLot = `LM-${lm.id.slice(0, 8)}`;
      datePeremption = lm.dlc;
    }

    const now = new Date();
    const biberon = await prisma.biberon.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id,
        date: now,
        heure_preparation: now,
        type_lait: data.type_lait,
        nom_lait: nomLait,
        numero_lot: numeroLot,
        date_peremption_lait: datePeremption,
        date_ouverture_boite: dateOuverture,
        nombre_dosettes: data.nombre_dosettes ?? null,
        quantite_preparee_ml: data.quantite_preparee_ml,
        preparateur_nom: data.preparateur_nom,
        professionnel_id: data.professionnel_id,
        profil_id: data.profil_id || null,
        observations: data.observations || null,
        boite_lait_id: data.boite_lait_id || null,
        lait_maternel_id: data.lait_maternel_id || null,
      },
    });

    // Décrémente la quantité du lait maternel utilisé
    if (data.lait_maternel_id) {
      const lm = await prisma.laitMaternel.findUnique({ where: { id: data.lait_maternel_id } });
      if (lm) {
        const reste = (lm.quantite_restante_ml ?? lm.quantite_ml) - data.quantite_preparee_ml;
        await prisma.laitMaternel.update({
          where: { id: data.lait_maternel_id },
          data: {
            quantite_restante_ml: Math.max(0, reste),
            statut: reste <= 0 ? "UTILISE" : "DISPONIBLE",
          },
        });
      }
    }

    return { success: true as const, data: biberon };
  } catch {
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
