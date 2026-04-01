// Types utilitaires partagés entre frontend et backend
// Les types Prisma sont générés automatiquement via `prisma generate`

/** Résultat standard d'une Server Action */
export type ActionResult<T = undefined> = {
  success: true;
  data?: T;
} | {
  success: false;
  error: string;
};

/** Enfant avec ses allergies (pour BadgeAllergie) */
export interface EnfantAvecAllergies {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: Date;
  sexe?: "FILLE" | "GARCON" | null;
  groupe?: string | null;
  photo_url?: string | null;
  actif: boolean;
  allergies: {
    id: string;
    allergene: string;
    severite: "LEGERE" | "MODEREE" | "SEVERE";
    protocole?: string | null;
    document_pai?: string | null;
  }[];
}

/** Contact d'urgence */
export interface ContactUrgenceData {
  id: string;
  nom: string;
  lien: string;
  telephone: string;
  est_autorise_recuperer: boolean;
  ordre_priorite: number;
}

/** Structure simplifiée pour le sélecteur */
export interface StructureResume {
  id: string;
  nom: string;
  type: "CRECHE" | "MICRO_CRECHE" | "MAM" | "ASS_MAT";
}

/** Rôle de l'utilisateur dans la structure active */
export type RoleUtilisateur = "GESTIONNAIRE" | "PROFESSIONNEL" | "PARENT";
