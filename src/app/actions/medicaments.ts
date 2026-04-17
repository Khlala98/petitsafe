"use server";

import { prisma } from "@/lib/supabase/prisma";
import type { VoieAdministration } from "@prisma/client";

export interface AdministrationInput {
  enfant_id: string;
  nom_medicament: string;
  posologie: string;
  voie: VoieAdministration;
  date_administration: string;
  ordonnance_fournie: boolean;
  observations?: string;
}

export interface SignaturePayload {
  profil_id: string;
  nom_complet: string;
}

export async function listerAdministrations(structureId: string, opts?: { enfantId?: string }) {
  try {
    const list = await prisma.administrationMedicament.findMany({
      where: {
        structure_id: structureId,
        ...(opts?.enfantId ? { enfant_id: opts.enfantId } : {}),
      },
      include: { enfant: { select: { id: true, prenom: true, nom: true } } },
      orderBy: { date_administration: "desc" },
    });
    return { success: true as const, data: list };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des administrations." };
  }
}

export async function getAdministration(id: string) {
  try {
    const a = await prisma.administrationMedicament.findUnique({
      where: { id },
      include: { enfant: { select: { id: true, prenom: true, nom: true } } },
    });
    if (!a) return { success: false as const, error: "Administration introuvable." };
    return { success: true as const, data: a };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}

export async function creerAdministration(structureId: string, data: AdministrationInput) {
  try {
    if (!data.nom_medicament?.trim()) return { success: false as const, error: "Nom du médicament requis." };
    if (!data.posologie?.trim()) return { success: false as const, error: "Posologie requise." };
    if (!data.date_administration) return { success: false as const, error: "Date et heure d'administration requises." };

    const admin = await prisma.administrationMedicament.create({
      data: {
        structure_id: structureId,
        enfant_id: data.enfant_id,
        nom_medicament: data.nom_medicament.trim(),
        posologie: data.posologie.trim(),
        voie: data.voie,
        date_administration: new Date(data.date_administration),
        ordonnance_fournie: data.ordonnance_fournie,
        observations: data.observations?.trim() || null,
      },
    });
    return { success: true as const, data: admin };
  } catch {
    return { success: false as const, error: "Erreur lors de la création." };
  }
}

export async function modifierAdministration(id: string, data: AdministrationInput) {
  try {
    const existing = await prisma.administrationMedicament.findUnique({ where: { id } });
    if (!existing) return { success: false as const, error: "Administration introuvable." };
    if (existing.signe) return { success: false as const, error: "Administration signée — modification impossible." };

    const admin = await prisma.administrationMedicament.update({
      where: { id },
      data: {
        nom_medicament: data.nom_medicament.trim(),
        posologie: data.posologie.trim(),
        voie: data.voie,
        date_administration: new Date(data.date_administration),
        ordonnance_fournie: data.ordonnance_fournie,
        observations: data.observations?.trim() || null,
      },
    });
    return { success: true as const, data: admin };
  } catch {
    return { success: false as const, error: "Erreur lors de la modification." };
  }
}

export async function signerAdministration(id: string, sig: SignaturePayload) {
  try {
    if (!sig.profil_id || !sig.nom_complet) {
      return { success: false as const, error: "Profil et nom complet requis pour signer." };
    }
    const existing = await prisma.administrationMedicament.findUnique({ where: { id } });
    if (!existing) return { success: false as const, error: "Administration introuvable." };
    if (existing.signe) return { success: false as const, error: "Déjà signée — signature irréversible." };

    const admin = await prisma.administrationMedicament.update({
      where: { id },
      data: {
        signe: true,
        signe_par_id: sig.profil_id,
        signe_par_nom: sig.nom_complet,
        signe_le: new Date(),
      },
    });
    return { success: true as const, data: admin };
  } catch {
    return { success: false as const, error: "Erreur lors de la signature." };
  }
}

export async function cosignerAdministration(id: string, sig: SignaturePayload) {
  try {
    if (!sig.profil_id || !sig.nom_complet) {
      return { success: false as const, error: "Profil témoin et nom complet requis." };
    }
    const existing = await prisma.administrationMedicament.findUnique({ where: { id } });
    if (!existing) return { success: false as const, error: "Administration introuvable." };
    if (!existing.signe) return { success: false as const, error: "L'administration doit d'abord être signée par l'administrateur." };
    if (existing.temoin_signe_le) return { success: false as const, error: "Témoin déjà enregistré." };
    if (existing.signe_par_id === sig.profil_id) {
      return { success: false as const, error: "Le témoin doit être un professionnel différent." };
    }

    const admin = await prisma.administrationMedicament.update({
      where: { id },
      data: {
        temoin_id: sig.profil_id,
        temoin_nom: sig.nom_complet,
        temoin_signe_le: new Date(),
      },
    });
    return { success: true as const, data: admin };
  } catch {
    return { success: false as const, error: "Erreur lors de la co-signature." };
  }
}

export async function supprimerAdministration(id: string) {
  try {
    const existing = await prisma.administrationMedicament.findUnique({ where: { id } });
    if (!existing) return { success: false as const, error: "Administration introuvable." };
    if (existing.signe) return { success: false as const, error: "Administration signée — suppression interdite." };
    await prisma.administrationMedicament.delete({ where: { id } });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la suppression." };
  }
}
