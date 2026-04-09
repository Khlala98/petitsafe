"use server";

import { prisma } from "@/lib/supabase/prisma";
import { verifierAdmin } from "@/lib/permissions";
import { TACHES_NETTOYAGE_DEFAUT } from "@/lib/data/taches-nettoyage-defaut";
import { validationNettoyageSchema, zoneNettoyageSchema, tacheNettoyageSchema } from "@/lib/schemas/nettoyage";

// ═══ ZONES & TÂCHES ═══

export async function getZonesAvecTaches(structureId: string) {
  try {
    const zones = await prisma.zoneNettoyage.findMany({
      where: { structure_id: structureId },
      include: { taches: { where: { actif: true }, orderBy: { nom: "asc" } } },
      orderBy: { ordre: "asc" },
    });
    return { success: true as const, data: zones };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des zones." };
  }
}

export async function initialiserZonesDefaut(structureId: string) {
  try {
    const existing = await prisma.zoneNettoyage.count({ where: { structure_id: structureId } });
    if (existing > 0) return { success: true as const, data: "already_initialized" };

    for (let i = 0; i < TACHES_NETTOYAGE_DEFAUT.length; i++) {
      const zoneDefaut = TACHES_NETTOYAGE_DEFAUT[i];
      const zone = await prisma.zoneNettoyage.create({
        data: {
          structure_id: structureId,
          nom: zoneDefaut.zone,
          couleur_code: zoneDefaut.couleur_code ?? null,
          ordre: i,
        },
      });
      await prisma.tacheNettoyage.createMany({
        data: zoneDefaut.taches.map((t) => ({
          zone_id: zone.id,
          nom: t.nom,
          frequence: t.frequence,
          methode: t.methode,
          produit: t.produit ?? null,
          notes: t.notes ?? null,
        })),
      });
    }

    return { success: true as const, data: "initialized" };
  } catch {
    return { success: false as const, error: "Erreur lors de l'initialisation des zones." };
  }
}

export async function creerZone(structureId: string, data: { nom: string; couleur_code?: string }) {
  try {
    const parsed = zoneNettoyageSchema.safeParse(data);
    if (!parsed.success) return { success: false as const, error: "Données invalides." };

    const maxOrdre = await prisma.zoneNettoyage.aggregate({ where: { structure_id: structureId }, _max: { ordre: true } });
    const zone = await prisma.zoneNettoyage.create({
      data: { structure_id: structureId, nom: parsed.data.nom, couleur_code: parsed.data.couleur_code ?? null, ordre: (maxOrdre._max.ordre ?? 0) + 1 },
    });
    return { success: true as const, data: zone };
  } catch {
    return { success: false as const, error: "Erreur lors de la création de la zone." };
  }
}

export async function supprimerZone(zoneId: string, structureId: string, profilId?: string) {
  try {
    if (profilId && !(await verifierAdmin(profilId))) {
      return { success: false as const, error: "Action réservée aux administrateurs." };
    }
    await prisma.zoneNettoyage.deleteMany({ where: { id: zoneId, structure_id: structureId } });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la suppression." };
  }
}

export async function creerTache(data: { zone_id: string; nom: string; frequence: string; methode: string; produit?: string; notes?: string }) {
  try {
    const parsed = tacheNettoyageSchema.safeParse(data);
    if (!parsed.success) return { success: false as const, error: "Données invalides." };

    const tache = await prisma.tacheNettoyage.create({ data: parsed.data });
    return { success: true as const, data: tache };
  } catch {
    return { success: false as const, error: "Erreur lors de la création de la tâche." };
  }
}

export async function supprimerTache(tacheId: string, profilId?: string) {
  try {
    if (profilId && !(await verifierAdmin(profilId))) {
      return { success: false as const, error: "Action réservée aux administrateurs." };
    }
    await prisma.tacheNettoyage.update({ where: { id: tacheId }, data: { actif: false } });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de la suppression." };
  }
}

