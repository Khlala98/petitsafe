"use server";

import { prisma } from "@/lib/supabase/prisma";

export interface AlerteItem {
  id: string;
  type: "dlc_depassee" | "dlc_proche" | "biberon_attente" | "lait_dlc" | "medicament_a_signer" | "lait_maternel_dlc" | "pai_present";
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
    const enfantsHref = `/dashboard/${structureId}/enfants`;

    const septJoursAvant = new Date(aujourdhuiDebut);
    septJoursAvant.setDate(septJoursAvant.getDate() - 7);

    const [
      receptionsExpirees,
      receptionsProches,
      biberonsEnAttente,
      biberonsAvecDLC,
      adminsNonSignees,
      laitsMaternelsDlc,
      paisActifs,
    ] = await Promise.all([
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
      // Médicaments administrés mais non encore signés (24h glissantes)
      prisma.administrationMedicament.findMany({
        where: {
          structure_id: structureId,
          signe: false,
          date_administration: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
        include: { enfant: { select: { id: true, prenom: true, nom: true } } },
        orderBy: { date_administration: "asc" },
      }),
      // Lait maternel : DLC dans 0-3 jours ou périmé, statut DISPONIBLE
      prisma.laitMaternel.findMany({
        where: {
          structure_id: structureId,
          statut: "DISPONIBLE",
          dlc: { lte: dansTroisJoursFin },
        },
        include: { enfant: { select: { id: true, prenom: true } } },
        orderBy: { dlc: "asc" },
      }),
      // Enfants présents (actifs) avec PAI actif
      prisma.pAI.findMany({
        where: {
          structure_id: structureId,
          actif: true,
          enfant: { actif: true },
        },
        include: { enfant: { select: { id: true, prenom: true, nom: true } } },
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

    // Alertes médicaments à signer
    for (const a of adminsNonSignees) {
      const minutes = Math.floor((now.getTime() - new Date(a.date_administration).getTime()) / 60000);
      const detail =
        minutes < 60
          ? `Administré il y a ${Math.max(0, minutes)} min — signature requise`
          : `Administré il y a ${Math.floor(minutes / 60)}h — signature requise`;
      alertes.push({
        id: `med-${a.id}`,
        type: "medicament_a_signer",
        niveau: minutes >= 120 ? "rouge" : "orange",
        titre: `Médicament ${a.enfant.prenom} ${a.enfant.nom}`,
        detail: `${a.nom_medicament} — ${detail}`,
        href: `${enfantsHref}/${a.enfant.id}`,
      });
    }

    // Alertes DLC lait maternel
    for (const lm of laitsMaternelsDlc) {
      const dlcDate = new Date(lm.dlc);
      const dlcDebut = new Date(dlcDate.getFullYear(), dlcDate.getMonth(), dlcDate.getDate());
      const diffJours = Math.round((dlcDebut.getTime() - aujourdhuiDebut.getTime()) / (1000 * 60 * 60 * 24));
      let detail: string;
      let niveau: "rouge" | "orange";
      if (diffJours < 0) {
        detail = `Lait maternel de ${lm.enfant.prenom} PÉRIMÉ — ne pas utiliser`;
        niveau = "rouge";
      } else if (diffJours === 0) {
        detail = `Lait maternel de ${lm.enfant.prenom} expire AUJOURD'HUI`;
        niveau = "rouge";
      } else if (diffJours === 1) {
        detail = `Lait maternel de ${lm.enfant.prenom} expire DEMAIN`;
        niveau = "rouge";
      } else {
        detail = `Lait maternel de ${lm.enfant.prenom} expire dans ${diffJours} jours`;
        niveau = "orange";
      }
      alertes.push({
        id: `lm-dlc-${lm.id}`,
        type: "lait_maternel_dlc",
        niveau,
        titre: `Lait maternel ${lm.enfant.prenom}`,
        detail,
        href: biberonHref,
      });
    }

    // Alertes PAI présents (information journalière)
    for (const pai of paisActifs) {
      alertes.push({
        id: `pai-${pai.id}`,
        type: "pai_present",
        niveau: "orange",
        titre: `PAI — ${pai.enfant.prenom} ${pai.enfant.nom}`,
        detail: `Enfant avec PAI actif — protocole et médicaments à connaître`,
        href: `${enfantsHref}/${pai.enfant.id}`,
      });
    }

    return { success: true as const, data: alertes };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des alertes." };
  }
}
