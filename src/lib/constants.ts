// Seuils réglementaires — source unique de vérité
// Toute valeur réglementaire doit être référencée ici, jamais hardcodée.

export const SEUILS_TEMPERATURE = {
  frigo_min: 0,
  frigo_max: 4,
  frigo_warning: 5,
  congel_max: -18,
  congel_warning: -15,
  plat_chaud_min: 63,
  plat_froid_max: 3,
  /** Plages de validation — valeurs physiquement plausibles */
  frigo_plage_min: -10,
  frigo_plage_max: 15,
  congel_plage_min: -30,
  congel_plage_max: 0,
} as const;

/** Délai max biberon après préparation (minutes) — recommandation ANSES */
export const DELAI_BIBERON_MINUTES = 60;

/** Seuil d'attention biberon (minutes) — alerte orange */
export const DELAI_BIBERON_ATTENTION_MINUTES = 45;

/** Durée max d'une boîte de lait ouverte (jours) */
export const DELAI_BOITE_LAIT_JOURS = 30;

/** Nombre de jours avant DLC pour déclencher l'alerte */
export const DLC_ALERTE_JOURS = 2;

/** Couleurs de la palette RZPan'Da */
export const COULEURS = {
  primaire: "#2563eb",
  secondaire: "#1d4ed8",
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

/** Régimes alimentaires prédéfinis */
export const REGIMES_ALIMENTAIRES = [
  "Sans porc",
  "Végétarien",
  "Sans gluten",
  "Sans lactose",
  "Halal",
  "Casher",
  "Bio uniquement",
] as const;

/** Modules disponibles — chaque structure active/désactive individuellement */
export const MODULES_DISPONIBLES = {
  temperatures:  { label: "Températures",   icon: "Thermometer",     categorie: "haccp"   as const, description: "Relevés frigo, congélateur, plats" },
  tracabilite:   { label: "Traçabilité",    icon: "Package",         categorie: "haccp"   as const, description: "Réceptions, lots, DLC, fournisseurs" },
  nettoyage:     { label: "Nettoyage",      icon: "Sparkles",        categorie: "haccp"   as const, description: "Plan de nettoyage, validations" },
  biberonnerie:  { label: "Biberonnerie",   icon: "Baby",            categorie: "haccp"   as const, description: "Préparation, timer ANSES, traçabilité lait" },
  repas:         { label: "Repas",          icon: "UtensilsCrossed", categorie: "suivi"   as const, description: "Suivi repas enfants" },
  changes:       { label: "Changes",        icon: "Baby",            categorie: "suivi"   as const, description: "Suivi changes" },
  siestes:       { label: "Siestes",        icon: "Moon",            categorie: "suivi"   as const, description: "Suivi siestes" },
  transmissions: { label: "Transmissions",  icon: "MessageSquare",   categorie: "suivi"   as const, description: "Notes et transmissions" },
  stocks:        { label: "Stocks",         icon: "Boxes",           categorie: "gestion" as const, description: "Gestion des stocks consommables" },
  protocoles:    { label: "Protocoles",     icon: "FileText",        categorie: "gestion" as const, description: "Documents et protocoles internes" },
} as const;

export type ModuleId = keyof typeof MODULES_DISPONIBLES;
export type CategorieModule = "haccp" | "suivi" | "gestion";

/** Presets de modules — raccourcis pour l'inscription et les paramètres */
export const PRESETS_MODULES = {
  haccp_essentiel: ["temperatures", "tracabilite", "nettoyage", "biberonnerie"] as ModuleId[],
  complet: ["temperatures", "tracabilite", "nettoyage", "biberonnerie", "repas", "changes", "siestes", "transmissions", "stocks", "protocoles"] as ModuleId[],
} as const;
