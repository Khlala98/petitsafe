"use server";

import { prisma } from "@/lib/supabase/prisma";
import type { ActionResult } from "@/types";

export interface ExportDDPPData {
  structure: { nom: string; type: string; adresse: string | null; numero_agrement: string | null };
  periode: { debut: string; fin: string };
  dateGeneration: string;
  releves: {
    id: string; date: string; heure: string; equipement_nom: string; equipement_type: string;
    temperature: number; conforme: boolean; action_corrective: string | null;
  }[];
  plats: {
    id: string; date: string; nom_plat: string; temperature_avant: number;
    temperature_apres: number; conforme: boolean; action_corrective: string | null;
  }[];
  receptions: {
    id: string; date: string; fournisseur: string; nom_produit: string;
    numero_lot: string; dlc: string; temperature_reception: number | null;
    conforme: boolean; statut: string;
  }[];
  nettoyage: {
    zone: string; tache: string; date: string; professionnel_nom: string;
  }[];
  biberons: {
    id: string; date: string; enfant_prenom: string; type_lait: string;
    numero_lot: string; preparateur_nom: string; conforme_anses: boolean;
  }[];
  alertesDlc: {
    nom_produit: string; dlc: string; statut: string; fournisseur: string;
  }[];
  produitsJetes: {
    nom_produit: string; statut: string; motif_destruction: string | null;
    fournisseur: string; numero_lot: string;
  }[];
}

export async function getExportDDPPData(
  structureId: string, debut: string, fin: string
): Promise<ActionResult<ExportDDPPData>> {
  try {
    const dateDebut = new Date(debut);
    dateDebut.setHours(0, 0, 0, 0);
    const dateFin = new Date(fin);
    dateFin.setHours(23, 59, 59, 999);

    const [structure, releves, plats, receptions, validations, biberons] = await Promise.all([
      prisma.structure.findUnique({
        where: { id: structureId },
        select: { nom: true, type: true, adresse: true, numero_agrement: true },
      }),
      prisma.releveTemperature.findMany({
        where: { structure_id: structureId, date: { gte: dateDebut, lte: dateFin } },
        include: { equipement: { select: { nom: true, type: true } } },
        orderBy: { date: "asc" },
      }),
      prisma.relevePlat.findMany({
        where: { structure_id: structureId, date: { gte: dateDebut, lte: dateFin } },
        orderBy: { date: "asc" },
      }),
      prisma.receptionMarchandise.findMany({
        where: { structure_id: structureId, date: { gte: dateDebut, lte: dateFin } },
        orderBy: { date: "asc" },
      }),
      prisma.validationNettoyage.findMany({
        where: {
          date: { gte: dateDebut, lte: dateFin },
          tache: { zone: { structure_id: structureId } },
        },
        include: { tache: { include: { zone: true } } },
        orderBy: { date: "asc" },
      }),
      prisma.biberon.findMany({
        where: { structure_id: structureId, date: { gte: dateDebut, lte: dateFin } },
        include: { enfant: { select: { prenom: true } } },
        orderBy: { date: "asc" },
      }),
    ]);

    if (!structure) return { success: false, error: "Structure introuvable." };

    const alertesDlc = receptions.filter(
      (r) => r.statut === "EN_STOCK" && new Date(r.dlc) <= new Date()
    );
    const produitsJetes = receptions.filter(
      (r) => r.statut === "JETE" || r.statut === "RAPPELE"
    );

    return {
      success: true,
      data: {
        structure: {
          nom: structure.nom,
          type: structure.type,
          adresse: structure.adresse,
          numero_agrement: structure.numero_agrement,
        },
        periode: { debut, fin },
        dateGeneration: new Date().toISOString(),
        releves: releves.map((r) => ({
          id: r.id,
          date: r.date.toISOString(),
          heure: r.heure.toISOString(),
          equipement_nom: r.equipement.nom,
          equipement_type: r.equipement.type,
          temperature: r.temperature,
          conforme: r.conforme,
          action_corrective: r.action_corrective,
        })),
        plats: plats.map((p) => ({
          id: p.id,
          date: p.date.toISOString(),
          nom_plat: p.nom_plat,
          temperature_avant: p.temperature_avant,
          temperature_apres: p.temperature_apres,
          conforme: p.conforme,
          action_corrective: p.action_corrective,
        })),
        receptions: receptions.map((r) => ({
          id: r.id,
          date: r.date.toISOString(),
          fournisseur: r.fournisseur,
          nom_produit: r.nom_produit,
          numero_lot: r.numero_lot,
          dlc: r.dlc.toISOString(),
          temperature_reception: r.temperature_reception,
          conforme: r.conforme,
          statut: r.statut,
        })),
        nettoyage: validations.map((v) => ({
          zone: v.tache.zone.nom,
          tache: v.tache.nom,
          date: v.date.toISOString(),
          professionnel_nom: v.professionnel_nom,
        })),
        biberons: biberons.map((b) => ({
          id: b.id,
          date: b.date.toISOString(),
          enfant_prenom: b.enfant.prenom,
          type_lait: b.type_lait,
          numero_lot: b.numero_lot,
          preparateur_nom: b.preparateur_nom,
          conforme_anses: b.conforme_anses,
        })),
        alertesDlc: alertesDlc.map((r) => ({
          nom_produit: r.nom_produit,
          dlc: r.dlc.toISOString(),
          statut: r.statut,
          fournisseur: r.fournisseur,
        })),
        produitsJetes: produitsJetes.map((r) => ({
          nom_produit: r.nom_produit,
          statut: r.statut,
          motif_destruction: r.motif_destruction,
          fournisseur: r.fournisseur,
          numero_lot: r.numero_lot,
        })),
      },
    };
  } catch {
    return { success: false, error: "Erreur lors de la récupération des données." };
  }
}

