"use server";

import { prisma } from "@/lib/supabase/prisma";
import { enfantSchema, importEnfantSchema } from "@/lib/schemas/enfant";
import { z } from "zod";

export async function creerEnfant(structureId: string, data: z.infer<typeof enfantSchema>) {
  try {
    const parsed = enfantSchema.safeParse(data);
    if (!parsed.success) return { success: false as const, error: "Données invalides." };

    const enfant = await prisma.enfant.create({
      data: {
        structure_id: structureId,
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
        date_naissance: new Date(parsed.data.date_naissance),
        sexe: parsed.data.sexe ?? undefined,
        groupe: parsed.data.groupe ?? undefined,
        photo_url: parsed.data.photo_url ?? undefined,
        regimes: parsed.data.regimes,
        allergies: {
          create: parsed.data.allergies.map((a) => ({
            allergene: a.allergene,
            severite: a.severite,
            protocole: a.protocole ?? undefined,
            document_pai: a.document_pai ?? undefined,
          })),
        },
        contacts: {
          create: parsed.data.contacts.map((c) => ({
            nom: c.nom,
            lien: c.lien,
            telephone: c.telephone,
            est_autorise_recuperer: c.est_autorise_recuperer,
            ordre_priorite: c.ordre_priorite,
          })),
        },
      },
      include: { allergies: true, contacts: true },
    });
    return { success: true as const, data: enfant };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de la création. Réessayez." };
  }
}

export async function modifierEnfant(enfantId: string, structureId: string, data: z.infer<typeof enfantSchema>) {
  try {
    const parsed = enfantSchema.safeParse(data);
    if (!parsed.success) return { success: false as const, error: "Données invalides." };

    // Delete existing allergies and contacts, then recreate
    await prisma.allergieEnfant.deleteMany({ where: { enfant_id: enfantId } });
    await prisma.contactUrgence.deleteMany({ where: { enfant_id: enfantId } });

    const enfant = await prisma.enfant.update({
      where: { id: enfantId, structure_id: structureId },
      data: {
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
        date_naissance: new Date(parsed.data.date_naissance),
        sexe: parsed.data.sexe ?? undefined,
        groupe: parsed.data.groupe ?? undefined,
        photo_url: parsed.data.photo_url ?? undefined,
        regimes: parsed.data.regimes,
        allergies: {
          create: parsed.data.allergies.map((a) => ({
            allergene: a.allergene,
            severite: a.severite,
            protocole: a.protocole ?? undefined,
            document_pai: a.document_pai ?? undefined,
          })),
        },
        contacts: {
          create: parsed.data.contacts.map((c) => ({
            nom: c.nom,
            lien: c.lien,
            telephone: c.telephone,
            est_autorise_recuperer: c.est_autorise_recuperer,
            ordre_priorite: c.ordre_priorite,
          })),
        },
      },
      include: { allergies: true, contacts: true },
    });
    return { success: true as const, data: enfant };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de la modification. Réessayez." };
  }
}

export async function supprimerEnfant(enfantId: string, structureId: string) {
  try {
    await prisma.enfant.update({
      where: { id: enfantId, structure_id: structureId },
      data: { actif: false },
    });
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de la suppression." };
  }
}

export async function getEnfants(structureId: string) {
  try {
    const enfants = await prisma.enfant.findMany({
      where: { structure_id: structureId, actif: true },
      include: { allergies: true, contacts: true },
      orderBy: { prenom: "asc" },
    });
    return { success: true as const, data: enfants };
  } catch (error) {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}

export async function getEnfant(enfantId: string, structureId: string) {
  try {
    const enfant = await prisma.enfant.findFirst({
      where: { id: enfantId, structure_id: structureId },
      include: { allergies: true, contacts: true },
    });
    if (!enfant) return { success: false as const, error: "Enfant non trouvé." };
    return { success: true as const, data: enfant };
  } catch (error) {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}

interface ImportRow {
  prenom: string;
  nom: string;
  date_naissance?: string;
  sexe?: string;
  groupe?: string;
  allergies: { allergene: string; severite: string }[];
}

export async function importerEnfants(structureId: string, rows: ImportRow[]) {
  try {
    const results: { prenom: string; nom: string; success: boolean; error?: string }[] = [];

    for (const row of rows) {
      try {
        const sexe = row.sexe === "F" || row.sexe === "FILLE" ? "FILLE" : row.sexe === "M" || row.sexe === "GARCON" ? "GARCON" : undefined;

        await prisma.enfant.create({
          data: {
            structure_id: structureId,
            prenom: row.prenom,
            nom: row.nom,
            date_naissance: row.date_naissance ? new Date(row.date_naissance) : new Date(),
            sexe: sexe ?? undefined,
            groupe: row.groupe ?? undefined,
            allergies: {
              create: row.allergies
                .filter((a) => a.allergene)
                .map((a) => ({
                  allergene: a.allergene,
                  severite: (["LEGERE", "MODEREE", "SEVERE"].includes(a.severite) ? a.severite : "MODEREE") as "LEGERE" | "MODEREE" | "SEVERE",
                })),
            },
          },
        });
        results.push({ prenom: row.prenom, nom: row.nom, success: true });
      } catch {
        results.push({ prenom: row.prenom, nom: row.nom, success: false, error: "Erreur lors de l'import" });
      }
    }

    const imported = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    return { success: true as const, data: { imported, failed, results } };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de l'import." };
  }
}

export async function checkDoublons(structureId: string, enfants: { prenom: string; nom: string }[]) {
  try {
    const existing = await prisma.enfant.findMany({
      where: { structure_id: structureId, actif: true },
      select: { prenom: true, nom: true },
    });
    const doublons = enfants.filter((e) =>
      existing.some((ex) => ex.prenom.toLowerCase() === e.prenom.toLowerCase() && ex.nom.toLowerCase() === e.nom.toLowerCase())
    );
    return { success: true as const, data: doublons };
  } catch {
    return { success: true as const, data: [] };
  }
}
