"use server";

import { prisma } from "@/lib/supabase/prisma";

export async function getStructureInfo(structureId: string) {
  try {
    const structure = await prisma.structure.findUnique({
      where: { id: structureId },
      select: {
        id: true,
        nom: true,
        type: true,
        adresse: true,
        code_postal: true,
        ville: true,
        telephone: true,
        email: true,
        numero_agrement: true,
      },
    });
    if (!structure) return { success: false as const, error: "Structure introuvable." };
    return { success: true as const, data: structure };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}

export async function updateStructureInfo(
  structureId: string,
  data: {
    nom: string;
    adresse?: string | null;
    code_postal?: string | null;
    ville?: string | null;
    telephone?: string | null;
    email?: string | null;
  }
) {
  try {
    if (!data.nom || data.nom.trim().length < 2) {
      return { success: false as const, error: "Le nom de la structure doit faire au moins 2 caractères." };
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { success: false as const, error: "Email invalide." };
    }
    await prisma.structure.update({
      where: { id: structureId },
      data: {
        nom: data.nom.trim(),
        adresse: data.adresse?.trim() || null,
        code_postal: data.code_postal?.trim() || null,
        ville: data.ville?.trim() || null,
        telephone: data.telephone?.trim() || null,
        email: data.email?.trim() || null,
      },
    });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de l'enregistrement." };
  }
}

/**
 * Supprime les données aberrantes d'une structure :
 * - Relevés de température hors plage physiquement plausible (< -50 ou > 100)
 * - Stocks avec quantité absurde (> 10 000)
 * - Réceptions avec nom de produit visiblement invalide (< 3 caractères ou que des consonnes)
 */
export async function nettoyerDonneesAberrantes(structureId: string) {
  try {
    const releves = await prisma.releveTemperature.deleteMany({
      where: {
        structure_id: structureId,
        OR: [{ temperature: { gt: 100 } }, { temperature: { lt: -50 } }],
      },
    });

    const stocks = await prisma.stock.deleteMany({
      where: { structure_id: structureId, quantite: { gt: 10000 } },
    });

    const receptions = await prisma.receptionMarchandise.findMany({
      where: { structure_id: structureId },
      select: { id: true, nom_produit: true, fournisseur: true },
    });
    const aberrantesIds = receptions
      .filter((r) => {
        const nom = r.nom_produit.trim();
        if (nom.length < 3) return true;
        // Pas de voyelle = probablement du gibberish (dzadaz, EZVEZ, etc. ont des voyelles, on doit être plus large)
        const isGibberish = /^[a-zA-Z]{3,}$/.test(nom) && !/[aeiouyAEIOUY].*[aeiouyAEIOUY]/.test(nom);
        return isGibberish;
      })
      .map((r) => r.id);
    const recDeleted = aberrantesIds.length
      ? await prisma.receptionMarchandise.deleteMany({ where: { id: { in: aberrantesIds } } })
      : { count: 0 };

    return {
      success: true as const,
      data: {
        relevesSupprimes: releves.count,
        stocksSupprimes: stocks.count,
        receptionsSupprimees: recDeleted.count,
      },
    };
  } catch {
    return { success: false as const, error: "Erreur lors du nettoyage." };
  }
}
