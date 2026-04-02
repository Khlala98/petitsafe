import {
  SEUILS_TEMPERATURE,
  DELAI_BIBERON_MINUTES,
  DELAI_BIBERON_ATTENTION_MINUTES,
  DELAI_BOITE_LAIT_JOURS,
  DLC_ALERTE_JOURS,
  MODULES_DISPONIBLES,
  type ModuleId,
  type CategorieModule,
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
 * Vérifie si la température est dans la plage physiquement plausible pour le type d'équipement.
 * Retourne null si OK, ou un message d'erreur si hors plage.
 */
export function validerPlageTemperature(
  temperature: number,
  type: "REFRIGERATEUR" | "CONGELATEUR"
): string | null {
  if (type === "REFRIGERATEUR") {
    if (temperature < SEUILS_TEMPERATURE.frigo_plage_min || temperature > SEUILS_TEMPERATURE.frigo_plage_max) {
      return `Température hors plage pour un réfrigérateur (attendu : ${SEUILS_TEMPERATURE.frigo_plage_min}°C à ${SEUILS_TEMPERATURE.frigo_plage_max}°C)`;
    }
  } else {
    if (temperature < SEUILS_TEMPERATURE.congel_plage_min || temperature > SEUILS_TEMPERATURE.congel_plage_max) {
      return `Température hors plage pour un congélateur (attendu : ${SEUILS_TEMPERATURE.congel_plage_min}°C à ${SEUILS_TEMPERATURE.congel_plage_max}°C)`;
    }
  }
  return null;
}

/**
 * Calcule la conformité d'un plat témoin selon son type.
 * - Plat chaud : T° de service ≥ 63°C
 * - Plat froid : T° de service ≤ 3°C
 */
export function getConformitePlat(
  temperatureApres: number,
  typePlat: "CHAUD" | "FROID" = "CHAUD"
): "conforme" | "alerte" {
  if (typePlat === "FROID") {
    return temperatureApres <= SEUILS_TEMPERATURE.plat_froid_max ? "conforme" : "alerte";
  }
  return temperatureApres >= SEUILS_TEMPERATURE.plat_chaud_min ? "conforme" : "alerte";
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
 * - < 2 ans → "X mois"
 * - 2–6 ans → "X ans et Y mois"
 * - > 6 ans → "X ans"
 */
export function calculerAge(dateNaissance: Date, maintenant: Date): string {
  const totalMois =
    (maintenant.getFullYear() - dateNaissance.getFullYear()) * 12 +
    (maintenant.getMonth() - dateNaissance.getMonth());

  if (totalMois < 24) {
    return `${totalMois} mois`;
  }

  const ans = Math.floor(totalMois / 12);
  const moisRestants = totalMois % 12;

  if (ans < 6) {
    return moisRestants > 0 ? `${ans} ans et ${moisRestants} mois` : `${ans} ans`;
  }

  return `${ans} ans`;
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

/**
 * Vérifie si un module est actif pour une structure.
 */
export function isModuleActif(modulesActifs: string[], moduleId: ModuleId): boolean {
  return modulesActifs.includes(moduleId);
}

/**
 * Regroupe les modules actifs par catégorie (haccp, suivi, gestion).
 */
export function getModulesParCategorie(
  modulesActifs: string[]
): Record<CategorieModule, ModuleId[]> {
  const result: Record<CategorieModule, ModuleId[]> = {
    haccp: [],
    suivi: [],
    gestion: [],
  };

  for (const moduleId of modulesActifs) {
    const module = MODULES_DISPONIBLES[moduleId as ModuleId];
    if (module) {
      result[module.categorie].push(moduleId as ModuleId);
    }
  }

  return result;
}
