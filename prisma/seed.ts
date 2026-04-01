// PetitSafe — Seed script Phase 7
// Injecte des données réalistes pour les démos

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ═══ HELPERS ═══

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateTimeAgo(daysAgo: number, hours: number, minutes: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function todayAt(hours: number, minutes: number): Date {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Fake Supabase user ID — use a consistent UUID for the seed pro
const PRO_ID_1 = "00000000-0000-0000-0000-000000000001";
const PRO_ID_2 = "00000000-0000-0000-0000-000000000002";

async function main() {
  console.log("🌱 Seed PetitSafe — Phase 7 : données réalistes");

  // Clean existing data
  console.log("🗑️  Nettoyage des données existantes...");
  await prisma.validationNettoyage.deleteMany();
  await prisma.tacheNettoyage.deleteMany();
  await prisma.zoneNettoyage.deleteMany();
  await prisma.mouvementStock.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.transmission.deleteMany();
  await prisma.repas.deleteMany();
  await prisma.biberon.deleteMany();
  await prisma.change.deleteMany();
  await prisma.sieste.deleteMany();
  await prisma.relevePlat.deleteMany();
  await prisma.releveTemperature.deleteMany();
  await prisma.equipement.deleteMany();
  await prisma.receptionMarchandise.deleteMany();
  await prisma.contactUrgence.deleteMany();
  await prisma.allergieEnfant.deleteMany();
  await prisma.enfant.deleteMany();
  await prisma.userStructure.deleteMany();
  await prisma.exportPDF.deleteMany();
  await prisma.protocole.deleteMany();
  await prisma.demandeDemo.deleteMany();
  await prisma.structure.deleteMany();

  // ═══════════════════════════════════════════════════════
  // STRUCTURE 1 : Les Petits Explorateurs (Micro-crèche)
  // ═══════════════════════════════════════════════════════
  console.log("🏠 Création Structure 1 : Les Petits Explorateurs...");

  const s1 = await prisma.structure.create({
    data: {
      nom: "Les Petits Explorateurs",
      type: "MICRO_CRECHE",
      adresse: "15 rue des Lilas",
      code_postal: "75011",
      ville: "Paris",
      telephone: "01 43 55 12 34",
      email: "contact@petits-explorateurs.fr",
      capacite_accueil: 10,
      numero_agrement: "MC-75011-2024-042",
      modules_actifs: ["temperatures", "tracabilite", "nettoyage", "biberonnerie", "repas", "changes", "siestes", "transmissions", "stocks", "protocoles"],
    },
  });

  // UserStructure — lie le fake user à la structure
  await prisma.userStructure.create({
    data: { user_id: PRO_ID_1, structure_id: s1.id, role: "GESTIONNAIRE" },
  });

  // ═══ ENFANTS S1 ═══
  console.log("👶 Création des enfants S1...");

  const emma = await prisma.enfant.create({
    data: {
      structure_id: s1.id, prenom: "Emma", nom: "Martin",
      date_naissance: new Date("2024-03-15"), sexe: "FILLE", groupe: "Bébés", actif: true,
      allergies: { create: [{ allergene: "Protéines de lait de vache", severite: "SEVERE", protocole: "Lait maternel exclusivement. Aucun produit laitier. PAI signé." }] },
      contacts: { create: [
        { nom: "Claire Martin", lien: "Mère", telephone: "06 12 34 56 78", est_autorise_recuperer: true, ordre_priorite: 1 },
        { nom: "Thomas Martin", lien: "Père", telephone: "06 23 45 67 89", est_autorise_recuperer: true, ordre_priorite: 2 },
      ] },
    },
  });

  const lucas = await prisma.enfant.create({
    data: {
      structure_id: s1.id, prenom: "Lucas", nom: "Dubois",
      date_naissance: new Date("2023-08-02"), sexe: "GARCON", groupe: "Moyens", actif: true,
      contacts: { create: [
        { nom: "Sophie Dubois", lien: "Mère", telephone: "06 34 56 78 90", est_autorise_recuperer: true, ordre_priorite: 1 },
        { nom: "Pierre Dubois", lien: "Père", telephone: "06 45 67 89 01", est_autorise_recuperer: true, ordre_priorite: 2 },
      ] },
    },
  });

  const chloe = await prisma.enfant.create({
    data: {
      structure_id: s1.id, prenom: "Chloé", nom: "Bernard",
      date_naissance: new Date("2023-11-20"), sexe: "FILLE", groupe: "Moyens", actif: true,
      allergies: { create: [{ allergene: "Oeuf", severite: "MODEREE", protocole: "Éviter oeufs crus et peu cuits. Tolérance oeufs bien cuits à confirmer avec allergologue." }] },
      contacts: { create: [
        { nom: "Marie Bernard", lien: "Mère", telephone: "06 56 78 90 12", est_autorise_recuperer: true, ordre_priorite: 1 },
        { nom: "Jean Bernard", lien: "Père", telephone: "06 67 89 01 23", est_autorise_recuperer: true, ordre_priorite: 2 },
      ] },
    },
  });

  const noah = await prisma.enfant.create({
    data: {
      structure_id: s1.id, prenom: "Noah", nom: "Petit",
      date_naissance: new Date("2024-01-05"), sexe: "GARCON", groupe: "Bébés", actif: true,
      contacts: { create: [
        { nom: "Laura Petit", lien: "Mère", telephone: "06 78 90 12 34", est_autorise_recuperer: true, ordre_priorite: 1 },
        { nom: "Marc Petit", lien: "Père", telephone: "06 89 01 23 45", est_autorise_recuperer: true, ordre_priorite: 2 },
      ] },
    },
  });

  const lea = await prisma.enfant.create({
    data: {
      structure_id: s1.id, prenom: "Léa", nom: "Moreau",
      date_naissance: new Date("2023-06-12"), sexe: "FILLE", groupe: "Grands", actif: true,
      allergies: { create: [{ allergene: "Arachide", severite: "SEVERE", protocole: "Éviction totale arachide et fruits à coque. Stylo auto-injecteur dans trousse de secours. PAI signé." }] },
      contacts: { create: [
        { nom: "Julie Moreau", lien: "Mère", telephone: "06 90 12 34 56", est_autorise_recuperer: true, ordre_priorite: 1 },
        { nom: "David Moreau", lien: "Père", telephone: "06 01 23 45 67", est_autorise_recuperer: true, ordre_priorite: 2 },
      ] },
    },
  });

  const hugo = await prisma.enfant.create({
    data: {
      structure_id: s1.id, prenom: "Hugo", nom: "Laurent",
      date_naissance: new Date("2023-09-30"), sexe: "GARCON", groupe: "Moyens", actif: true,
      contacts: { create: [
        { nom: "Camille Laurent", lien: "Mère", telephone: "06 11 22 33 44", est_autorise_recuperer: true, ordre_priorite: 1 },
        { nom: "Romain Laurent", lien: "Père", telephone: "06 55 66 77 88", est_autorise_recuperer: true, ordre_priorite: 2 },
      ] },
    },
  });

  // ═══ ÉQUIPEMENTS S1 ═══
  console.log("🌡️  Création des équipements S1...");

  const frigoCuisine = await prisma.equipement.create({
    data: { structure_id: s1.id, nom: "Frigo cuisine", type: "REFRIGERATEUR", temperature_max: 4 },
  });
  const frigoBib = await prisma.equipement.create({
    data: { structure_id: s1.id, nom: "Frigo biberonnerie", type: "REFRIGERATEUR", temperature_max: 4 },
  });
  const congelateur = await prisma.equipement.create({
    data: { structure_id: s1.id, nom: "Congélateur", type: "CONGELATEUR", temperature_max: -18 },
  });

  // ═══ RELEVÉS TEMPÉRATURE S1 ═══
  console.log("🌡️  Insertion des relevés température S1...");

  const frigoCuisineTemps = [3.2, 3.5, 3.8, 3.1, 5.2, 3.6];
  const frigoBibTemps = [2.8, 3.0, 2.9, 3.1, 2.7, 3.0];
  const congelateurTemps = [-20, -19, -21, -19, -20, -19];
  const timeSlots = [
    { daysAgo: 2, hour: 8 }, { daysAgo: 2, hour: 17 },
    { daysAgo: 1, hour: 8 }, { daysAgo: 1, hour: 17 },
    { daysAgo: 0, hour: 8 }, { daysAgo: 0, hour: 17 },
  ];

  for (let i = 0; i < timeSlots.length; i++) {
    const slot = timeSlots[i];
    const dt = dateTimeAgo(slot.daysAgo, slot.hour, 0);
    const tempC = frigoCuisineTemps[i];

    await prisma.releveTemperature.create({
      data: {
        structure_id: s1.id, equipement_id: frigoCuisine.id,
        date: dt, heure: dt, temperature: tempC, conforme: tempC <= 4,
        action_corrective: tempC > 4 ? "Vérification joint de porte. Nettoyage grille arrière. Température revenue à 3.6°C après 45 min." : null,
        professionnel_id: PRO_ID_1,
      },
    });
    await prisma.releveTemperature.create({
      data: {
        structure_id: s1.id, equipement_id: frigoBib.id,
        date: dt, heure: dt, temperature: frigoBibTemps[i], conforme: true,
        action_corrective: null, professionnel_id: PRO_ID_1,
      },
    });
    await prisma.releveTemperature.create({
      data: {
        structure_id: s1.id, equipement_id: congelateur.id,
        date: dt, heure: dt, temperature: congelateurTemps[i], conforme: true,
        action_corrective: null, professionnel_id: PRO_ID_1,
      },
    });
  }

  // ═══ RELEVÉS PLAT S1 ═══
  console.log("🍽️  Insertion des relevés plat S1...");

  await prisma.relevePlat.createMany({
    data: [
      {
        structure_id: s1.id, date: dateTimeAgo(1, 12, 0),
        nom_plat: "Purée carottes", temperature_avant: 8, heure_avant: dateTimeAgo(1, 11, 30),
        temperature_apres: 68, heure_apres: dateTimeAgo(1, 12, 0),
        conforme: true, action_corrective: null, professionnel_id: PRO_ID_1,
      },
      {
        structure_id: s1.id, date: dateTimeAgo(1, 12, 15),
        nom_plat: "Poulet haché", temperature_avant: 6, heure_avant: dateTimeAgo(1, 11, 45),
        temperature_apres: 72, heure_apres: dateTimeAgo(1, 12, 15),
        conforme: true, action_corrective: null, professionnel_id: PRO_ID_1,
      },
      {
        structure_id: s1.id, date: dateTimeAgo(0, 12, 0),
        nom_plat: "Compote pommes", temperature_avant: 10, heure_avant: dateTimeAgo(0, 11, 30),
        temperature_apres: 58, heure_apres: dateTimeAgo(0, 12, 0),
        conforme: false, action_corrective: "Remise en chauffe 5 min supplémentaires, T° finale 65°C",
        professionnel_id: PRO_ID_1,
      },
    ],
  });

  // ═══ RÉCEPTIONS / TRAÇABILITÉ S1 ═══
  console.log("📦 Insertion des réceptions S1...");

  await prisma.receptionMarchandise.createMany({
    data: [
      {
        structure_id: s1.id, date: dateTimeAgo(5, 9, 0),
        fournisseur: "Pharmacie du Parc", nom_produit: "Lait 1er âge Gallia",
        numero_lot: "G2024-1150", dlc: daysFromNow(15),
        emballage_conforme: true, conforme: true, professionnel_id: PRO_ID_1,
      },
      {
        structure_id: s1.id, date: dateTimeAgo(10, 10, 0),
        fournisseur: "Les Jardins de Marie", nom_produit: "Purée de carottes bio",
        numero_lot: "BIO-8834", dlc: daysFromNow(1),
        temperature_reception: 5.0, emballage_conforme: true, conforme: true, professionnel_id: PRO_ID_1,
      },
      {
        structure_id: s1.id, date: dateTimeAgo(8, 9, 30),
        fournisseur: "Fromagerie Dupont", nom_produit: "Yaourt nature",
        numero_lot: "YN-2266", dlc: daysFromNow(2),
        temperature_reception: 4.0, emballage_conforme: true, conforme: true, professionnel_id: PRO_ID_1,
      },
      {
        structure_id: s1.id, date: dateTimeAgo(3, 10, 0),
        fournisseur: "Les Jardins de Marie", nom_produit: "Compote de pommes",
        numero_lot: "CP-445", dlc: daysFromNow(20),
        emballage_conforme: true, conforme: true, professionnel_id: PRO_ID_1,
      },
      {
        structure_id: s1.id, date: dateTimeAgo(15, 8, 0),
        fournisseur: "Boucherie Martin", nom_produit: "Poulet haché surgelé",
        numero_lot: "PH-112", dlc: daysFromNow(90),
        temperature_reception: -19.0, emballage_conforme: true, conforme: true, professionnel_id: PRO_ID_1,
      },
    ],
  });

  // ═══ STOCKS CONSOMMABLES S1 ═══
  console.log("📊 Insertion des stocks S1...");

  const now = new Date();
  await prisma.stock.createMany({
    data: [
      { structure_id: s1.id, categorie: "COUCHES", produit_nom: "Couches taille 3", quantite: 45, unite: "paquets", seuil_alerte: 10, derniere_maj: now, maj_par: PRO_ID_1 },
      { structure_id: s1.id, categorie: "COUCHES", produit_nom: "Couches taille 4", quantite: 8, unite: "paquets", seuil_alerte: 10, derniere_maj: now, maj_par: PRO_ID_1 },
      { structure_id: s1.id, categorie: "ENTRETIEN", produit_nom: "Vinaigre blanc 5L", quantite: 2, unite: "bidons", seuil_alerte: 3, derniere_maj: now, maj_par: PRO_ID_1 },
      { structure_id: s1.id, categorie: "LAIT", produit_nom: "Lait Gallia 1er âge", quantite: 4, unite: "boîtes", seuil_alerte: 2, derniere_maj: now, maj_par: PRO_ID_1 },
      { structure_id: s1.id, categorie: "COMPOTES", produit_nom: "Compotes pommes bio", quantite: 12, unite: "pots", seuil_alerte: 5, derniere_maj: now, maj_par: PRO_ID_1 },
    ],
  });

  // ═══ BIBERONS S1 ═══
  console.log("🍼 Insertion des biberons S1...");

  await prisma.biberon.createMany({
    data: [
      {
        structure_id: s1.id, enfant_id: emma.id,
        date: today(), heure_preparation: todayAt(10, 15),
        type_lait: "Maternel", nom_lait: "Lait maternel", numero_lot: "N/A",
        quantite_preparee_ml: 150, heure_service: todayAt(10, 30), quantite_bue_ml: 140,
        nettoyage_effectue: true, heure_nettoyage: todayAt(10, 50),
        preparateur_nom: "Sophie", conforme_anses: true, professionnel_id: PRO_ID_1,
      },
      {
        structure_id: s1.id, enfant_id: noah.id,
        date: today(), heure_preparation: todayAt(9, 45),
        type_lait: "1er âge", nom_lait: "Gallia 1er âge", numero_lot: "G2024-1150",
        quantite_preparee_ml: 180, heure_service: todayAt(10, 0), quantite_bue_ml: 160,
        nettoyage_effectue: true, heure_nettoyage: todayAt(10, 20),
        preparateur_nom: "Sophie", conforme_anses: true, professionnel_id: PRO_ID_1,
      },
      {
        structure_id: s1.id, enfant_id: noah.id,
        date: today(), heure_preparation: todayAt(14, 30),
        type_lait: "1er âge", nom_lait: "Gallia 1er âge", numero_lot: "G2024-1150",
        quantite_preparee_ml: 180,
        nettoyage_effectue: false,
        preparateur_nom: "Marie", conforme_anses: true,
        observations: "En attente de service", professionnel_id: PRO_ID_1,
      },
    ],
  });

  // ═══ REPAS S1 ═══
  console.log("🍽️  Insertion des repas S1...");

  await prisma.repas.createMany({
    data: [
      {
        structure_id: s1.id, enfant_id: lucas.id, date: today(),
        type_repas: "DEJEUNER",
        entree: "Purée carottes", entree_quantite: "TOUT",
        plat: "Poulet haché", plat_quantite: "BIEN",
        dessert: "Yaourt nature", dessert_quantite: "TOUT",
        professionnel_id: PRO_ID_1,
      },
      {
        structure_id: s1.id, enfant_id: chloe.id, date: today(),
        type_repas: "DEJEUNER",
        entree: "Purée carottes", entree_quantite: "BIEN",
        plat: "Poulet haché", plat_quantite: "PEU",
        dessert: "Compote pommes", dessert_quantite: "TOUT",
        observations: "Allergie oeuf vérifiée — menu OK",
        professionnel_id: PRO_ID_1,
      },
      {
        structure_id: s1.id, enfant_id: hugo.id, date: today(),
        type_repas: "DEJEUNER",
        entree: "Purée carottes", entree_quantite: "TOUT",
        plat: "Steak haché boeuf", plat_quantite: "RIEN",
        dessert: "Yaourt nature", dessert_quantite: "TOUT",
        observations: "Régime sans porc respecté — pas de jambon",
        professionnel_id: PRO_ID_1,
      },
      {
        structure_id: s1.id, enfant_id: lea.id, date: today(),
        type_repas: "DEJEUNER",
        entree: "Purée carottes", entree_quantite: "BIEN",
        plat: "Poulet haché", plat_quantite: "BIEN",
        dessert: "Compote pommes", dessert_quantite: "TOUT",
        observations: "Allergie arachide vérifiée — menu OK",
        professionnel_id: PRO_ID_1,
      },
    ],
  });

  // ═══ TRANSMISSIONS S1 ═══
  console.log("💬 Insertion des transmissions S1...");

  await prisma.transmission.createMany({
    data: [
      { structure_id: s1.id, enfant_id: emma.id, date: todayAt(8, 45), contenu: "Emma a bien dormi ce matin, bonne humeur au réveil", auteur: "Sophie", type_transm: "ENFANT" },
      { structure_id: s1.id, enfant_id: null, date: todayAt(9, 15), contenu: "Livraison du traiteur retardée à 11h30 au lieu de 10h", auteur: "Marie", type_transm: "GENERAL" },
      { structure_id: s1.id, enfant_id: null, date: todayAt(9, 30), contenu: "Rappel : réunion d'équipe jeudi 18h", auteur: "Marie", type_transm: "EQUIPE" },
    ],
  });

  // ═══ ZONES NETTOYAGE S1 (Chapi Chapo) ═══
  console.log("🧹 Insertion des zones nettoyage S1...");

  const TACHES_DEFAUT = [
    {
      zone: "Cuisine", couleur_code: "#2E86C1",
      taches: [
        { nom: "Plan de travail", frequence: "BIQUOTIDIEN" as const, methode: "Nettoyage après chaque utilisation + soir", produit: "Vinaigre blanc + détergent le soir" },
        { nom: "Évier", frequence: "QUOTIDIEN" as const, methode: "Nettoyage complet", produit: "Vinaigre blanc" },
        { nom: "Réfrigérateur", frequence: "QUOTIDIEN" as const, methode: "Nettoyage quotidien + 1/sem profond", produit: "Vinaigre blanc" },
        { nom: "Micro-onde", frequence: "QUOTIDIEN" as const, methode: "Nettoyage intérieur/extérieur", produit: "Vinaigre blanc" },
        { nom: "Chauffe-biberon", frequence: "HEBDO" as const, methode: "Détartrage et nettoyage", produit: "Vinaigre blanc" },
        { nom: "Lave-vaisselle", frequence: "MENSUEL" as const, methode: "Nettoyage complet", produit: "Produit nettoyant" },
        { nom: "Poubelles", frequence: "QUOTIDIEN" as const, methode: "Vidange et nettoyage", produit: "Vinaigre blanc ou savon noir" },
        { nom: "Sol cuisine", frequence: "BIQUOTIDIEN" as const, methode: "Nettoyage midi + soir", produit: "Lingettes agglutinantes + nettoyeur vapeur" },
        { nom: "Placards", frequence: "MENSUEL" as const, methode: "Nettoyage intérieur/extérieur", produit: "Vinaigre blanc" },
        { nom: "Vaisselle", frequence: "APRES_UTILISATION" as const, methode: "Lave-vaisselle après chaque utilisation" },
        { nom: "Sonde température", frequence: "APRES_UTILISATION" as const, methode: "Nettoyage après chaque utilisation", produit: "Vinaigre blanc" },
        { nom: "Paillasson", frequence: "HEBDO" as const, methode: "Lavage machine 60°" },
        { nom: "Gestion déchets", frequence: "QUOTIDIEN" as const, methode: "Compost + poubelle + tri après chaque repas" },
      ],
    },
    {
      zone: "Salle de change", couleur_code: "#AF7AC5",
      taches: [
        { nom: "Plan de change", frequence: "BIQUOTIDIEN" as const, methode: "Nettoyage midi + soir", produit: "Vinaigre blanc midi / détergent soir" },
        { nom: "Matelas de change", frequence: "BIQUOTIDIEN" as const, methode: "Nettoyage midi + soir", produit: "Vinaigre blanc midi / détergent soir" },
        { nom: "Pot", frequence: "APRES_UTILISATION" as const, methode: "Nettoyage après chaque utilisation", produit: "Vinaigre blanc + essuie-main" },
        { nom: "WC enfant", frequence: "QUOTIDIEN" as const, methode: "Nettoyage tous les soirs", produit: "Vinaigre blanc" },
        { nom: "Lavabo", frequence: "QUOTIDIEN" as const, methode: "Nettoyage complet", produit: "Vinaigre blanc" },
        { nom: "Bannettes enfant", frequence: "HEBDO" as const, methode: "Nettoyage complet", produit: "Vinaigre blanc" },
        { nom: "Panier coton/produits hygiène", frequence: "HEBDO" as const, methode: "Nettoyage complet", produit: "Vinaigre blanc" },
        { nom: "Boîte lingettes lavables sales", frequence: "BIQUOTIDIEN" as const, methode: "Vidage midi + soir", produit: "Vinaigre blanc" },
        { nom: "Serviettes enfants", frequence: "HEBDO" as const, methode: "Lavage machine 60°" },
        { nom: "Poignées et portes", frequence: "QUOTIDIEN" as const, methode: "Nettoyage tous les soirs", produit: "Vinaigre blanc" },
        { nom: "Poubelles salle de change", frequence: "BIQUOTIDIEN" as const, methode: "Vidage midi + soir", produit: "Vinaigre blanc" },
        { nom: "Sol salle de change", frequence: "QUOTIDIEN" as const, methode: "Nettoyage tous les soirs", produit: "Lingettes agglutinantes + nettoyeur vapeur" },
      ],
    },
    {
      zone: "Coin repas / Activités", couleur_code: "#F4A261",
      taches: [
        { nom: "Tables dessus/dessous", frequence: "BIQUOTIDIEN" as const, methode: "Après repas midi + goûter", produit: "Vinaigre blanc + détergent le soir" },
        { nom: "Chaises", frequence: "BIQUOTIDIEN" as const, methode: "Après repas midi + goûter", produit: "Vinaigre blanc" },
        { nom: "Sol coin repas", frequence: "QUOTIDIEN" as const, methode: "Nettoyage complet", produit: "Nettoyeur vapeur" },
      ],
    },
    {
      zone: "Salle d'éveil", couleur_code: "#27AE60",
      taches: [
        { nom: "Tapis", frequence: "QUOTIDIEN" as const, methode: "Nettoyage complet", produit: "Nettoyeur vapeur" },
        { nom: "Sol salle d'éveil", frequence: "QUOTIDIEN" as const, methode: "Nettoyage tous les soirs", produit: "Lingettes agglutinantes + nettoyeur vapeur" },
      ],
    },
    {
      zone: "Chambres", couleur_code: "#8E44AD",
      taches: [
        { nom: "Sol chambres", frequence: "HEBDO" as const, methode: "Nettoyage complet", produit: "Lingettes agglutinantes + nettoyeur vapeur" },
      ],
    },
  ];

  const cuisineTacheIds: string[] = [];
  const changeTacheIds: string[] = [];

  for (let zIdx = 0; zIdx < TACHES_DEFAUT.length; zIdx++) {
    const zoneData = TACHES_DEFAUT[zIdx];
    const zone = await prisma.zoneNettoyage.create({
      data: {
        structure_id: s1.id, nom: zoneData.zone, couleur_code: zoneData.couleur_code, ordre: zIdx,
      },
    });

    for (const t of zoneData.taches) {
      const tache = await prisma.tacheNettoyage.create({
        data: { zone_id: zone.id, nom: t.nom, frequence: t.frequence, methode: t.methode, produit: t.produit ?? null },
      });
      if (zoneData.zone === "Cuisine") cuisineTacheIds.push(tache.id);
      if (zoneData.zone === "Salle de change") changeTacheIds.push(tache.id);
    }
  }

  // ═══ VALIDATIONS NETTOYAGE S1 ═══
  console.log("✅ Insertion des validations nettoyage S1...");

  // Cuisine : 8/13 tâches
  for (let i = 0; i < Math.min(8, cuisineTacheIds.length); i++) {
    await prisma.validationNettoyage.create({
      data: {
        tache_id: cuisineTacheIds[i], date: today(),
        heure: todayAt(7 + Math.floor(i / 2), (i % 2) * 30),
        professionnel_id: PRO_ID_1, professionnel_nom: "Sophie",
      },
    });
  }

  // Salle de change : 5/12 tâches
  for (let i = 0; i < Math.min(5, changeTacheIds.length); i++) {
    await prisma.validationNettoyage.create({
      data: {
        tache_id: changeTacheIds[i], date: today(),
        heure: todayAt(9 + i, 0),
        professionnel_id: PRO_ID_1, professionnel_nom: "Marie",
      },
    });
  }

  // ═══════════════════════════════════════════════════════
  // STRUCTURE 2 : Marie Dupont — Assistante Maternelle
  // ═══════════════════════════════════════════════════════
  console.log("🏠 Création Structure 2 : Marie Dupont — Assistante Maternelle...");

  const s2 = await prisma.structure.create({
    data: {
      nom: "Marie Dupont — Assistante Maternelle",
      type: "ASS_MAT",
      adresse: "8 allée des Cerisiers",
      code_postal: "92100",
      ville: "Boulogne-Billancourt",
      telephone: "06 99 88 77 66",
      email: "marie.dupont.am@gmail.com",
      capacite_accueil: 3,
      numero_agrement: "AM-92100-2023-188",
      modules_actifs: ["temperatures", "tracabilite", "nettoyage", "biberonnerie"],
    },
  });

  await prisma.userStructure.create({
    data: { user_id: PRO_ID_2, structure_id: s2.id, role: "GESTIONNAIRE" },
  });
  // Same user also has access to S1 as gestionnaire
  await prisma.userStructure.create({
    data: { user_id: PRO_ID_2, structure_id: s1.id, role: "GESTIONNAIRE" },
  });

  // ═══ ENFANTS S2 ═══
  console.log("👶 Création des enfants S2...");

  await prisma.enfant.create({
    data: {
      structure_id: s2.id, prenom: "Alice", nom: "Leroy",
      date_naissance: new Date("2024-04-08"), sexe: "FILLE", actif: true,
      contacts: { create: [
        { nom: "Nathalie Leroy", lien: "Mère", telephone: "06 44 55 66 77", est_autorise_recuperer: true, ordre_priorite: 1 },
        { nom: "Fabien Leroy", lien: "Père", telephone: "06 33 22 11 00", est_autorise_recuperer: true, ordre_priorite: 2 },
      ] },
    },
  });

  await prisma.enfant.create({
    data: {
      structure_id: s2.id, prenom: "Tom", nom: "Garcia",
      date_naissance: new Date("2023-12-22"), sexe: "GARCON", actif: true,
      allergies: { create: [{ allergene: "Gluten", severite: "LEGERE", protocole: "Éviter le pain et pâtes classiques. Alternatives sans gluten disponibles." }] },
      contacts: { create: [
        { nom: "Ana Garcia", lien: "Mère", telephone: "06 22 33 44 55", est_autorise_recuperer: true, ordre_priorite: 1 },
        { nom: "Carlos Garcia", lien: "Père", telephone: "06 66 77 88 99", est_autorise_recuperer: true, ordre_priorite: 2 },
      ] },
    },
  });

  // ═══ ÉQUIPEMENT S2 ═══
  const frigoS2 = await prisma.equipement.create({
    data: { structure_id: s2.id, nom: "Frigo", type: "REFRIGERATEUR", temperature_max: 4 },
  });

  // ═══ RELEVÉS TEMPÉRATURE S2 ═══
  console.log("🌡️  Insertion des relevés température S2...");

  const tempsS2 = [3.5, 3.8, 3.2, 3.6, 3.4, 3.7];
  for (let i = 0; i < timeSlots.length; i++) {
    const slot = timeSlots[i];
    const dt = dateTimeAgo(slot.daysAgo, slot.hour, 0);
    await prisma.releveTemperature.create({
      data: {
        structure_id: s2.id, equipement_id: frigoS2.id,
        date: dt, heure: dt, temperature: tempsS2[i], conforme: true,
        professionnel_id: PRO_ID_2,
      },
    });
  }

  // ═══ ZONES NETTOYAGE S2 ═══
  console.log("🧹 Insertion des zones nettoyage S2...");

  const zonesS2 = [
    {
      zone: "Cuisine", couleur_code: "#2E86C1",
      taches: [
        { nom: "Plan de travail", frequence: "QUOTIDIEN" as const, methode: "Nettoyage après chaque utilisation", produit: "Vinaigre blanc" },
        { nom: "Réfrigérateur", frequence: "QUOTIDIEN" as const, methode: "Nettoyage quotidien", produit: "Vinaigre blanc" },
        { nom: "Évier", frequence: "QUOTIDIEN" as const, methode: "Nettoyage complet", produit: "Vinaigre blanc" },
        { nom: "Sol cuisine", frequence: "QUOTIDIEN" as const, methode: "Nettoyage complet", produit: "Serpillère + détergent" },
        { nom: "Poubelles", frequence: "QUOTIDIEN" as const, methode: "Vidange et nettoyage", produit: "Vinaigre blanc" },
      ],
    },
    {
      zone: "Salon / Espace jeux", couleur_code: "#27AE60",
      taches: [
        { nom: "Tapis de jeux", frequence: "QUOTIDIEN" as const, methode: "Nettoyage complet", produit: "Vinaigre blanc" },
        { nom: "Jouets", frequence: "HEBDO" as const, methode: "Nettoyage complet", produit: "Vinaigre blanc ou lessive" },
        { nom: "Sol salon", frequence: "QUOTIDIEN" as const, methode: "Aspiration + serpillère" },
      ],
    },
    {
      zone: "Espace change", couleur_code: "#AF7AC5",
      taches: [
        { nom: "Matelas de change", frequence: "APRES_UTILISATION" as const, methode: "Nettoyage après chaque change", produit: "Vinaigre blanc" },
        { nom: "Poubelle couches", frequence: "QUOTIDIEN" as const, methode: "Vidange quotidienne" },
        { nom: "Sol espace change", frequence: "QUOTIDIEN" as const, methode: "Nettoyage complet", produit: "Serpillère + détergent" },
      ],
    },
  ];

  for (let zIdx = 0; zIdx < zonesS2.length; zIdx++) {
    const zoneData = zonesS2[zIdx];
    const zone = await prisma.zoneNettoyage.create({
      data: { structure_id: s2.id, nom: zoneData.zone, couleur_code: zoneData.couleur_code, ordre: zIdx },
    });
    for (const t of zoneData.taches) {
      await prisma.tacheNettoyage.create({
        data: { zone_id: zone.id, nom: t.nom, frequence: t.frequence, methode: t.methode, produit: t.produit ?? null },
      });
    }
  }

  console.log("");
  console.log("══════════════════════════════════════════════");
  console.log("✅ Seed terminé avec succès !");
  console.log("══════════════════════════════════════════════");
  console.log(`Structure 1 : "${s1.nom}" (${s1.id})`);
  console.log(`  → 6 enfants, 3 équipements, 18 relevés, 3 plats témoins`);
  console.log(`  → 5 réceptions, 5 stocks, 3 biberons, 4 repas, 3 transmissions`);
  console.log(`  → 5 zones nettoyage, 13 validations`);
  console.log(`  → Modules : TOUS (complet)`);
  console.log(`Structure 2 : "${s2.nom}" (${s2.id})`);
  console.log(`  → 2 enfants, 1 équipement, 6 relevés`);
  console.log(`  → 3 zones nettoyage`);
  console.log(`  → Modules : HACCP essentiel uniquement`);
  console.log("══════════════════════════════════════════════");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
