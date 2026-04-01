// Seuils réglementaires — source unique de vérité
// Toute valeur réglementaire doit être référencée ici, jamais hardcodée.

export const SEUILS_TEMPERATURE = {
  frigo_min: 0,
  frigo_max: 4,
  frigo_warning: 5,
  congel_max: -18,
  congel_warning: -15,
  plat_min_apres: 63,
} as const;

/** Délai max biberon après préparation (minutes) — recommandation ANSES */
export const DELAI_BIBERON_MINUTES = 60;

/** Seuil d'attention biberon (minutes) — alerte orange */
export const DELAI_BIBERON_ATTENTION_MINUTES = 45;

/** Durée max d'une boîte de lait ouverte (jours) */
export const DELAI_BOITE_LAIT_JOURS = 30;

/** Nombre de jours avant DLC pour déclencher l'alerte */
export const DLC_ALERTE_JOURS = 2;

/** Couleurs de la palette PetitSafe */
export const COULEURS = {
  primaire: "#2E86C1",
  secondaire: "#27AE60",
  accent: "#F4A261",
  danger: "#E53E3E",
  warning: "#F39C12",
  fond: "#FAFBFC",
  texte: "#1A202C",
} as const;

/** Mapping des types de structure vers libellés */
export const TYPES_STRUCTURE = {
  CRECHE: "Crèche collective",
  MICRO_CRECHE: "Micro-crèche",
  MAM: "MAM",
  ASS_MAT: "Assistante maternelle",
} as const;

/** Mapping des rôles vers libellés */
export const ROLES = {
  GESTIONNAIRE: "Gestionnaire / Directeur",
  PROFESSIONNEL: "Professionnel",
  PARENT: "Parent",
} as const;

/** Groupes d'enfants */
export const GROUPES_ENFANTS = ["Bébés", "Moyens", "Grands"] as const;

/** Types de lait */
export const TYPES_LAIT = [
  "1er âge",
  "2ème âge",
  "Maternel",
  "Croissance",
  "Spécial HA-AR",
] as const;

/** Quantités rapides biberon (ml) */
export const QUANTITES_BIBERON_ML = [90, 120, 150, 180, 210, 240] as const;
