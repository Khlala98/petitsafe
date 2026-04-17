// RZPan'Da — Données de seed réalistes pour les démos
// Importé par prisma/seed.ts — toutes les données structurées ici

import type { StructureType, Severite, TypeEquipement, TypeRepas, Quantite, TypeChange, QualiteSieste, Frequence, CategorieStock, TypeTransmission, StatutProduit, Sexe } from "@prisma/client";
import { PRESETS_MODULES } from "@/lib/constants";
import { TACHES_NETTOYAGE_DEFAUT } from "@/lib/data/taches-nettoyage-defaut";

// ═══ HELPERS ═══

/** Retourne une date relative à aujourd'hui */
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Retourne une date à J-n avec heure précise */
function dateTimeAgo(daysAgo: number, hours: number, minutes: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/** Aujourd'hui à une heure donnée */
function todayAt(hours: number, minutes: number): Date {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/** Aujourd'hui à 00:00 */
function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ═══ STRUCTURE 1 : Les Petits Explorateurs ═══

export const STRUCTURE_1 = {
  nom: "Les Petits Explorateurs",
  type: "MICRO_CRECHE" as StructureType,
  adresse: "15 rue des Lilas",
  code_postal: "75011",
  ville: "Paris",
  telephone: "01 43 55 12 34",
  email: "contact@petits-explorateurs.fr",
  capacite_accueil: 10,
  numero_agrement: "MC-75011-2024-042",
  modules_actifs: [...PRESETS_MODULES.complet],
};

export const ENFANTS_S1 = [
  {
    prenom: "Emma",
    nom: "Martin",
    date_naissance: new Date("2024-03-15"),
    sexe: "FILLE" as Sexe,
    groupe: "Bébés",
    actif: true,
    allergies: [
      { allergene: "Protéines de lait de vache", severite: "SEVERE" as Severite, protocole: "Lait maternel exclusivement. Aucun produit laitier. PAI signé." },
    ],
    contacts: [
      { nom: "Claire Martin", lien: "Mère", telephone: "06 12 34 56 78", est_autorise_recuperer: true, ordre_priorite: 1 },
      { nom: "Thomas Martin", lien: "Père", telephone: "06 23 45 67 89", est_autorise_recuperer: true, ordre_priorite: 2 },
    ],
  },
  {
    prenom: "Lucas",
    nom: "Dubois",
    date_naissance: new Date("2023-08-02"),
    sexe: "GARCON" as Sexe,
    groupe: "Moyens",
    actif: true,
    allergies: [],
    contacts: [
      { nom: "Sophie Dubois", lien: "Mère", telephone: "06 34 56 78 90", est_autorise_recuperer: true, ordre_priorite: 1 },
      { nom: "Pierre Dubois", lien: "Père", telephone: "06 45 67 89 01", est_autorise_recuperer: true, ordre_priorite: 2 },
    ],
  },
  {
    prenom: "Chloé",
    nom: "Bernard",
    date_naissance: new Date("2023-11-20"),
    sexe: "FILLE" as Sexe,
    groupe: "Moyens",
    actif: true,
    allergies: [
      { allergene: "Oeuf", severite: "MODEREE" as Severite, protocole: "Éviter oeufs crus et peu cuits. Tolérance oeufs bien cuits à confirmer avec allergologue." },
    ],
    contacts: [
      { nom: "Marie Bernard", lien: "Mère", telephone: "06 56 78 90 12", est_autorise_recuperer: true, ordre_priorite: 1 },
      { nom: "Jean Bernard", lien: "Père", telephone: "06 67 89 01 23", est_autorise_recuperer: true, ordre_priorite: 2 },
    ],
  },
  {
    prenom: "Noah",
    nom: "Petit",
    date_naissance: new Date("2024-01-05"),
    sexe: "GARCON" as Sexe,
    groupe: "Bébés",
    actif: true,
    allergies: [],
    contacts: [
      { nom: "Laura Petit", lien: "Mère", telephone: "06 78 90 12 34", est_autorise_recuperer: true, ordre_priorite: 1 },
      { nom: "Marc Petit", lien: "Père", telephone: "06 89 01 23 45", est_autorise_recuperer: true, ordre_priorite: 2 },
    ],
  },
  {
    prenom: "Léa",
    nom: "Moreau",
    date_naissance: new Date("2023-06-12"),
    sexe: "FILLE" as Sexe,
    groupe: "Grands",
    actif: true,
    allergies: [
      { allergene: "Arachide", severite: "SEVERE" as Severite, protocole: "Éviction totale arachide et fruits à coque. Stylo auto-injecteur dans trousse de secours. PAI signé." },
    ],
    contacts: [
      { nom: "Julie Moreau", lien: "Mère", telephone: "06 90 12 34 56", est_autorise_recuperer: true, ordre_priorite: 1 },
      { nom: "David Moreau", lien: "Père", telephone: "06 01 23 45 67", est_autorise_recuperer: true, ordre_priorite: 2 },
    ],
  },
  {
    prenom: "Hugo",
    nom: "Laurent",
    date_naissance: new Date("2023-09-30"),
    sexe: "GARCON" as Sexe,
    groupe: "Moyens",
    actif: true,
    allergies: [],
    contacts: [
      { nom: "Camille Laurent", lien: "Mère", telephone: "06 11 22 33 44", est_autorise_recuperer: true, ordre_priorite: 1 },
      { nom: "Romain Laurent", lien: "Père", telephone: "06 55 66 77 88", est_autorise_recuperer: true, ordre_priorite: 2 },
    ],
  },
];

export const EQUIPEMENTS_S1 = [
  { nom: "Frigo cuisine", type: "REFRIGERATEUR" as TypeEquipement, temperature_max: 4 },
  { nom: "Frigo biberonnerie", type: "REFRIGERATEUR" as TypeEquipement, temperature_max: 4 },
  { nom: "Congélateur", type: "CONGELATEUR" as TypeEquipement, temperature_max: -18 },
];

// 3 derniers jours, 2 relevés/jour (matin 8h, soir 17h)
export function getRelevesTemperature(equipementIds: { frigoCuisine: string; frigoBib: string; congelateur: string }, structureId: string, proId: string) {
  const frigoCuisineTemps = [3.2, 3.5, 3.8, 3.1, 5.2, 3.6];
  const frigoBibTemps = [2.8, 3.0, 2.9, 3.1, 2.7, 3.0];
  const congelateurTemps = [-20, -19, -21, -19, -20, -19];

  const releves: {
    structure_id: string; equipement_id: string; date: Date; heure: Date;
    temperature: number; conforme: boolean; action_corrective: string | null; professionnel_id: string;
  }[] = [];

  const timeSlots = [
    { daysAgo: 2, hour: 8 }, { daysAgo: 2, hour: 17 },
    { daysAgo: 1, hour: 8 }, { daysAgo: 1, hour: 17 },
    { daysAgo: 0, hour: 8 }, { daysAgo: 0, hour: 17 },
  ];

  timeSlots.forEach((slot, i) => {
    const dt = dateTimeAgo(slot.daysAgo, slot.hour, 0);
    // Frigo cuisine
    const tempCuisine = frigoCuisineTemps[i];
    releves.push({
      structure_id: structureId, equipement_id: equipementIds.frigoCuisine,
      date: dt, heure: dt, temperature: tempCuisine,
      conforme: tempCuisine <= 4,
      action_corrective: tempCuisine > 4 ? "Vérification joint de porte. Nettoyage grille arrière. Température revenue à 3.6°C après 45 min." : null,
      professionnel_id: proId,
    });
    // Frigo bib
    releves.push({
      structure_id: structureId, equipement_id: equipementIds.frigoBib,
      date: dt, heure: dt, temperature: frigoBibTemps[i],
      conforme: true, action_corrective: null, professionnel_id: proId,
    });
    // Congélateur
    releves.push({
      structure_id: structureId, equipement_id: equipementIds.congelateur,
      date: dt, heure: dt, temperature: congelateurTemps[i],
      conforme: true, action_corrective: null, professionnel_id: proId,
    });
  });

  return releves;
}

export function getRelevesPlat(structureId: string, proId: string) {
  return [
    {
      structure_id: structureId, date: dateTimeAgo(1, 12, 0),
      nom_plat: "Purée carottes", temperature_avant: 8, heure_avant: dateTimeAgo(1, 11, 30),
      temperature_apres: 68, heure_apres: dateTimeAgo(1, 12, 0),
      conforme: true, action_corrective: null, professionnel_id: proId,
    },
    {
      structure_id: structureId, date: dateTimeAgo(1, 12, 15),
      nom_plat: "Poulet haché", temperature_avant: 6, heure_avant: dateTimeAgo(1, 11, 45),
      temperature_apres: 72, heure_apres: dateTimeAgo(1, 12, 15),
      conforme: true, action_corrective: null, professionnel_id: proId,
    },
    {
      structure_id: structureId, date: dateTimeAgo(0, 12, 0),
      nom_plat: "Compote pommes", temperature_avant: 10, heure_avant: dateTimeAgo(0, 11, 30),
      temperature_apres: 58, heure_apres: dateTimeAgo(0, 12, 0),
      conforme: false, action_corrective: "Remise en chauffe 5 min supplémentaires, T° finale 65°C",
      professionnel_id: proId,
    },
  ];
}

export function getReceptions(structureId: string, proId: string) {
  return [
    {
      structure_id: structureId, date: dateTimeAgo(5, 9, 0),
      fournisseur: "Pharmacie du Parc", nom_produit: "Lait 1er âge Gallia",
      numero_lot: "G2024-1150", dlc: daysFromNow(15),
      temperature_reception: null, emballage_conforme: true, conforme: true,
      motif_non_conformite: null, statut: "EN_STOCK" as StatutProduit, professionnel_id: proId,
    },
    {
      structure_id: structureId, date: dateTimeAgo(10, 10, 0),
      fournisseur: "Les Jardins de Marie", nom_produit: "Purée de carottes bio",
      numero_lot: "BIO-8834", dlc: daysFromNow(1),
      temperature_reception: 5.0, emballage_conforme: true, conforme: true,
      motif_non_conformite: null, statut: "EN_STOCK" as StatutProduit, professionnel_id: proId,
    },
    {
      structure_id: structureId, date: dateTimeAgo(8, 9, 30),
      fournisseur: "Fromagerie Dupont", nom_produit: "Yaourt nature",
      numero_lot: "YN-2266", dlc: daysFromNow(2),
      temperature_reception: 4.0, emballage_conforme: true, conforme: true,
      motif_non_conformite: null, statut: "EN_STOCK" as StatutProduit, professionnel_id: proId,
    },
    {
      structure_id: structureId, date: dateTimeAgo(3, 10, 0),
      fournisseur: "Les Jardins de Marie", nom_produit: "Compote de pommes",
      numero_lot: "CP-445", dlc: daysFromNow(20),
      temperature_reception: null, emballage_conforme: true, conforme: true,
      motif_non_conformite: null, statut: "EN_STOCK" as StatutProduit, professionnel_id: proId,
    },
    {
      structure_id: structureId, date: dateTimeAgo(15, 8, 0),
      fournisseur: "Boucherie Martin", nom_produit: "Poulet haché surgelé",
      numero_lot: "PH-112", dlc: daysFromNow(90),
      temperature_reception: -19.0, emballage_conforme: true, conforme: true,
      motif_non_conformite: null, statut: "EN_STOCK" as StatutProduit, professionnel_id: proId,
    },
  ];
}

export function getStocks(structureId: string, proId: string) {
  const now = new Date();
  return [
    { structure_id: structureId, categorie: "COUCHES" as CategorieStock, produit_nom: "Couches taille 3", quantite: 45, unite: "paquets", seuil_alerte: 10, derniere_maj: now, maj_par: proId },
    { structure_id: structureId, categorie: "COUCHES" as CategorieStock, produit_nom: "Couches taille 4", quantite: 8, unite: "paquets", seuil_alerte: 10, derniere_maj: now, maj_par: proId },
    { structure_id: structureId, categorie: "ENTRETIEN" as CategorieStock, produit_nom: "Vinaigre blanc 5L", quantite: 2, unite: "bidons", seuil_alerte: 3, derniere_maj: now, maj_par: proId },
    { structure_id: structureId, categorie: "LAIT" as CategorieStock, produit_nom: "Lait Gallia 1er âge", quantite: 4, unite: "boîtes", seuil_alerte: 2, derniere_maj: now, maj_par: proId },
    { structure_id: structureId, categorie: "COMPOTES" as CategorieStock, produit_nom: "Compotes pommes bio", quantite: 12, unite: "pots", seuil_alerte: 5, derniere_maj: now, maj_par: proId },
  ];
}

export function getBiberons(structureId: string, enfantIds: { emma: string; noah: string }, proId: string) {
  return [
    {
      structure_id: structureId, enfant_id: enfantIds.emma,
      date: today(), heure_preparation: todayAt(10, 15),
      type_lait: "Maternel", nom_lait: "Lait maternel", numero_lot: "N/A",
      quantite_preparee_ml: 150, heure_service: todayAt(10, 30), quantite_bue_ml: 140,
      nettoyage_effectue: true, heure_nettoyage: todayAt(10, 50),
      preparateur_nom: "Sophie", conforme_anses: true,
      observations: null, professionnel_id: proId,
    },
    {
      structure_id: structureId, enfant_id: enfantIds.noah,
      date: today(), heure_preparation: todayAt(9, 45),
      type_lait: "1er âge", nom_lait: "Gallia 1er âge", numero_lot: "G2024-1150",
      quantite_preparee_ml: 180, heure_service: todayAt(10, 0), quantite_bue_ml: 160,
      nettoyage_effectue: true, heure_nettoyage: todayAt(10, 20),
      preparateur_nom: "Sophie", conforme_anses: true,
      observations: null, professionnel_id: proId,
    },
    {
      structure_id: structureId, enfant_id: enfantIds.noah,
      date: today(), heure_preparation: todayAt(14, 30),
      type_lait: "1er âge", nom_lait: "Gallia 1er âge", numero_lot: "G2024-1150",
      quantite_preparee_ml: 180, heure_service: null, quantite_bue_ml: null,
      nettoyage_effectue: false, heure_nettoyage: null,
      preparateur_nom: "Marie", conforme_anses: true,
      observations: "En attente de service",
      professionnel_id: proId,
    },
  ];
}

export function getRepas(structureId: string, enfantIds: { lucas: string; chloe: string; hugo: string; lea: string }, proId: string) {
  return [
    {
      structure_id: structureId, enfant_id: enfantIds.lucas, date: today(),
      type_repas: "DEJEUNER" as TypeRepas,
      entree: "Purée carottes", entree_quantite: "TOUT" as Quantite,
      plat: "Poulet haché", plat_quantite: "BIEN" as Quantite,
      dessert: "Yaourt nature", dessert_quantite: "TOUT" as Quantite,
      observations: null, professionnel_id: proId,
    },
    {
      structure_id: structureId, enfant_id: enfantIds.chloe, date: today(),
      type_repas: "DEJEUNER" as TypeRepas,
      entree: "Purée carottes", entree_quantite: "BIEN" as Quantite,
      plat: "Poulet haché", plat_quantite: "PEU" as Quantite,
      dessert: "Compote pommes", dessert_quantite: "TOUT" as Quantite,
      observations: "Allergie oeuf vérifiée — menu OK", professionnel_id: proId,
    },
    {
      structure_id: structureId, enfant_id: enfantIds.hugo, date: today(),
      type_repas: "DEJEUNER" as TypeRepas,
      entree: "Purée carottes", entree_quantite: "TOUT" as Quantite,
      plat: "Steak haché boeuf", plat_quantite: "RIEN" as Quantite,
      dessert: "Yaourt nature", dessert_quantite: "TOUT" as Quantite,
      observations: "Régime sans porc respecté — pas de jambon", professionnel_id: proId,
    },
    {
      structure_id: structureId, enfant_id: enfantIds.lea, date: today(),
      type_repas: "DEJEUNER" as TypeRepas,
      entree: "Purée carottes", entree_quantite: "BIEN" as Quantite,
      plat: "Poulet haché", plat_quantite: "BIEN" as Quantite,
      dessert: "Compote pommes", dessert_quantite: "TOUT" as Quantite,
      observations: "Allergie arachide vérifiée — menu OK", professionnel_id: proId,
    },
  ];
}

export function getTransmissions(structureId: string, emmaId: string | null) {
  return [
    {
      structure_id: structureId, enfant_id: emmaId, date: todayAt(8, 45),
      contenu: "Emma a bien dormi ce matin, bonne humeur au réveil",
      auteur: "Sophie", type_transm: "ENFANT" as TypeTransmission,
    },
    {
      structure_id: structureId, enfant_id: null, date: todayAt(9, 15),
      contenu: "Livraison du traiteur retardée à 11h30 au lieu de 10h",
      auteur: "Marie", type_transm: "GENERAL" as TypeTransmission,
    },
    {
      structure_id: structureId, enfant_id: null, date: todayAt(9, 30),
      contenu: "Rappel : réunion d'équipe jeudi 18h",
      auteur: "Marie", type_transm: "EQUIPE" as TypeTransmission,
    },
  ];
}

// Nettoyage : zones Chapi Chapo complètes pour Structure 1
export const ZONES_NETTOYAGE_S1 = TACHES_NETTOYAGE_DEFAUT;

// Validations nettoyage aujourd'hui — Cuisine 8/13, Salle de change 5/12
export function getValidationsNettoyage(
  tacheIdsByCuisine: string[],
  tacheIdsByChange: string[],
  proId: string
) {
  const validations: {
    tache_id: string; date: Date; heure: Date;
    professionnel_id: string; professionnel_nom: string; observations: string | null;
  }[] = [];

  // 8 premières tâches de cuisine
  tacheIdsByCuisine.slice(0, 8).forEach((tacheId, i) => {
    const h = 7 + Math.floor(i / 2);
    const m = (i % 2) * 30;
    validations.push({
      tache_id: tacheId, date: today(), heure: todayAt(h, m),
      professionnel_id: proId, professionnel_nom: "Sophie", observations: null,
    });
  });

  // 5 premières tâches de salle de change
  tacheIdsByChange.slice(0, 5).forEach((tacheId, i) => {
    validations.push({
      tache_id: tacheId, date: today(), heure: todayAt(9 + i, 0),
      professionnel_id: proId, professionnel_nom: "Marie", observations: null,
    });
  });

  return validations;
}

// ═══ STRUCTURE 2 : Marie Dupont — Assistante Maternelle ═══

export const STRUCTURE_2 = {
  nom: "Marie Dupont — Assistante Maternelle",
  type: "ASS_MAT" as StructureType,
  adresse: "8 allée des Cerisiers",
  code_postal: "92100",
  ville: "Boulogne-Billancourt",
  telephone: "06 99 88 77 66",
  email: "marie.dupont.am@gmail.com",
  capacite_accueil: 3,
  numero_agrement: "AM-92100-2023-188",
  modules_actifs: [...PRESETS_MODULES.haccp_essentiel],
};

export const ENFANTS_S2 = [
  {
    prenom: "Alice",
    nom: "Leroy",
    date_naissance: new Date("2024-04-08"),
    sexe: "FILLE" as Sexe,
    groupe: null,
    actif: true,
    allergies: [],
    contacts: [
      { nom: "Nathalie Leroy", lien: "Mère", telephone: "06 44 55 66 77", est_autorise_recuperer: true, ordre_priorite: 1 },
      { nom: "Fabien Leroy", lien: "Père", telephone: "06 33 22 11 00", est_autorise_recuperer: true, ordre_priorite: 2 },
    ],
  },
  {
    prenom: "Tom",
    nom: "Garcia",
    date_naissance: new Date("2023-12-22"),
    sexe: "GARCON" as Sexe,
    groupe: null,
    actif: true,
    allergies: [
      { allergene: "Gluten", severite: "LEGERE" as Severite, protocole: "Éviter le pain et pâtes classiques. Alternatives sans gluten disponibles." },
    ],
    contacts: [
      { nom: "Ana Garcia", lien: "Mère", telephone: "06 22 33 44 55", est_autorise_recuperer: true, ordre_priorite: 1 },
      { nom: "Carlos Garcia", lien: "Père", telephone: "06 66 77 88 99", est_autorise_recuperer: true, ordre_priorite: 2 },
    ],
  },
];

export const EQUIPEMENTS_S2 = [
  { nom: "Frigo", type: "REFRIGERATEUR" as TypeEquipement, temperature_max: 4 },
];

export function getRelevesTemperatureS2(frigoId: string, structureId: string, proId: string) {
  const temps = [3.5, 3.8, 3.2, 3.6, 3.4, 3.7];
  const timeSlots = [
    { daysAgo: 2, hour: 8 }, { daysAgo: 2, hour: 17 },
    { daysAgo: 1, hour: 8 }, { daysAgo: 1, hour: 17 },
    { daysAgo: 0, hour: 8 }, { daysAgo: 0, hour: 17 },
  ];

  return timeSlots.map((slot, i) => {
    const dt = dateTimeAgo(slot.daysAgo, slot.hour, 0);
    return {
      structure_id: structureId, equipement_id: frigoId,
      date: dt, heure: dt, temperature: temps[i],
      conforme: true, action_corrective: null, professionnel_id: proId,
    };
  });
}

// Zones nettoyage adaptées pour ass. mat.
export const ZONES_NETTOYAGE_S2 = [
  {
    zone: "Cuisine",
    couleur_code: "#2563eb",
    taches: [
      { nom: "Plan de travail", frequence: "QUOTIDIEN" as Frequence, methode: "Nettoyage après chaque utilisation", produit: "Vinaigre blanc" },
      { nom: "Réfrigérateur", frequence: "QUOTIDIEN" as Frequence, methode: "Nettoyage quotidien", produit: "Vinaigre blanc" },
      { nom: "Évier", frequence: "QUOTIDIEN" as Frequence, methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Sol cuisine", frequence: "QUOTIDIEN" as Frequence, methode: "Nettoyage complet", produit: "Serpillère + détergent" },
      { nom: "Poubelles", frequence: "QUOTIDIEN" as Frequence, methode: "Vidange et nettoyage", produit: "Vinaigre blanc" },
    ],
  },
  {
    zone: "Salon / Espace jeux",
    couleur_code: "#27AE60",
    taches: [
      { nom: "Tapis de jeux", frequence: "QUOTIDIEN" as Frequence, methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Jouets", frequence: "HEBDO" as Frequence, methode: "Nettoyage complet", produit: "Vinaigre blanc ou lessive" },
      { nom: "Sol salon", frequence: "QUOTIDIEN" as Frequence, methode: "Aspiration + serpillère" },
    ],
  },
  {
    zone: "Espace change",
    couleur_code: "#AF7AC5",
    taches: [
      { nom: "Matelas de change", frequence: "APRES_UTILISATION" as Frequence, methode: "Nettoyage après chaque change", produit: "Vinaigre blanc" },
      { nom: "Poubelle couches", frequence: "QUOTIDIEN" as Frequence, methode: "Vidange quotidienne" },
      { nom: "Sol espace change", frequence: "QUOTIDIEN" as Frequence, methode: "Nettoyage complet", produit: "Serpillère + détergent" },
    ],
  },
];
