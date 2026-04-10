"use server";

import { prisma } from "@/lib/supabase/prisma";
import { RoleProfil } from "@prisma/client";
import { hash, compare } from "bcryptjs";

// ═══ Lister les profils actifs d'une structure (sans le pin) ═══
export async function listerProfils(structureId: string) {
  console.log("[listerProfils] appelée avec structureId:", structureId);
  try {
    const profils = await prisma.profil.findMany({
      where: { structure_id: structureId, actif: true },
      orderBy: [{ role: "asc" }, { prenom: "asc" }],
      select: {
        id: true,
        structure_id: true,
        prenom: true,
        nom: true,
        poste: true,
        role: true,
        telephone: true,
        email: true,
        certifications: true,
        notes: true,
        actif: true,
      },
    });
    console.log("[listerProfils] résultat:", profils.length, "profils trouvés");
    return { success: true as const, data: profils };
  } catch (e) {
    console.error("[listerProfils] ERREUR:", e);
    return { success: false as const, error: "Erreur lors du chargement des profils." };
  }
}

// ═══ Lister tous les profils (y compris inactifs) — admin only ═══
export async function listerTousProfils(structureId: string) {
  try {
    const profils = await prisma.profil.findMany({
      where: { structure_id: structureId },
      orderBy: [{ actif: "desc" }, { role: "asc" }, { prenom: "asc" }],
      select: {
        id: true,
        structure_id: true,
        prenom: true,
        nom: true,
        poste: true,
        role: true,
        telephone: true,
        email: true,
        certifications: true,
        notes: true,
        actif: true,
      },
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
  pin?: string;
}) {
  try {
    if (!data.prenom?.trim()) return { success: false as const, error: "Le prénom est obligatoire." };
    if (!data.nom?.trim()) return { success: false as const, error: "Le nom est obligatoire." };
    if (!data.pin?.trim()) return { success: false as const, error: "Le mot de passe profil est obligatoire." };

    const hashedPin = await hash(data.pin.trim(), 10);

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
        pin: hashedPin,
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
    pin?: string;
  }
) {
  try {
    const updateData: Record<string, unknown> = {
      ...(data.prenom !== undefined && { prenom: data.prenom.trim() }),
      ...(data.nom !== undefined && { nom: data.nom.trim() }),
      ...(data.poste !== undefined && { poste: data.poste || null }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.telephone !== undefined && { telephone: data.telephone || null }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.certifications !== undefined && { certifications: data.certifications || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.actif !== undefined && { actif: data.actif }),
    };

    if (data.pin) {
      updateData.pin = await hash(data.pin.trim(), 10);
    }

    const profil = await prisma.profil.update({
      where: { id: profilId },
      data: updateData,
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

// ═══ Vérifier le mot de passe d'un profil ═══
export async function verifierProfilPin(profilId: string, pin: string) {
  try {
    const profil = await prisma.profil.findUnique({
      where: { id: profilId },
      select: { id: true, pin: true },
    });
    if (!profil) return { success: false as const, error: "Profil introuvable." };

    // Profil existant sans PIN → attribuer le PIN par défaut "0000"
    if (!profil.pin) {
      const defaultPin = await hash("0000", 10);
      await prisma.profil.update({ where: { id: profilId }, data: { pin: defaultPin } });
      // Vérifier avec le PIN fourni
      const valid = pin === "0000";
      if (!valid) return { success: false as const, error: "Mot de passe par défaut : 0000. Changez-le dans Paramètres → Équipe." };
      return { success: true as const };
    }

    const valid = await compare(pin, profil.pin);
    if (!valid) return { success: false as const, error: "Mot de passe incorrect." };

    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la vérification." };
  }
}

// ═══ Auto-créer le profil admin si aucun profil n'existe ═══
export async function assurerProfilAdmin(structureId: string, prenom: string, nom: string) {
  console.log("[assurerProfilAdmin] appelée avec structureId:", structureId, "prenom:", prenom, "nom:", nom);
  try {
    const count = await prisma.profil.count({ where: { structure_id: structureId } });
    console.log("[assurerProfilAdmin] count profils:", count);
    if (count > 0) return { success: true as const, created: false };

    const defaultPin = await hash("0000", 10);

    const profil = await prisma.profil.create({
      data: {
        structure_id: structureId,
        prenom: prenom.trim(),
        nom: nom.trim(),
        poste: "Directrice",
        role: RoleProfil.ADMINISTRATEUR,
        pin: defaultPin,
      },
    });
    return { success: true as const, created: true, data: profil };
  } catch {
    return { success: false as const, error: "Erreur lors de la création du profil administrateur." };
  }
}
