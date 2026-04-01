"use server";

import { prisma } from "@/lib/supabase/prisma";

// ═══ RÉCEPTIONS ═══

export async function getReceptions(structureId: string) {
  try {
    const receptions = await prisma.receptionMarchandise.findMany({
      where: { structure_id: structureId },
      orderBy: { date: "desc" },
      take: 50,
    });
    return { success: true as const, data: receptions };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}

export async function creerReception(data: {
  structure_id: string; nom_produit: string; fournisseur: string; numero_lot: string;
  dlc: string; temperature_reception?: number; emballage_conforme: boolean;
  conforme: boolean; motif_non_conformite?: string; professionnel_id: string;
}) {
  try {
    if (!data.conforme && !data.motif_non_conformite) {
      return { success: false as const, error: "Motif de non-conformité obligatoire." };
    }
    const reception = await prisma.receptionMarchandise.create({
      data: {
        structure_id: data.structure_id, date: new Date(), nom_produit: data.nom_produit,
        fournisseur: data.fournisseur, numero_lot: data.numero_lot,
        dlc: new Date(data.dlc), temperature_reception: data.temperature_reception ?? null,
        emballage_conforme: data.emballage_conforme, conforme: data.conforme,
        motif_non_conformite: data.motif_non_conformite || null,
        professionnel_id: data.professionnel_id,
      },
    });
    return { success: true as const, data: reception };
  } catch {
    return { success: false as const, error: "Erreur lors de l'enregistrement." };
  }
}

export async function marquerProduit(receptionId: string, statut: "UTILISE" | "JETE", motif?: string) {
  try {
    await prisma.receptionMarchandise.update({
      where: { id: receptionId },
      data: { statut, motif_destruction: statut === "JETE" ? motif : null },
    });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la mise à jour." };
  }
}

export async function getFournisseurs(structureId: string) {
  try {
    const result = await prisma.receptionMarchandise.findMany({
      where: { structure_id: structureId },
      select: { fournisseur: true },
      distinct: ["fournisseur"],
      orderBy: { fournisseur: "asc" },
    });
    return { success: true as const, data: result.map((r) => r.fournisseur) };
  } catch {
    return { success: true as const, data: [] };
  }
}

// ═══ STOCKS CONSOMMABLES ═══

export async function getStocks(structureId: string) {
  try {
    const stocks = await prisma.stock.findMany({
      where: { structure_id: structureId },
      orderBy: { produit_nom: "asc" },
    });
    return { success: true as const, data: stocks };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}

export async function creerStock(data: {
  structure_id: string; categorie: string; produit_nom: string;
  quantite: number; unite: string; seuil_alerte: number; maj_par: string;
}) {
  try {
    const stock = await prisma.stock.create({
      data: {
        structure_id: data.structure_id,
        categorie: data.categorie as "COUCHES" | "ENTRETIEN" | "LAIT" | "COMPOTES" | "AUTRE",
        produit_nom: data.produit_nom, quantite: data.quantite,
        unite: data.unite, seuil_alerte: data.seuil_alerte,
        derniere_maj: new Date(), maj_par: data.maj_par,
      },
    });
    return { success: true as const, data: stock };
  } catch {
    return { success: false as const, error: "Erreur lors de la création." };
  }
}

export async function ajusterStock(stockId: string, delta: number, par: string) {
  try {
    const stock = await prisma.stock.findUnique({ where: { id: stockId } });
    if (!stock) return { success: false as const, error: "Stock non trouvé." };

    const newQte = Math.max(0, stock.quantite + delta);
    await prisma.stock.update({
      where: { id: stockId },
      data: { quantite: newQte, derniere_maj: new Date(), maj_par: par },
    });
    await prisma.mouvementStock.create({
      data: {
        stock_id: stockId, date: new Date(),
        type_mouv: delta > 0 ? "ENTREE" : "SORTIE",
        quantite: Math.abs(delta), par,
      },
    });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de l'ajustement." };
  }
}

// ═══ MODULES (Paramètres) ═══

export async function updateModulesActifs(structureId: string, modules: string[]) {
  try {
    await prisma.structure.update({
      where: { id: structureId },
      data: { modules_actifs: modules },
    });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la mise à jour." };
  }
}
