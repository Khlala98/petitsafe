"use server";

import { prisma } from "@/lib/supabase/prisma";
import { protocoleSchema } from "@/lib/schemas/protocole";

export async function getProtocoles(structureId: string) {
  try {
    const protocoles = await prisma.protocole.findMany({
      where: { structure_id: structureId, actif: true },
      orderBy: [{ categorie: "asc" }, { titre: "asc" }],
    });
    return { success: true as const, data: protocoles };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des protocoles." };
  }
}

export async function getProtocole(protocoleId: string, structureId: string) {
  try {
    const protocole = await prisma.protocole.findFirst({
      where: { id: protocoleId, structure_id: structureId, actif: true },
    });
    if (!protocole) return { success: false as const, error: "Protocole non trouvé." };
    return { success: true as const, data: protocole };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}

export async function creerProtocole(structureId: string, data: { titre: string; categorie: string; contenu_markdown: string }, userId: string) {
  try {
    const parsed = protocoleSchema.safeParse(data);
    if (!parsed.success) return { success: false as const, error: "Données invalides." };

    const protocole = await prisma.protocole.create({
      data: {
        structure_id: structureId,
        titre: parsed.data.titre,
        categorie: parsed.data.categorie,
        contenu_markdown: parsed.data.contenu_markdown,
        cree_par: userId,
      },
    });
    return { success: true as const, data: protocole };
  } catch {
    return { success: false as const, error: "Erreur lors de la création." };
  }
}

export async function modifierProtocole(protocoleId: string, structureId: string, data: { titre: string; categorie: string; contenu_markdown: string }) {
  try {
    const parsed = protocoleSchema.safeParse(data);
    if (!parsed.success) return { success: false as const, error: "Données invalides." };

    const existing = await prisma.protocole.findFirst({ where: { id: protocoleId, structure_id: structureId } });
    if (!existing) return { success: false as const, error: "Protocole non trouvé." };

    const protocole = await prisma.protocole.update({
      where: { id: protocoleId },
      data: {
        titre: parsed.data.titre,
        categorie: parsed.data.categorie,
        contenu_markdown: parsed.data.contenu_markdown,
        version: existing.version + 1,
      },
    });
    return { success: true as const, data: protocole };
  } catch {
    return { success: false as const, error: "Erreur lors de la modification." };
  }
}

export async function archiverProtocole(protocoleId: string, structureId: string) {
  try {
    await prisma.protocole.updateMany({ where: { id: protocoleId, structure_id: structureId }, data: { actif: false } });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de l'archivage." };
  }
}
