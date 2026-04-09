"use server";

import { prisma } from "@/lib/supabase/prisma";
import { RoleProfil } from "@prisma/client";

// ═══ Lister les profils actifs d'une structure ═══
export async function listerProfils(structureId: string) {
  try {
    const profils = await prisma.profil.findMany({
      where: { structure_id: structureId, actif: true },
      orderBy: [{ role: "asc" }, { prenom: "asc" }],
    });
    return { success: true as const, data: profils };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des profils." };
  }
}

// ═══ Lister tous les profils (y compris inactifs) — admin only ═══
export async function listerTousProfils(structureId: string) {
  try {
    const profils = await prisma.profil.findMany({
      where: { structure_id: structureId },
      orderBy: [{ actif: "desc" }, { role: "asc" }, { prenom: "asc" }],
    });
    return { success: true as const, data: profils };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des profils." };
  }
}

// ═══ Obtenir un profil par ID ═══
export async function obtenirProfil(profilId: string) {
  try {
    const profil = await prisma.profil.findUnique({ where: { id: profilId } });
    if (!profil) return { success: false as const, error: "Profil introuvable." };
    return { success: true as const, data: profil };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement du profil." };
  }
}

// ═══ Créer un profil ═══
export async function creerProfil(data: {
  structure_id: string;
  prenom: string;
  nom: string;
  poste?: string;
  role?: RoleProfil;
  telephone?: string;
  email?: string;
  certifications?: string;
  notes?: string;
}) {
  try {
    if (!data.prenom?.trim()) return { success: false as const, error: "Le prénom est obligatoire." };
    if (!data.nom?.trim()) return { success: false as const, error: "Le nom est obligatoire." };

    const profil = await prisma.profil.create({
      data: {
        structure_id: data.structure_id,
        prenom: data.prenom.trim(),
        nom: data.nom.trim(),
        poste: data.poste || null,
        role: data.role || RoleProfil.PROFESSIONNEL,
        telephone: data.telephone || null,
        email: data.email || null,
        certifications: data.certifications || null,
        notes: data.notes || null,
      },
    });
    return { success: true as const, data: profil };
  } catch {
    return { success: false as const, error: "Erreur lors de la création du profil." };
  }
}

// ═══ Modifier un profil ═══
export async function modifierProfil(
  profilId: string,
  data: {
    prenom?: string;
    nom?: string;
    poste?: string;
    role?: RoleProfil;
    telephone?: string;
    email?: string;
    certifications?: string;
    notes?: string;
    actif?: boolean;
  }
) {
  try {
    const profil = await prisma.profil.update({
      where: { id: profilId },
      data: {
        ...(data.prenom !== undefined && { prenom: data.prenom.trim() }),
        ...(data.nom !== undefined && { nom: data.nom.trim() }),
        ...(data.poste !== undefined && { poste: data.poste || null }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.telephone !== undefined && { telephone: data.telephone || null }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.certifications !== undefined && { certifications: data.certifications || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.actif !== undefined && { actif: data.actif }),
      },
    });
    return { success: true as const, data: profil };
  } catch {
    return { success: false as const, error: "Erreur lors de la modification du profil." };
  }
}

// ═══ Désactiver un profil (soft delete) ═══
export async function desactiverProfil(profilId: string) {
  try {
    // Vérifier qu'on ne désactive pas le dernier admin
    const profil = await prisma.profil.findUnique({ where: { id: profilId } });
    if (!profil) return { success: false as const, error: "Profil introuvable." };

    if (profil.role === RoleProfil.ADMINISTRATEUR) {
      const autresAdmins = await prisma.profil.count({
        where: {
          structure_id: profil.structure_id,
          role: RoleProfil.ADMINISTRATEUR,
          actif: true,
          id: { not: profilId },
        },
      });
      if (autresAdmins === 0) {
        return { success: false as const, error: "Impossible de désactiver le dernier administrateur." };
      }
    }

    await prisma.profil.update({
      where: { id: profilId },
      data: { actif: false },
    });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la désactivation." };
  }
}

// ═══ Auto-créer le profil admin si aucun profil n'existe ═══
export async function assurerProfilAdmin(structureId: string, prenom: string, nom: string) {
  try {
    const count = await prisma.profil.count({ where: { structure_id: structureId } });
    if (count > 0) return { success: true as const, created: false };

    const profil = await prisma.profil.create({
      data: {
        structure_id: structureId,
        prenom: prenom.trim(),
        nom: nom.trim(),
        poste: "Directrice",
        role: RoleProfil.ADMINISTRATEUR,
      },
    });
    return { success: true as const, created: true, data: profil };
  } catch {
    return { success: false as const, error: "Erreur lors de la création du profil administrateur." };
  }
}