export interface ExportPMIData {
  structure: { nom: string; type: string };
  periode: { debut: string; fin: string };
  dateGeneration: string;
  biberons: {
    date: string; enfant_prenom: string; type_lait: string;
    conforme_anses: boolean; numero_lot: string; preparateur_nom: string;
  }[];
  repas: {
    date: string; enfant_prenom: string; type_repas: string;
    entree: string | null; plat: string | null; dessert: string | null;
  }[];
  siestes: {
    date: string; enfant_prenom: string; duree_minutes: number | null;
    qualite: string | null;
  }[];
  transmissions: {
    date: string; contenu: string; auteur: string;
    enfant_prenom: string | null;
  }[];
  protocoles: {
    titre: string; categorie: string; version: number;
  }[];
}

export async function getExportPMIData(
  structureId: string, debut: string, fin: string
): Promise<ActionResult<ExportPMIData>> {
  try {
    const dateDebut = new Date(debut);
    dateDebut.setHours(0, 0, 0, 0);
    const dateFin = new Date(fin);
    dateFin.setHours(23, 59, 59, 999);

    const [structure, biberons, repas, siestes, transmissions, protocoles] = await Promise.all([
      prisma.structure.findUnique({
        where: { id: structureId },
        select: { nom: true, type: true },
      }),
      prisma.biberon.findMany({
        where: { structure_id: structureId, date: { gte: dateDebut, lte: dateFin } },
        include: { enfant: { select: { prenom: true } } },
        orderBy: { date: "asc" },
      }),
      prisma.repas.findMany({
        where: { structure_id: structureId, date: { gte: dateDebut, lte: dateFin } },
        include: { enfant: { select: { prenom: true } } },
        orderBy: { date: "asc" },
      }),
      prisma.sieste.findMany({
        where: { structure_id: structureId, date: { gte: dateDebut, lte: dateFin } },
        include: { enfant: { select: { prenom: true } } },
        orderBy: { date: "asc" },
      }),
      prisma.transmission.findMany({
        where: { structure_id: structureId, date: { gte: dateDebut, lte: dateFin } },
        include: { enfant: { select: { prenom: true } } },
        orderBy: { date: "asc" },
      }),
      prisma.protocole.findMany({
        where: { structure_id: structureId, actif: true },
        select: { titre: true, categorie: true, version: true },
      }),
    ]);

    if (!structure) return { success: false, error: "Structure introuvable." };

    return {
      success: true,
      data: {
        structure: { nom: structure.nom, type: structure.type },
        periode: { debut, fin },
        dateGeneration: new Date().toISOString(),
        biberons: biberons.map((b) => ({
          date: b.date.toISOString(),
          enfant_prenom: b.enfant.prenom,
          type_lait: b.type_lait,
          conforme_anses: b.conforme_anses,
          numero_lot: b.numero_lot,
          preparateur_nom: b.preparateur_nom,
        })),
        repas: repas.map((r) => ({
          date: r.date.toISOString(),
          enfant_prenom: r.enfant.prenom,
          type_repas: r.type_repas,
          entree: r.entree,
          plat: r.plat,
          dessert: r.dessert,
        })),
        siestes: siestes.map((s) => ({
          date: s.date.toISOString(),
          enfant_prenom: s.enfant.prenom,
          duree_minutes: s.duree_minutes,
          qualite: s.qualite,
        })),
        transmissions: transmissions.map((t) => ({
          date: t.date.toISOString(),
          contenu: t.contenu,
          auteur: t.auteur,
          enfant_prenom: t.enfant?.prenom ?? null,
        })),
        protocoles: protocoles.map((p) => ({
          titre: p.titre,
          categorie: p.categorie,
          version: p.version,
        })),
      },
    };
  } catch {
    return { success: false, error: "Erreur lors de la récupération des données PMI." };
  }
}

export async function sauvegarderExport(data: {
  structure_id: string;
  type_export: "DDPP" | "PMI" | "INTERNE";
  periode_debut: string;
  periode_fin: string;
  genere_par: string;
  url: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const exportPdf = await prisma.exportPDF.create({
      data: {
        structure_id: data.structure_id,
        type_export: data.type_export,
        periode_debut: new Date(data.periode_debut),
        periode_fin: new Date(data.periode_fin),
        genere_par: data.genere_par,
        url: data.url,
      },
    });
    return { success: true, data: { id: exportPdf.id } };
  } catch {
    return { success: false, error: "Erreur lors de la sauvegarde de l'export." };
  }
}

export async function getHistoriqueExports(
  structureId: string
): Promise<ActionResult<{
  id: string; type_export: string; periode_debut: string;
  periode_fin: string; genere_par: string; url: string; created_at: string;
}[]>> {
  try {
    const exports = await prisma.exportPDF.findMany({
      where: { structure_id: structureId },
      orderBy: { created_at: "desc" },
      take: 50,
    });
    return {
      success: true,
      data: exports.map((e) => ({
        id: e.id,
        type_export: e.type_export,
        periode_debut: e.periode_debut.toISOString(),
        periode_fin: e.periode_fin.toISOString(),
        genere_par: e.genere_par,
        url: e.url,
        created_at: e.created_at.toISOString(),
      })),
    };
  } catch {
    return { success: false, error: "Erreur lors du chargement de l'historique." };
  }
}
