"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useProfil, type ProfilActif } from "@/hooks/use-profil";
import { assurerProfilAdmin } from "@/app/actions/profils";
import { Loader2 } from "lucide-react";

const COULEURS_INITIALES = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-orange-500",
];

function getInitiales(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function getCouleur(index: number) {
  return COULEURS_INITIALES[index % COULEURS_INITIALES.length];
}

function getPosteLabel(poste: string | null) {
  if (!poste) return "";
  const labels: Record<string, string> = {
    Directrice: "Directrice",
    Auxiliaire: "Auxiliaire de puériculture",
    EJE: "Éducatrice de jeunes enfants",
    Stagiaire: "Stagiaire",
    Agent: "Agent",
    Autre: "Autre",
  };
  return labels[poste] || poste;
}

interface SelectProfilProps {
  structureId: string;
  userPrenom: string;
  userNom: string;
  children: ReactNode;
}

export function SelectProfil({ structureId, userPrenom, userNom, children }: SelectProfilProps) {
  const { profil, profils, loading, selectProfil, needsSelection, refreshProfils } = useProfil();
  const [initializing, setInitializing] = useState(true);

  // Auto-créer le profil admin si c'est la première fois
  useEffect(() => {
    const init = async () => {
      if (!structureId || !userPrenom) {
        setInitializing(false);
        return;
      }
      try {
        const result = await assurerProfilAdmin(structureId, userPrenom, userNom || userPrenom);
        if (result.success && result.created) {
          await refreshProfils();
        }
      } catch (e) {
        console.error("[SelectProfil] Erreur init:", e);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [structureId, userPrenom, userNom, refreshProfils]);

  // Chargement en cours
  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rzpanda-fond">
        <Loader2 size={32} className="animate-spin text-rzpanda-primary" />
      </div>
    );
  }

  // Profil sélectionné → afficher le dashboard
  if (profil && !needsSelection) {
    return <>{children}</>;
  }

  // Écran de sélection "Qui êtes-vous ?"
  return (
    <div className="min-h-screen flex items-center justify-center bg-rzpanda-fond p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Qui êtes-vous ?</h1>
          <p className="text-gray-500">Sélectionnez votre profil pour commencer</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {profils.map((p: ProfilActif, index: number) => (
            <button
              key={p.id}
              onClick={() => selectProfil(p)}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-rzpanda-primary hover:shadow-lg transition-all duration-200 group"
            >
              <div
                className={`w-16 h-16 rounded-full ${getCouleur(index)} flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform`}
              >
                {getInitiales(p.prenom, p.nom)}
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{p.prenom}</div>
                {p.poste && (
                  <div className="text-xs text-gray-500 mt-0.5">{getPosteLabel(p.poste)}</div>
                )}
                {p.role === "ADMINISTRATEUR" && (
                  <span className="inline-block mt-1 text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
