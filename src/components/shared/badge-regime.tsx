"use client";

import { Leaf } from "lucide-react";

interface EnfantAvecRegimes {
  prenom: string;
  regimes: string[];
}

/**
 * Bandeau bleu permanent affiché si l'enfant a au moins 1 régime alimentaire.
 * IMPOSSIBLE à masquer, réduire ou fermer.
 */
export function BadgeRegime({ enfant }: { enfant: EnfantAvecRegimes }) {
  if (enfant.regimes.length === 0) return null;

  return (
    <div
      className="w-full rounded-lg bg-blue-50 border-2 border-blue-400 px-4 py-3 flex items-start gap-3"
      role="status"
    >
      <Leaf
        className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="text-sm font-semibold text-blue-800">
        <span className="uppercase tracking-wide">Régimes : </span>
        <span>{enfant.regimes.join(", ")}</span>
      </div>
    </div>
  );
}
