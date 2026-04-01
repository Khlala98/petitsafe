"use server";

import { prisma } from "@/lib/supabase/prisma";
import type { ActionResult } from "@/types";

export interface TimelineEntry {
  heure: string;
  icone: string;
  type: string;
  description: string;
}

export interface EnfantPortail {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: string;
  photo_url: string | null;
  groupe: string | null;
  allergies: { allergene: string; severite: string }[];
}

export async function getEnfantsParent(
  userId: string
): Promise<ActionResult<{ enfants: EnfantPortail[]; structureNom: string; structureId: string }>> {
  try {
    const userStructure = await prisma.userStructure.findFirst({
      where: { user_id: userId, role: "PARENT" },
      include: {
        structure: {
          include: {
            enfants: {
              where: { actif: true },
              include: { allergies: { select: { allergene: true, severite: true } } },
              orderBy: { prenom: "asc" },
            },
          },
        },
      },
    });

    if (!userStructure) return { success: false, error: "Aucune structure trouvée." };

    return {
      success: true,
      data: {
        structureNom: userStructure.structure.nom,
        structureId: userStructure.structure.id,
        enfants: userStructure.structure.enfants.map((e) => ({
          id: e.id,
          prenom: e.prenom,
          nom: e.nom,
          date_naissance: e.date_naissance.toISOString(),
          photo_url: e.photo_url,
          groupe: e.groupe,
          allergies: e.allergies.map((a) => ({
            allergene: a.allergene,
            severite: a.severite,
          })),
        })),
      },
    };
  } catch {
    return { success: false, error: "Erreur lors du chargement." };
  }
}

