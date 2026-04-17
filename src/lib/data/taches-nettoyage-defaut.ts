// Tâches de nettoyage pré-remplies — basées sur les documents de la Crèche Chapi Chapo (Saint Erblon)
// Injectées automatiquement à la création d'une structure.

import type { Frequence } from "@prisma/client";

export interface TacheDefaut {
  zone: string;
  couleur_code?: string;
  taches: {
    nom: string;
    frequence: Frequence;
    methode: string;
    produit?: string;
    notes?: string;
  }[];
}

export const TACHES_NETTOYAGE_DEFAUT: TacheDefaut[] = [
  {
    zone: "Cuisine",
    couleur_code: "#1e3a5f",
    taches: [
      { nom: "Plan de travail", frequence: "BIQUOTIDIEN", methode: "Nettoyage après chaque utilisation + soir", produit: "Vinaigre blanc + détergent le soir" },
      { nom: "Évier", frequence: "QUOTIDIEN", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Réfrigérateur", frequence: "QUOTIDIEN", methode: "Nettoyage quotidien + 1/sem profond", produit: "Vinaigre blanc" },
      { nom: "Micro-onde", frequence: "QUOTIDIEN", methode: "Nettoyage intérieur/extérieur", produit: "Vinaigre blanc" },
      { nom: "Chauffe-biberon", frequence: "HEBDO", methode: "Détartrage et nettoyage", produit: "Vinaigre blanc" },
      { nom: "Lave-vaisselle", frequence: "MENSUEL", methode: "Nettoyage complet", produit: "Produit nettoyant", notes: "Cycle auto 45°-65° midi, Cycle 65° 1h goûter. BIEN RINCER" },
      { nom: "Poubelles", frequence: "QUOTIDIEN", methode: "Vidange et nettoyage", produit: "Vinaigre blanc ou savon noir" },
      { nom: "Sol cuisine", frequence: "BIQUOTIDIEN", methode: "Nettoyage midi + soir", produit: "Lingettes agglutinantes + nettoyeur vapeur" },
      { nom: "Placards", frequence: "MENSUEL", methode: "Nettoyage intérieur/extérieur", produit: "Vinaigre blanc" },
      { nom: "Vaisselle", frequence: "APRES_UTILISATION", methode: "Lave-vaisselle après chaque utilisation" },
      { nom: "Sonde température", frequence: "APRES_UTILISATION", methode: "Nettoyage après chaque utilisation", produit: "Vinaigre blanc" },
      { nom: "Paillasson", frequence: "HEBDO", methode: "Lavage machine 60°", notes: "Changer le lundi soir" },
      { nom: "Gestion déchets", frequence: "QUOTIDIEN", methode: "Compost + poubelle + tri après chaque repas" },
    ],
  },
  {
    zone: "Coin repas / Activités",
    couleur_code: "#F4A261",
    taches: [
      { nom: "Tables dessus/dessous", frequence: "BIQUOTIDIEN", methode: "Après repas midi + goûter", produit: "Vinaigre blanc + détergent le soir" },
      { nom: "Chaises", frequence: "BIQUOTIDIEN", methode: "Après repas midi + goûter", produit: "Vinaigre blanc" },
      { nom: "Bassines de gants", frequence: "APRES_UTILISATION", methode: "Nettoyage après chaque utilisation", produit: "Produit vaisselle" },
      { nom: "Bavoirs et gants", frequence: "APRES_UTILISATION", methode: "Lavage machine 60°" },
      { nom: "Sol coin repas", frequence: "QUOTIDIEN", methode: "Nettoyage complet", produit: "Nettoyeur vapeur" },
      { nom: "Étagères rangement", frequence: "MENSUEL", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Séparation vitrée", frequence: "QUOTIDIEN", methode: "Nettoyage complet", produit: "Produit à vitre" },
      { nom: "Porte d'entrée", frequence: "QUOTIDIEN", methode: "Nettoyage complet", produit: "Produit à vitre" },
      { nom: "Barrières", frequence: "HEBDO", methode: "Nettoyage + vérification régulière", produit: "Vinaigre blanc" },
    ],
  },
  {
    zone: "Salle de change",
    couleur_code: "#AF7AC5",
    taches: [
      { nom: "Plan de change", frequence: "BIQUOTIDIEN", methode: "Nettoyage midi + soir", produit: "Vinaigre blanc midi / détergent soir" },
      { nom: "Matelas de change", frequence: "BIQUOTIDIEN", methode: "Nettoyage midi + soir", produit: "Vinaigre blanc midi / détergent soir" },
      { nom: "Pot", frequence: "APRES_UTILISATION", methode: "Nettoyage après chaque utilisation", produit: "Vinaigre blanc + essuie-main" },
      { nom: "WC enfant", frequence: "QUOTIDIEN", methode: "Nettoyage tous les soirs", produit: "Vinaigre blanc" },
      { nom: "Lavabo", frequence: "QUOTIDIEN", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Bannettes enfant", frequence: "HEBDO", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Panier coton/produits hygiène", frequence: "HEBDO", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Boîte lingettes lavables sales", frequence: "BIQUOTIDIEN", methode: "Vidage midi + soir", produit: "Vinaigre blanc" },
      { nom: "Serviettes enfants", frequence: "HEBDO", methode: "Lavage machine 60° (sauf si souillée : immédiat)", notes: "Enlever lundi soir, laver mardi" },
      { nom: "Poignées et portes", frequence: "QUOTIDIEN", methode: "Nettoyage tous les soirs", produit: "Vinaigre blanc" },
      { nom: "Poubelles salle de change", frequence: "BIQUOTIDIEN", methode: "Vidage midi + soir", produit: "Vinaigre blanc" },
      { nom: "Sol salle de change", frequence: "QUOTIDIEN", methode: "Nettoyage tous les soirs", produit: "Lingettes agglutinantes + nettoyeur vapeur" },
      { nom: "Gestion déchets changes", frequence: "BIQUOTIDIEN", methode: "Après changes midi + soir" },
    ],
  },
  {
    zone: "Vestiaire enfants",
    couleur_code: "#5DADE2",
    taches: [
      { nom: "Casiers", frequence: "HEBDO", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Sol vestiaire", frequence: "QUOTIDIEN", methode: "Nettoyage tous les soirs", produit: "Lingettes agglutinantes + nettoyeur vapeur" },
      { nom: "Poignées et vitres porte", frequence: "QUOTIDIEN", methode: "Nettoyage tous les soirs", produit: "Vinaigre blanc" },
      { nom: "Vitres côté intérieur", frequence: "QUOTIDIEN", methode: "Nettoyage tous les soirs", produit: "Produit lave-vitre" },
    ],
  },
  {
    zone: "Salle d'éveil",
    couleur_code: "#27AE60",
    taches: [
      { nom: "Étagères", frequence: "MENSUEL", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Structure de motricité", frequence: "MENSUEL", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Meubles salle d'éveil", frequence: "MENSUEL", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Tapis", frequence: "QUOTIDIEN", methode: "Nettoyage complet", produit: "Nettoyeur vapeur" },
      { nom: "Coin lecture tapis + canapés", frequence: "QUOTIDIEN", methode: "Vinaigre blanc canapé + nettoyeur vapeur tapis" },
      { nom: "Poubelle mouchoirs", frequence: "QUOTIDIEN", methode: "Vidage min 1/jour", produit: "Vinaigre blanc" },
      { nom: "Poignées et portes éveil", frequence: "QUOTIDIEN", methode: "Nettoyage tous les soirs", produit: "Vinaigre blanc" },
      { nom: "Barrières salle d'éveil", frequence: "MENSUEL", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Placards salle d'éveil", frequence: "MENSUEL", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Sol salle d'éveil", frequence: "QUOTIDIEN", methode: "Nettoyage tous les soirs", produit: "Lingettes agglutinantes + nettoyeur vapeur" },
      { nom: "Aération", frequence: "QUOTIDIEN", methode: "Plusieurs fois par jour", notes: "Matin, midi, après-midi minimum" },
    ],
  },
  {
    zone: "Chambres",
    couleur_code: "#8E44AD",
    taches: [
      { nom: "Lits", frequence: "MENSUEL", methode: "Nettoyage complet", produit: "Vinaigre blanc" },
      { nom: "Sol chambres", frequence: "HEBDO", methode: "Nettoyage complet", produit: "Lingettes agglutinantes + nettoyeur vapeur" },
      { nom: "Matelas", frequence: "BIMENSUEL", methode: "Nettoyage tous les 15 jours", produit: "Vinaigre blanc" },
      { nom: "Draps + couvertures/turbulettes", frequence: "BIMENSUEL", methode: "Lavage machine 60°", notes: "Planning rotation semaines paires/impaires par chambre" },
    ],
  },
  {
    zone: "Équipements & Jouets",
    couleur_code: "#E67E22",
    taches: [
      { nom: "Casiers vestiaire", frequence: "HEBDO", methode: "Nettoyage complet", produit: "Procide" },
      { nom: "Meubles", frequence: "HEBDO", methode: "Nettoyage complet", produit: "Procide" },
      { nom: "Jeux (bébés, poupées, Lego, Playmobil, dinettes, Kaplat, constructions, clipo, animaux, déguisements, etc.)", frequence: "MENSUEL", methode: "Nettoyage complet", produit: "Procide ou lessive selon l'item" },
    ],
  },
];
