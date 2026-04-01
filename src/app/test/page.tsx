"use client";

import { PastilleStatut } from "@/components/shared/pastille-statut";
import { BadgeAllergie } from "@/components/shared/badge-allergie";
import { BoutonAction } from "@/components/shared/bouton-action";
import { ThermometerSun, Baby, ClipboardCheck } from "lucide-react";

const enfantAllergie = {
  prenom: "Emma",
  allergies: [
    { allergene: "Protéines de lait de vache", severite: "SEVERE" as const },
    { allergene: "Œuf", severite: "MODEREE" as const },
  ],
};

const enfantSansAllergie = {
  prenom: "Lucas",
  allergies: [],
};

export default function TestPage() {
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-petitsafe-primary">
        PetitSafe — Test Composants Phase 0
      </h1>

      {/* PastilleStatut */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">PastilleStatut</h2>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <PastilleStatut status="conforme" />
            Conforme
          </span>
          <span className="flex items-center gap-2">
            <PastilleStatut status="attention" />
            Attention
          </span>
          <span className="flex items-center gap-2">
            <PastilleStatut status="alerte" />
            Alerte
          </span>
        </div>
      </section>

      {/* BadgeAllergie */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">BadgeAllergie</h2>
        <p className="text-sm text-gray-500">Enfant avec allergies :</p>
        <BadgeAllergie enfant={enfantAllergie} />
        <p className="text-sm text-gray-500 mt-4">Enfant sans allergie (rien ne s&apos;affiche) :</p>
        <BadgeAllergie enfant={enfantSansAllergie} />
      </section>

      {/* BoutonAction */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">BoutonAction</h2>
        <div className="flex flex-wrap gap-3">
          <BoutonAction
            label="Température"
            icon={ThermometerSun}
            variant="primary"
            onClick={() => alert("Température")}
          />
          <BoutonAction
            label="Enfants"
            icon={Baby}
            variant="secondary"
            onClick={() => alert("Enfants")}
          />
          <BoutonAction
            label="Supprimer"
            icon={ClipboardCheck}
            variant="danger"
            onClick={() => alert("Supprimer")}
          />
          <BoutonAction
            label="Annuler"
            variant="ghost"
            size="md"
            onClick={() => alert("Annuler")}
          />
          <BoutonAction
            label="Désactivé"
            variant="primary"
            disabled
          />
        </div>
      </section>

      <p className="text-sm text-gray-400 pt-8 border-t">
        Cette page est temporaire — elle sert à valider le rendu des composants fondation (Phase 0).
      </p>
    </div>
  );
}
