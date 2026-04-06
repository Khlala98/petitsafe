"use server";

import { prisma } from "@/lib/supabase/prisma";

// ═══ REPAS ═══

export async function enregistrerRepas(data: {
  structure_id: string; enfant_id: string; type_repas: string;
  entree?: string; entree_quantite?: string; plat?: string; plat_quantite?: string;
  dessert?: string; dessert_quantite?: string; observations?: string; professionnel_id: string;
}) {
  try {
    const repas = await prisma.repas.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id,
        date: new Date(),
        type_repas: data.type_repas as "PETIT_DEJ" | "DEJEUNER" | "GOUTER" | "DINER",
        entree: data.entree || null,
        entree_quantite: data.entree_quantite as "TOUT" | "BIEN" | "PEU" | "RIEN" | undefined,
        plat: data.plat || null,
        plat_quantite: data.plat_quantite as "TOUT" | "BIEN" | "PEU" | "RIEN" | undefined,
        dessert: data.dessert || null,
        dessert_quantite: data.dessert_quantite as "TOUT" | "BIEN" | "PEU" | "RIEN" | undefined,
        observations: data.observations || null,
        professionnel_id: data.professionnel_id,
      },
    });
    return { success: true as const, data: repas };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de l'enregistrement du repas." };
  }
}

// ═══ CHANGE ═══

export async function enregistrerChange(data: {
  structure_id: string; enfant_id: string; type_change: string;
  observations?: string; professionnel_id: string;
}) {
  try {
    const now = new Date();
    const change = await prisma.change.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id,
        date: now,
        heure: now,
        type_change: data.type_change as "MOUILLEE" | "SELLE" | "LES_DEUX",
        observations: data.observations || null,
        professionnel_id: data.professionnel_id,
      },
    });
    return { success: true as const, data: change };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de l'enregistrement du change." };
  }
}

// ═══ SIESTE ═══

export async function debuterSieste(data: {
  structure_id: string; enfant_id: string; professionnel_id: string;
}) {
  try {
    const now = new Date();
    const sieste = await prisma.sieste.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id,
        date: now,
        heure_debut: now,
        professionnel_id: data.professionnel_id,
      },
    });
    return { success: true as const, data: sieste };
  } catch (error) {
    return { success: false as const, error: "Erreur lors du début de sieste." };
  }
}

export async function finirSieste(data: {
  sieste_id: string; qualite?: string;
}) {
  try {
    const now = new Date();
    const sieste = await prisma.sieste.findUnique({ where: { id: data.sieste_id } });
    if (!sieste) return { success: false as const, error: "Sieste non trouvée." };

    const duree = Math.round((now.getTime() - sieste.heure_debut.getTime()) / 60000);

    const updated = await prisma.sieste.update({
      where: { id: data.sieste_id },
      data: {
        heure_fin: now,
        duree_minutes: duree,
        qualite: data.qualite as "CALME" | "AGITE" | "DIFFICILE" | "REVEILS" | undefined,
      },
    });
    return { success: true as const, data: updated };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de la fin de sieste." };
  }
}

export async function getSiesteEnCours(structureId: string, enfantId: string) {
  try {
    const sieste = await prisma.sieste.findFirst({
      where: { structure_id: structureId, enfant_id: enfantId, heure_fin: null },
      orderBy: { heure_debut: "desc" },
    });
    return { success: true as const, data: sieste };
  } catch {
    return { success: true as const, data: null };
  }
}

// ═══ TRANSMISSION ═══

export async function enregistrerTransmission(data: {
  structure_id: string; enfant_id?: string; contenu: string;
  type_transm: string; auteur: string;
}) {
  try {
    const transmission = await prisma.transmission.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id || null,
        date: new Date(),
        contenu: data.contenu,
        auteur: data.auteur,
        type_transm: data.type_transm as "GENERAL" | "ENFANT" | "EQUIPE",
      },
    });
    return { success: true as const, data: transmission };
  } catch (error) {
    return { success: false as const, error: "Erreur lors de l'enregistrement." };
  }
}

// ═══ INCIDENTS ═══

export async function enregistrerIncident(data: {
  structure_id: string; enfant_id: string; type_incident: string;
  description: string; gravite: string; action_prise: string;
  parents_prevenu: boolean; heure: string; professionnel_id: string;
}) {
  try {
    const now = new Date();
    const [h, m] = data.heure.split(":").map(Number);
    const heureDate = new Date(now);
    heureDate.setHours(h, m, 0, 0);

    const incident = await prisma.incident.create({
      data: {
        structure_id: data.structure_id,
        enfant_id: data.enfant_id,
        date: now,
        heure: heureDate,
        type_incident: data.type_incident as "CHUTE" | "MORSURE" | "GRIFFURE" | "PLEURS_PROLONGES" | "FIEVRE" | "AUTRE",
        description: data.description,
        gravite: data.gravite as "MINEUR" | "MODERE" | "GRAVE",
        action_prise: data.action_prise,
        parents_prevenu: data.parents_prevenu,
        professionnel_id: data.professionnel_id,
      },
    });
    return { success: true as const, data: incident };
  } catch {
    return { success: false as const, error: "Erreur lors de l'enregistrement de l'incident." };
  }
}

// ═══ HISTORIQUE DU JOUR (timeline par enfant) ═══

