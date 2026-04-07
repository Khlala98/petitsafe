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
 * Détecte un nom "gibberish" (saisies de test type "dzadaz", "fdzed", "EZVEZ").
 * Heuristiques cumulatives :
 *  - longueur < 3
 *  - aucune voyelle
 *  - "z" adjacent à une autre consonne (sauf h) — quasi inexistant en français/anglais
 *    courant, mais typique du clavier-rage ("dz", "zv", "zd", "zf"...)
 *    Exclut volontairement "zz" (pizza), "zy" (crazy), "zh" (Zhang).
 */
function isGibberishNom(input: string): boolean {
  const nom = input.trim();
  if (nom.length < 3) return true;
  // Si contient autre chose que des lettres/espaces/accents/tirets/apostrophes, on laisse
  if (!/^[a-zA-ZÀ-ÿ\s'\-]+$/.test(nom)) return false;
  if (!/[aeiouyàâäéèêëîïôöùûüAEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜ]/.test(nom)) return true;
  // z accolé à une consonne (hors h, y, z)
  if (/z[bcdfgjklmnpqrstvwx]|[bcdfgjklmnpqrstvwx]z/i.test(nom)) return true;
  return false;
}

/**
 * Supprime les données aberrantes d'une structure :
 * - Relevés de température hors plage plausible (< -50 ou > 100)
 * - Équipements de température avec nom gibberish (cascade : supprime aussi leurs relevés)
 * - Stocks avec quantité absurde (> 10 000) ou nom gibberish
 * - Réceptions avec nom de produit invalide (< 3 caractères ou gibberish)
 */
export async function nettoyerDonneesAberrantes(structureId: string) {
  try {
    // 1. Relevés de température hors plage physique
    const relevesHorsPlage = await prisma.releveTemperature.deleteMany({
      where: {
        structure_id: structureId,
        OR: [{ temperature: { gt: 100 } }, { temperature: { lt: -50 } }],
      },
    });

    // 2. Équipements avec nom gibberish (cascade supprime leurs relevés)
    const equipements = await prisma.equipement.findMany({
      where: { structure_id: structureId },
      select: { id: true, nom: true },
    });
    const equipementsAberrantsIds = equipements
      .filter((e) => isGibberishNom(e.nom))
      .map((e) => e.id);
    const equipDeleted = equipementsAberrantsIds.length
      ? await prisma.equipement.deleteMany({ where: { id: { in: equipementsAberrantsIds } } })
      : { count: 0 };

    // 3. Stocks : quantité absurde OU nom gibberish
    const stocksHorsQuantite = await prisma.stock.deleteMany({
      where: { structure_id: structureId, quantite: { gt: 10000 } },
    });
    const stocksRestants = await prisma.stock.findMany({
      where: { structure_id: structureId },
      select: { id: true, produit_nom: true },
    });
    const stocksAberrantsIds = stocksRestants
      .filter((s) => isGibberishNom(s.produit_nom))
      .map((s) => s.id);
    const stocksGibberishDeleted = stocksAberrantsIds.length
      ? await prisma.stock.deleteMany({ where: { id: { in: stocksAberrantsIds } } })
      : { count: 0 };

    // 4. Réceptions avec nom de produit gibberish
    const receptions = await prisma.receptionMarchandise.findMany({
      where: { structure_id: structureId },
      select: { id: true, nom_produit: true },
    });
    const receptionsAberrantesIds = receptions
      .filter((r) => isGibberishNom(r.nom_produit))
      .map((r) => r.id);
    const recDeleted = receptionsAberrantesIds.length
      ? await prisma.receptionMarchandise.deleteMany({ where: { id: { in: receptionsAberrantesIds } } })
      : { count: 0 };

    return {
      success: true as const,
      data: {
        relevesSupprimes: relevesHorsPlage.count,
        equipementsSupprimes: equipDeleted.count,
        stocksSupprimes: stocksHorsQuantite.count + stocksGibberishDeleted.count,
        receptionsSupprimees: recDeleted.count,
      },
    };
  } catch {
    return { success: false as const, error: "Erreur lors du nettoyage." };
  }
}