export async function getTimelineEnfant(
  structureId: string, enfantId: string, dateStr: string
): Promise<ActionResult<TimelineEntry[]>> {
  try {
    const date = new Date(dateStr);
    const debut = new Date(date); debut.setHours(0, 0, 0, 0);
    const fin = new Date(date); fin.setHours(23, 59, 59, 999);

    const [biberons, repas, changes, siestes, transmissions] = await Promise.all([
      prisma.biberon.findMany({
        where: { structure_id: structureId, enfant_id: enfantId, date: { gte: debut, lte: fin } },
        orderBy: { heure_preparation: "asc" },
      }),
      prisma.repas.findMany({
        where: { structure_id: structureId, enfant_id: enfantId, date: { gte: debut, lte: fin } },
        orderBy: { date: "asc" },
      }),
      prisma.change.findMany({
        where: { structure_id: structureId, enfant_id: enfantId, date: { gte: debut, lte: fin } },
        orderBy: { heure: "asc" },
      }),
      prisma.sieste.findMany({
        where: { structure_id: structureId, enfant_id: enfantId, date: { gte: debut, lte: fin } },
        orderBy: { heure_debut: "asc" },
      }),
      prisma.transmission.findMany({
        where: { structure_id: structureId, enfant_id: enfantId, date: { gte: debut, lte: fin } },
        orderBy: { date: "asc" },
      }),
    ]);

    const TYPE_REPAS_LABELS: Record<string, string> = {
      PETIT_DEJ: "Petit-déjeuner",
      DEJEUNER: "Déjeuner",
      GOUTER: "Goûter",
      DINER: "Dîner",
    };

    const QUANTITE_LABELS: Record<string, string> = {
      TOUT: "tout mangé",
      BIEN: "bien",
      PEU: "peu",
      RIEN: "rien",
    };

    const TYPE_CHANGE_LABELS: Record<string, string> = {
      MOUILLEE: "mouillée",
      SELLE: "selle",
      LES_DEUX: "mouillée + selle",
    };

    const timeline: TimelineEntry[] = [];

    for (const b of biberons) {
      const h = new Date(b.heure_preparation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const buDesc = b.quantite_bue_ml ? `${b.quantite_bue_ml}ml bu` : "";
      timeline.push({
        heure: h,
        icone: "🍼",
        type: "biberon",
        description: `Biberon — ${b.quantite_preparee_ml}ml préparé${buDesc ? `, ${buDesc}` : ""}`,
      });
    }

    for (const r of repas) {
      const h = new Date(r.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const details: string[] = [];
      if (r.entree && r.entree_quantite) details.push(`${r.entree} : ${QUANTITE_LABELS[r.entree_quantite] ?? r.entree_quantite}`);
      if (r.plat && r.plat_quantite) details.push(`${r.plat} : ${QUANTITE_LABELS[r.plat_quantite] ?? r.plat_quantite}`);
      if (r.dessert && r.dessert_quantite) details.push(`${r.dessert} : ${QUANTITE_LABELS[r.dessert_quantite] ?? r.dessert_quantite}`);
      timeline.push({
        heure: h,
        icone: "🍽️",
        type: "repas",
        description: `${TYPE_REPAS_LABELS[r.type_repas] ?? r.type_repas} — ${details.join(", ") || "enregistré"}`,
      });
    }

    for (const c of changes) {
      const h = new Date(c.heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      timeline.push({
        heure: h,
        icone: "🧷",
        type: "change",
        description: `Change — ${TYPE_CHANGE_LABELS[c.type_change] ?? c.type_change}`,
      });
    }

    for (const s of siestes) {
      const h = new Date(s.heure_debut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const duree = s.duree_minutes ? `${Math.floor(s.duree_minutes / 60)}h${String(s.duree_minutes % 60).padStart(2, "0")}` : "en cours";
      const qualite = s.qualite ? `, ${s.qualite.toLowerCase()}` : "";
      timeline.push({
        heure: h,
        icone: "😴",
        type: "sieste",
        description: `Sieste — ${duree}${qualite}`,
      });
    }

    for (const t of transmissions) {
      const h = new Date(t.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      timeline.push({
        heure: h,
        icone: "💬",
        type: "transmission",
        description: t.contenu,
      });
    }

    // Sort by time descending (most recent first)
    timeline.sort((a, b) => {
      const [ah, am] = a.heure.split(":").map(Number);
      const [bh, bm] = b.heure.split(":").map(Number);
      return (bh * 60 + bm) - (ah * 60 + am);
    });

    return { success: true, data: timeline };
  } catch {
    return { success: false, error: "Erreur lors du chargement de la timeline." };
  }
}

export async function creerSignalementAbsence(data: {
  structure_id: string; enfant_id: string; date: string;
  motif: string; commentaire?: string; auteur: string;
}): Promise<ActionResult> {
  try {
    const MOTIF_LABELS: Record<string, string> = {
      maladie: "Absence maladie",
      vacances: "Absence vacances",
      autre: "Absence autre motif",
    };
    const contenu = `${MOTIF_LABELS[data.motif] ?? "Absence"} le ${new Date(data.date).toLocaleDateString("fr-FR")}${data.commentaire ? ` — ${data.commentaire}` : ""}`;
    await prisma.transmission.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id,
        date: new Date(),
        contenu,
        auteur: data.auteur,
        type_transm: "ENFANT",
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de l'enregistrement." };
  }
}

export async function creerSignalementApport(data: {
  structure_id: string; enfant_id: string; date: string;
  description: string; auteur: string;
}): Promise<ActionResult> {
  try {
    const contenu = `Apport parent le ${new Date(data.date).toLocaleDateString("fr-FR")} : ${data.description}`;
    await prisma.transmission.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id,
        date: new Date(),
        contenu,
        auteur: data.auteur,
        type_transm: "ENFANT",
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de l'enregistrement." };
  }
}

export async function getMultiStructuresKpi(userId: string): Promise<ActionResult<{
  structures: {
    id: string; nom: string; type: string;
    enfantsActifs: number; tempNonConformes: number;
    alertesDlc: number; nettoyagePct: number;
  }[];
}>> {
  try {
    const userStructures = await prisma.userStructure.findMany({
      where: { user_id: userId, role: "GESTIONNAIRE" },
      include: { structure: true },
    });

    if (userStructures.length === 0) return { success: false, error: "Aucune structure trouvée." };

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const structures = await Promise.all(
      userStructures.map(async (us) => {
        const sid = us.structure.id;
        const [enfantsCount, tempNC, dlcAlerts] = await Promise.all([
          prisma.enfant.count({ where: { structure_id: sid, actif: true } }),
          prisma.releveTemperature.count({
            where: { structure_id: sid, conforme: false, date: { gte: todayStart, lte: todayEnd } },
          }),
          prisma.receptionMarchandise.count({
            where: {
              structure_id: sid, statut: "EN_STOCK",
              dlc: { lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
            },
          }),
        ]);

        return {
          id: sid,
          nom: us.structure.nom,
          type: us.structure.type,
          enfantsActifs: enfantsCount,
          tempNonConformes: tempNC,
          alertesDlc: dlcAlerts,
          nettoyagePct: 0, // simplified — full calc would need zone/tache logic
        };
      })
    );

    return { success: true, data: { structures } };
  } catch {
    return { success: false, error: "Erreur lors du chargement." };
  }
}