export async function getHistoriqueDuJour(structureId: string, enfantId: string) {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const where = { structure_id: structureId, enfant_id: enfantId, date: { gte: todayStart, lte: todayEnd } };

    const [repas, changes, siestes, biberons, transmissions, incidents] = await Promise.all([
      prisma.repas.findMany({ where, orderBy: { date: "desc" } }),
      prisma.change.findMany({ where, orderBy: { heure: "desc" } }),
      prisma.sieste.findMany({ where, orderBy: { heure_debut: "desc" } }),
      prisma.biberon.findMany({ where, orderBy: { heure_preparation: "desc" } }),
      prisma.transmission.findMany({ where: { ...where, enfant_id: enfantId }, orderBy: { date: "desc" } }),
      prisma.incident.findMany({ where, orderBy: { heure: "desc" } }),
    ]);

    type TimelineItem = {
      id: string;
      type: "biberon" | "repas" | "change" | "sieste" | "transmission" | "incident";
      heure: string;
      details: string;
    };

    const items: TimelineItem[] = [];

    biberons.forEach((b) => {
      const h = b.heure_preparation ? new Date(b.heure_preparation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "--:--";
      const qte = b.quantite_bue_ml ? `${b.quantite_bue_ml}ml bu` : `${b.quantite_preparee_ml}ml préparé`;
      items.push({ id: b.id, type: "biberon", heure: h, details: `${b.type_lait || "Lait"} — ${qte}` });
    });

    repas.forEach((r) => {
      const h = new Date(r.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const labels: Record<string, string> = { PETIT_DEJ: "Petit-déj", DEJEUNER: "Déjeuner", GOUTER: "Goûter", DINER: "Dîner" };
      const parts: string[] = [];
      const qteLabels: Record<string, string> = { TOUT: "tout mangé", BIEN: "bien mangé", PEU: "peu mangé", RIEN: "pas mangé" };
      if (r.plat) parts.push(`${r.plat} (${qteLabels[r.plat_quantite || ""] || ""})`);
      else if (r.entree) parts.push(`${r.entree} (${qteLabels[r.entree_quantite || ""] || ""})`);
      items.push({ id: r.id, type: "repas", heure: h, details: `${labels[r.type_repas] || r.type_repas}${parts.length ? " — " + parts.join(", ") : ""}` });
    });

    changes.forEach((c) => {
      const h = new Date(c.heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const labels: Record<string, string> = { MOUILLEE: "Mouillée", SELLE: "Selle", LES_DEUX: "Mouillée + Selle" };
      items.push({ id: c.id, type: "change", heure: h, details: labels[c.type_change] || c.type_change });
    });

    siestes.forEach((s) => {
      const h = new Date(s.heure_debut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const duree = s.duree_minutes ? `${s.duree_minutes}min` : "en cours…";
      items.push({ id: s.id, type: "sieste", heure: h, details: duree });
    });

    transmissions.forEach((t) => {
      const h = new Date(t.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      items.push({ id: t.id, type: "transmission", heure: h, details: t.contenu.length > 60 ? t.contenu.slice(0, 60) + "…" : t.contenu });
    });

    const INCIDENT_LABELS: Record<string, string> = {
      CHUTE: "Chute", MORSURE: "Morsure", GRIFFURE: "Griffure",
      PLEURS_PROLONGES: "Pleurs prolongés", FIEVRE: "Fièvre", AUTRE: "Autre",
    };
    const GRAVITE_LABELS: Record<string, string> = { MINEUR: "mineur", MODERE: "modéré", GRAVE: "grave" };

    incidents.forEach((inc) => {
      const h = new Date(inc.heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const gravite = GRAVITE_LABELS[inc.gravite] ?? inc.gravite;
      const type = INCIDENT_LABELS[inc.type_incident] ?? inc.type_incident;
      items.push({ id: inc.id, type: "incident", heure: h, details: `${type} (${gravite}) — ${inc.description.length > 50 ? inc.description.slice(0, 50) + "…" : inc.description}` });
    });

    // Sort by time descending (most recent first)
    items.sort((a, b) => b.heure.localeCompare(a.heure));

    return { success: true as const, data: items };
  } catch (error) {
    return { success: false as const, error: "Erreur lors du chargement de l'historique." };
  }
}

// ═══ DONNÉES DU JOUR (pour vue groupe) ═══

export async function getSuiviDuJour(structureId: string) {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [repas, changes, siestes, biberons, transmissions] = await Promise.all([
      prisma.repas.findMany({ where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } }, select: { enfant_id: true, id: true } }),
      prisma.change.findMany({ where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } }, select: { enfant_id: true, id: true } }),
      prisma.sieste.findMany({ where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } }, select: { enfant_id: true, id: true } }),
      prisma.biberon.findMany({ where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd } }, select: { enfant_id: true, id: true } }),
      prisma.transmission.findMany({ where: { structure_id: structureId, date: { gte: todayStart, lte: todayEnd }, enfant_id: { not: null } }, select: { enfant_id: true, id: true } }),
    ]);

    // Count per enfant
    const counts: Record<string, { biberons: number; repas: number; changes: number; siestes: number; transmissions: number }> = {};
    const add = (enfantId: string, field: string) => {
      if (!counts[enfantId]) counts[enfantId] = { biberons: 0, repas: 0, changes: 0, siestes: 0, transmissions: 0 };
      (counts[enfantId] as Record<string, number>)[field]++;
    };

    biberons.forEach((b) => add(b.enfant_id, "biberons"));
    repas.forEach((r) => add(r.enfant_id, "repas"));
    changes.forEach((c) => add(c.enfant_id, "changes"));
    siestes.forEach((s) => add(s.enfant_id, "siestes"));
    transmissions.forEach((t) => { if (t.enfant_id) add(t.enfant_id, "transmissions"); });

    return { success: true as const, data: counts };
  } catch (error) {
    return { success: false as const, error: "Erreur lors du chargement." };
  }
}
