"use server";

import { prisma } from "@/lib/supabase/prisma";

export interface AlerteItem {
  id: string;
  type: "dlc_depassee" | "dlc_proche" | "biberon_attente" | "lait_dlc";
  niveau: "rouge" | "orange";
  titre: string;
  detail: string;
  href: string;
}

export async function getAlertes(structureId: string) {
  try {
    const now = new Date();
    const aujourdhuiDebut = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dansTroisJoursFin = new Date(aujourdhuiDebut);
    dansTroisJoursFin.setDate(dansTroisJoursFin.getDate() + 3);
    dansTroisJoursFin.setHours(23, 59, 59, 999);

    const stockHref = `/dashboard/${structureId}/stock`;
    const biberonHref = `/dashboard/${structureId}/biberonnerie`;

    const septJoursAvant = new Date(aujourdhuiDebut);
    septJoursAvant.setDate(septJoursAvant.getDate() - 7);

    const [receptionsExpirees, receptionsProches, biberonsEnAttente, biberonsAvecDLC] = await Promise.all([
      // DLC dépassée (avant aujourd'hui à minuit) et toujours en stock
      prisma.receptionMarchandise.findMany({
        where: {
          structure_id: structureId,
          statut: "EN_STOCK",
          dlc: { lt: aujourdhuiDebut },
        },
        orderBy: { dlc: "asc" },
      }),
      // DLC dans les 3 prochains jours
      prisma.receptionMarchandise.findMany({
        where: {
          structure_id: structureId,
          statut: "EN_STOCK",
          dlc: { gte: aujourdhuiDebut, lte: dansTroisJoursFin },
        },
        orderBy: { dlc: "asc" },
      }),
      // Biberons préparés depuis plus de 30 minutes et non bus
      prisma.biberon.findMany({
        where: {
          structure_id: structureId,
          quantite_bue_ml: null,
          heure_preparation: { lte: new Date(now.getTime() - 30 * 60 * 1000) },
        },
        include: { enfant: { select: { prenom: true } } },
        orderBy: { heure_preparation: "asc" },
      }),
      // Biberons récents avec DLC lait renseignée (pour alertes péremption lait)
      prisma.biberon.findMany({
        where: {
          structure_id: structureId,
          date_peremption_lait: { not: null },
          date: { gte: septJoursAvant },
        },
        include: { enfant: { select: { id: true, prenom: true } } },
        orderBy: { date: "desc" },
      }),
    ]);

    const alertes: AlerteItem[] = [];

    for (const r of receptionsExpirees) {
      const joursDepasses = Math.floor(
        (aujourdhuiDebut.getTime() - new Date(r.dlc).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
      );
      alertes.push({
        id: `dlc-exp-${r.id}`,
        type: "dlc_depassee",
        niveau: "rouge",
        titre: r.nom_produit,
        detail: `DLC dépassée depuis ${joursDepasses} jour${joursDepasses > 1 ? "s" : ""} · Lot ${r.numero_lot}`,
        href: stockHref,
      });
    }

    for (const r of receptionsProches) {
      const joursRestants = Math.ceil(
        (new Date(r.dlc).setHours(0, 0, 0, 0) - aujourdhuiDebut.getTime()) / (1000 * 60 * 60 * 24)
      );
      const detail = joursRestants === 0
        ? `DLC aujourd'hui · Lot ${r.numero_lot}`
        : `DLC dans ${joursRestants} jour${joursRestants > 1 ? "s" : ""} · Lot ${r.numero_lot}`;
      alertes.push({
        id: `dlc-proche-${r.id}`,
        type: "dlc_proche",
        niveau: "orange",
        titre: r.nom_produit,
        detail,
        href: stockHref,
      });
    }

    for (const b of biberonsEnAttente) {
      const minutesEcoulees = Math.floor((now.getTime() - new Date(b.heure_preparation).getTime()) / 60000);
      alertes.push({
        id: `biberon-${b.id}`,
        type: "biberon_attente",
        niveau: "orange",
        titre: `Biberon ${b.enfant.prenom}`,
        detail: `En attente depuis ${minutesEcoulees} min · ${b.quantite_preparee_ml} ml préparés`,
        href: biberonHref,
      });
    }

    // Alertes DLC lait — un seul alert par enfant (biberon le plus récent)
    const enfantsDLC = new Map<string, { prenom: string; dlc: Date; biberonId: string }>();
    for (const b of biberonsAvecDLC) {
      if (!b.date_peremption_lait) continue;
      if (!enfantsDLC.has(b.enfant.id)) {
        enfantsDLC.set(b.enfant.id, { prenom: b.enfant.prenom, dlc: b.date_peremption_lait, biberonId: b.id });
      }
    }
    enfantsDLC.forEach((info, enfantId) => {
      const dlcDate = new Date(info.dlc);
      const dlcDebut = new Date(dlcDate.getFullYear(), dlcDate.getMonth(), dlcDate.getDate());
      const diffJours = Math.round((dlcDebut.getTime() - aujourdhuiDebut.getTime()) / (1000 * 60 * 60 * 24));

      if (diffJours > 3) return;

      let detail: string;
      let niveau: "rouge" | "orange";

      if (diffJours < 0) {
        detail = `Le lait de ${info.prenom} est périmé — NE PAS UTILISER`;
        niveau = "rouge";
      } else if (diffJours === 0) {
        detail = `Le lait de ${info.prenom} expire AUJOURD'HUI`;
        niveau = "rouge";
      } else if (diffJours === 1) {
        detail = `Le lait de ${info.prenom} expire DEMAIN`;
        niveau = "rouge";
      } else {
        detail = `Le lait de ${info.prenom} expire dans ${diffJours} jours — pensez à demander aux parents d'en ramener`;
        niveau = "orange";
      }

      alertes.push({
        id: `lait-dlc-${enfantId}`,
        type: "lait_dlc",
        niveau,
        titre: `Lait ${info.prenom}`,
        detail,
        href: biberonHref,
      });
    });

    return { success: true as const, data: alertes };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des alertes." };
  }
}
