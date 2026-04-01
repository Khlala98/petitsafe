import {
  SEUILS_TEMPERATURE,
  DELAI_BIBERON_MINUTES,
  DELAI_BIBERON_ATTENTION_MINUTES,
  DELAI_BOITE_LAIT_JOURS,
  DLC_ALERTE_JOURS,
} from "./constants";

export type StatutConformite = "conforme" | "attention" | "alerte";
export type StatutBiberon = "ok" | "attention" | "alerte";
export type AlerteDLC = null | "warning" | "alerte" | "critique";

// Fréquences de nettoyage — aligné avec l'enum Prisma
type Frequence =
  | "APRES_UTILISATION"
  | "QUOTIDIEN"
  | "BIQUOTIDIEN"
  | "HEBDO"
  | "BIMENSUEL"
  | "MENSUEL";

interface TacheNettoyageMinimal {
  frequence: Frequence;
  actif?: boolean;
}

/**
 * Calcule la conformité d'un relevé de température pour une enceinte froide.
 * Utilise les seuils de constants.ts.
 */
export function getConformiteTemperature(
  temperature: number,
  type: "REFRIGERATEUR" | "CONGELATEUR"
): StatutConformite {
  if (type === "REFRIGERATEUR") {
    if (temperature >= SEUILS_TEMPERATURE.frigo_min && temperature <= SEUILS_TEMPERATURE.frigo_max) {
      return "conforme";
    }
    if (temperature <= SEUILS_TEMPERATURE.frigo_warning) {
      return "attention";
    }
    return "alerte";
  }

  // CONGELATEUR
  if (temperature <= SEUILS_TEMPERATURE.congel_max) {
    return "conforme";
  }
  if (temperature <= SEUILS_TEMPERATURE.congel_warning) {
    return "attention";
  }
  return "alerte";
}

/**
 * Calcule la conformité d'un plat après réchauffement.
 * Conforme si température ≥ 63°C.
 */
export function getConformitePlat(temperatureApres: number): "conforme" | "alerte" {
  return temperatureApres >= SEUILS_TEMPERATURE.plat_min_apres ? "conforme" : "alerte";
}

/**
 * Calcule le statut d'un biberon en fonction du temps écoulé depuis la préparation.
 * - "ok" : < 45 min
 * - "attention" : 45–60 min
 * - "alerte" : > 60 min
 */
export function getStatutBiberon(heurePreparation: Date, maintenant: Date): StatutBiberon {
  const diffMs = maintenant.getTime() - heurePreparation.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes > DELAI_BIBERON_MINUTES) {
    return "alerte";
  }
  if (diffMinutes > DELAI_BIBERON_ATTENTION_MINUTES) {
    return "attention";
  }
  return "ok";
}

/**
 * Vérifie si une boîte de lait est expirée (ouverte depuis plus de 30 jours).
 */
export function isBoiteLaitExpiree(dateOuverture: Date, maintenant: Date): boolean {
  const diffMs = maintenant.getTime() - dateOuverture.getTime();
  const diffJours = diffMs / (1000 * 60 * 60 * 24);
  return diffJours > DELAI_BOITE_LAIT_JOURS;
}

/**
 * Calcule le niveau d'alerte DLC d'un produit.
 * - null : DLC > J+2 (pas d'alerte)
 * - "warning" : DLC ≤ J+2
 * - "alerte" : DLC = aujourd'hui
 * - "critique" : DLC dépassée
 */
export function getAlerteDLC(dlc: Date, maintenant: Date): AlerteDLC {
  const aujourdhuiDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  const dlcDebut = new Date(dlc.getFullYear(), dlc.getMonth(), dlc.getDate());

  const diffMs = dlcDebut.getTime() - aujourdhuiDebut.getTime();
  const diffJours = diffMs / (1000 * 60 * 60 * 24);

  if (diffJours < 0) return "critique";
  if (diffJours === 0) return "alerte";
  if (diffJours <= DLC_ALERTE_JOURS) return "warning";
  return null;
}

/**
 * Calcule l'âge lisible d'un enfant.
 * - < 24 mois → "X mois"
 * - ≥ 24 mois → "X ans"
 */
export function calculerAge(dateNaissance: Date, maintenant: Date): string {
  const totalMois =
    (maintenant.getFullYear() - dateNaissance.getFullYear()) * 12 +
    (maintenant.getMonth() - dateNaissance.getMonth());

  if (totalMois < 24) {
    return `${totalMois} mois`;
  }
  return `${Math.floor(totalMois / 12)} ans`;
}

/**
 * Filtre les tâches de nettoyage à réaliser pour une date donnée.
 * - APRES_UTILISATION : toujours
 * - QUOTIDIEN : toujours
 * - BIQUOTIDIEN : toujours (matin + après-midi)
 * - HEBDO : le lundi (getDay() === 1)
 * - BIMENSUEL : les 1er et 15 du mois
 * - MENSUEL : le 1er du mois
 */
export function getTachesJour<T extends TacheNettoyageMinimal>(
  taches: T[],
  date: Date
): T[] {
  const jour = date.getDay(); // 0=dimanche, 1=lundi...
  const jourMois = date.getDate();

  return taches.filter((tache) => {
    if (tache.actif === false) return false;

    switch (tache.frequence) {
      case "APRES_UTILISATION":
      case "QUOTIDIEN":
      case "BIQUOTIDIEN":
        return true;
      case "HEBDO":
        return jour === 1; // lundi
      case "BIMENSUEL":
        return jourMois === 1 || jourMois === 15;
      case "MENSUEL":
        return jourMois === 1;
      default:
        return false;
    }
  });
}
