"use server";

import { prisma } from "@/lib/supabase/prisma";
import { getNettoyageKpi } from "@/app/actions/nettoyage";

export interface AlerteLaitDashboard {
  enfantPrenom: string;
  joursRestants: number;
  niveau: "rouge" | "orange";
  message: string;
}

export interface DashboardData {
  enfantsCount: number;
  nettoyage: { fait: number; total: number; pct: number } | null;
  prochainesDlc: { id: string; nom_produit: string; dlc: string; joursRestants: number }[];
  alertesLait: AlerteLaitDashboard[];
  biberonsEnAttente: { count: number; plusAncienPrep: string | null };
  temperatures: {
    relevesAujourdhui: number;
    dernier: { temperature: number; equipement: string; conforme: boolean; heure: string } | null;
  };
  activiteRecente: { heure: string; description: string; module: string }[];
}

export async function getDashboardData(
  structureId: string,
  modulesActifs: string[]
): Promise<{ success: true; data: DashboardData } | { success: false; error: string }> {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const isActif = (m: string) => modulesActifs.includes(m);

    // 1. Enfants
    const enfantsCount = await prisma.enfant.count({
      where: { structure_id: structureId, actif: true },
    });

    // 2. Nettoyage
    let nettoyage: DashboardData["nettoyage"] = null;
    if (isActif("nettoyage")) {
      const res = await getNettoyageKpi(structureId);
      if (res.success && res.data) nettoyage = res.data;
    }

    // 3. Prochaines DLC (7 jours)
    const prochainesDlc: DashboardData["prochainesDlc"] = [];
    if (isActif("tracabilite") || isActif("stocks")) {
      const dans7jours = new Date(); dans7jours.setDate(dans7jours.getDate() + 7);
      const produits = await prisma.receptionMarchandise.findMany({
        where: {
          structure_id: structureId,
          statut: "EN_STOCK",
          dlc: { lte: dans7jours },
        },
        orderBy: { dlc: "asc" },
        take: 3,
        select: { id: true, nom_produit: true, dlc: true },
      });
      for (const p of produits) {
        const diffMs = new Date(p.dlc).getTime() - todayStart.getTime();
        const joursRestants = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        prochainesDlc.push({
          id: p.id,
          nom_produit: p.nom_produit,
          dlc: p.dlc.toISOString(),
          joursRestants,
        });
      }
    }

    // 3b. Alertes DLC lait (biberons)
    const alertesLait: AlerteLaitDashboard[] = [];
    if (isActif("biberonnerie")) {
      const septJoursAvant = new Date(todayStart);
      septJoursAvant.setDate(septJoursAvant.getDate() - 7);

      const biberonsAvecDLC = await prisma.biberon.findMany({
        where: {
          structure_id: structureId,
          date_peremption_lait: { not: null },
          date: { gte: septJoursAvant },
        },
        include: { enfant: { select: { id: true, prenom: true } } },
        orderBy: { date: "desc" },
      });

      const enfantsDLC = new Map<string, { prenom: string; dlc: Date }>();
      for (const b of biberonsAvecDLC) {
        if (!b.date_peremption_lait) continue;
        if (!enfantsDLC.has(b.enfant.id)) {
          enfantsDLC.set(b.enfant.id, { prenom: b.enfant.prenom, dlc: b.date_peremption_lait });
        }
      }
      enfantsDLC.forEach((info) => {
        const dlcDebut = new Date(info.dlc.getFullYear(), info.dlc.getMonth(), info.dlc.getDate());
        const diffJours = Math.round((dlcDebut.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
        if (diffJours > 3) return;

        let message: string;
        let niveau: "rouge" | "orange";
        if (diffJours < 0) { message = `Lait périmé — NE PAS UTILISER`; niveau = "rouge"; }
        else if (diffJours <= 1) { message = diffJours === 0 ? "Expire aujourd'hui" : "Expire demain"; niveau = "rouge"; }
        else { message = `Expire dans ${diffJours} jours`; niveau = "orange"; }

        alertesLait.push({ enfantPrenom: info.prenom, joursRestants: diffJours, niveau, message });
      });
    }

    // 4. Biberons en attente (préparés, non servis)
    let biberonsEnAttente: DashboardData["biberonsEnAttente"] = { count: 0, plusAncienPrep: null };
    if (isActif("biberonnerie")) {
      const enAttente = await prisma.biberon.findMany({
        where: {
          structure_id: structureId,
          date: { gte: todayStart, lte: todayEnd },
          heure_service: null,
        },
        orderBy: { heure_preparation: "asc" },
        select: { heure_preparation: true },
      });
      biberonsEnAttente = {
        count: enAttente.length,
        plusAncienPrep: enAttente.length > 0 ? enAttente[0].heure_preparation.toISOString() : null,
      };
    }

    // 5. Températures du jour
    let temperatures: DashboardData["temperatures"] = { relevesAujourdhui: 0, dernier: null };
    if (isActif("temperatures")) {
      const [count, dernier] = await Promise.all([
        prisma.releveTemperature.count({
          where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } },
        }),
        prisma.releveTemperature.findFirst({
          where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } },
          orderBy: { heure: "desc" },
          include: { equipement: { select: { nom: true } } },
        }),
      ]);
      temperatures = {
        relevesAujourdhui: count,
        dernier: dernier
          ? { temperature: dernier.temperature, equipement: dernier.equipement.nom, conforme: dernier.conforme, heure: dernier.heure.toISOString() }
          : null,
      };
    }

    // 6. Activité récente (transmissions + derniers relevés)
    const activiteRecente: DashboardData["activiteRecente"] = [];

    const transmissions = await prisma.transmission.findMany({
      where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } },
      orderBy: { date: "desc" },
      take: 3,
      select: { contenu: true, auteur: true, date: true },
    });
    for (const t of transmissions) {
      activiteRecente.push({
        heure: t.date.toISOString(),
        description: `${t.auteur} : ${Array.from(t.contenu).length > 80 ? Array.from(t.contenu).slice(0, 80).join("") + "..." : t.contenu}`,
        module: "transmissions",
      });
    }

    if (isActif("nettoyage")) {
      const validations = await prisma.validationNettoyage.findMany({
        where: { date: { gte: todayStart, lte: todayEnd }, tache: { zone: { structure_id: structureId } } },
        orderBy: { date: "desc" },
        take: 2,
        include: { tache: { select: { nom: true } } },
      });
      for (const v of validations) {
        activiteRecente.push({
          heure: v.date.toISOString(),
          description: `Nettoyage validé : ${v.tache.nom}`,
          module: "nettoyage",
        });
      }
    }

    if (isActif("biberonnerie")) {
      const bibs = await prisma.biberon.findMany({
        where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } },
        orderBy: { heure_preparation: "desc" },
        take: 2,
        include: { enfant: { select: { prenom: true } } },
      });
      for (const b of bibs) {
        activiteRecente.push({
          heure: b.heure_preparation.toISOString(),
          description: `Biberon préparé pour ${b.enfant.prenom} (${b.quantite_preparee_ml}ml)`,
          module: "biberonnerie",
        });
      }
    }

    // Trier par heure décroissante et limiter
    activiteRecente.sort((a, b) => new Date(b.heure).getTime() - new Date(a.heure).getTime());
    activiteRecente.splice(8);

    return {
      success: true,
      data: { enfantsCount, nettoyage, prochainesDlc, alertesLait, biberonsEnAttente, temperatures, activiteRecente },
    };
  } catch {
    return { success: false, error: "Erreur lors du chargement du tableau de bord." };
  }
}
