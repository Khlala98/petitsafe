"use client";

import { AlertTriangle } from "lucide-react";

interface Allergie {
  allergene: string;
  severite: "LEGERE" | "MODEREE" | "SEVERE";
}

interface EnfantAvecAllergies {
  prenom: string;
  allergies: Allergie[];
}

const SEVERITE_LABELS: Record<string, string> = {
  LEGERE: "Légère",
  MODEREE: "Modérée",
  SEVERE: "Sévère",
};

/**
 * Bandeau rouge permanent affiché si l'enfant a au moins 1 allergie.
 * IMPOSSIBLE à masquer, réduire ou fermer.
 * Présent sur : fiche enfant, liste enfants, formulaire biberon, formulaire repas,
 *               suivi du jour, vue groupe, portail parents.
 */
export function BadgeAllergie({ enfant }: { enfant: EnfantAvecAllergies }) {
  if (enfant.allergies.length === 0) return null;

  const severiteMax = enfant.allergies.reduce<string>((max, a) => {
    const ordre = { LEGERE: 0, MODEREE: 1, SEVERE: 2 };
    return ordre[a.severite as keyof typeof ordre] > ordre[max as keyof typeof ordre]
      ? a.severite
      : max;
  }, enfant.allergies[0].severite);

  const listeAllergenes = enfant.allergies.map((a) => a.allergene).join(", ");

  return (
    <div
      className="w-full rounded-lg bg-red-50 border-2 border-red-500 px-4 py-3 flex items-start gap-3"
      role="alert"
      aria-live="assertive"
    >
      <AlertTriangle
        className="h-5 w-5 text-red-600 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="text-sm font-semibold text-red-800">
        <span className="uppercase tracking-wide">⚠️ Allergies : </span>
        <span>{listeAllergenes}</span>
        <span className="ml-2 text-red-600">
          — Sévérité : {SEVERITE_LABELS[severiteMax]}
        </span>
      </div>
    </div>
  );
}