// ═══ VALIDATIONS ═══

export async function validerTache(data: { tache_id: string; professionnel_id: string; professionnel_nom: string; profil_id?: string; observations?: string }) {
  try {
    const parsed = validationNettoyageSchema.safeParse(data);
    if (!parsed.success) return { success: false as const, error: "Données invalides." };

    const now = new Date();
    const validation = await prisma.validationNettoyage.create({
      data: {
        tache_id: parsed.data.tache_id,
        date: now,
        heure: now,
        professionnel_id: parsed.data.professionnel_id,
        professionnel_nom: parsed.data.professionnel_nom,
        profil_id: data.profil_id || null,
        observations: parsed.data.observations ?? null,
      },
    });
    return { success: true as const, data: validation };
  } catch {
    return { success: false as const, error: "Erreur lors de la validation." };
  }
}

export async function annulerValidation(validationId: string, profilId?: string) {
  try {
    if (profilId && !(await verifierAdmin(profilId))) {
      return { success: false as const, error: "Seul un administrateur peut annuler une validation." };
    }
    await prisma.validationNettoyage.delete({ where: { id: validationId } });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erreur lors de l'annulation." };
  }
}

export async function getValidationsDuJour(structureId: string, date?: string) {
  try {
    const targetDate = date ? new Date(date) : new Date();
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const validations = await prisma.validationNettoyage.findMany({
      where: {
        date: { gte: dayStart, lte: dayEnd },
        tache: { zone: { structure_id: structureId } },
      },
      include: { tache: { select: { id: true, zone_id: true } } },
    });
    return { success: true as const, data: validations };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement des validations." };
  }
}

// ═══ HISTORIQUE ═══

export async function getHistoriqueNettoyage(structureId: string, mois: number, annee: number) {
  try {
    const debut = new Date(annee, mois, 1);
    const fin = new Date(annee, mois + 1, 0, 23, 59, 59, 999);

    const validations = await prisma.validationNettoyage.findMany({
      where: {
        date: { gte: debut, lte: fin },
        tache: { zone: { structure_id: structureId } },
      },
      select: { date: true, tache_id: true, professionnel_nom: true, heure: true },
    });

    // Group by day
    const parJour: Record<string, { total: number; fait: number; details: { tache_id: string; professionnel_nom: string; heure: string }[] }> = {};
    for (const v of validations) {
      const jour = v.date.toISOString().split("T")[0];
      if (!parJour[jour]) parJour[jour] = { total: 0, fait: 0, details: [] };
      parJour[jour].fait++;
      parJour[jour].details.push({
        tache_id: v.tache_id,
        professionnel_nom: v.professionnel_nom,
        heure: v.heure.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      });
    }

    return { success: true as const, data: parJour };
  } catch {
    return { success: false as const, error: "Erreur lors du chargement de l'historique." };
  }
}

// ═══ KPI DASHBOARD ═══

export async function getNettoyageKpi(structureId: string) {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const zones = await prisma.zoneNettoyage.findMany({
      where: { structure_id: structureId },
      include: { taches: { where: { actif: true } } },
    });

    const allTaches = zones.flatMap((z) => z.taches);
    const { getTachesJour } = await import("@/lib/business-logic");
    const tachesDuJour = getTachesJour(allTaches, new Date());

    const validations = await prisma.validationNettoyage.findMany({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        tache: { zone: { structure_id: structureId } },
      },
      select: { tache_id: true },
    });

    const tachesValidees = new Set(validations.map((v) => v.tache_id));
    const fait = tachesDuJour.filter((t) => tachesValidees.has(t.id)).length;
    const total = tachesDuJour.length;
    const pct = total === 0 ? 100 : Math.round((fait / total) * 100);

    return { success: true as const, data: { fait, total, pct } };
  } catch {
    return { success: false as const, error: "Erreur KPI nettoyage." };
  }
}
