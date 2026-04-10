"use client";

import { useState, type ReactNode } from "react";
import { useEffect } from "react";
import { useProfil, type ProfilActif } from "@/hooks/use-profil";
import { assurerProfilAdmin, verifierProfilPin } from "@/app/actions/profils";
import { Loader2, Lock } from "lucide-react";

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
  const [selectedProfil, setSelectedProfil] = useState<ProfilActif | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Auto-créer le profil admin si c'est la première fois, puis charger les profils
  useEffect(() => {
    const init = async () => {
      if (!structureId) {
        setInitializing(false);
        return;
      }
      try {
        console.log("[SelectProfil] init démarré, structureId:", structureId, "userPrenom:", userPrenom);
        if (userPrenom) {
          const adminResult = await assurerProfilAdmin(structureId, userPrenom, userNom || userPrenom);
          console.log("[SelectProfil] assurerProfilAdmin résultat:", JSON.stringify(adminResult));
        }
        // Toujours recharger les profils après l'init
        console.log("[SelectProfil] appel refreshProfils...");
        await refreshProfils();
        console.log("[SelectProfil] refreshProfils terminé");
      } catch (e) {
        console.error("[SelectProfil] Erreur init:", e);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [structureId, userPrenom, userNom, refreshProfils]);

  const handleSelectProfil = (p: ProfilActif) => {
    setSelectedProfil(p);
    setPin("");
    setPinError("");
  };

  const handleVerifyPin = async () => {
    if (!selectedProfil || !pin.trim()) {
      setPinError("Veuillez saisir votre mot de passe.");
      return;
    }
    setVerifying(true);
    setPinError("");

    const result = await verifierProfilPin(selectedProfil.id, pin);
    setVerifying(false);

    if (result.success) {
      selectProfil(selectedProfil);
      setSelectedProfil(null);
      setPin("");
    } else {
      setPinError(result.error || "Mot de passe incorrect.");
    }
  };

  const handleBack = () => {
    setSelectedProfil(null);
    setPin("");
    setPinError("");
  };

  // Chargement en cours
  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rzpanda-fond">
        <Loader2 size={32} className="animate-spin text-rzpanda-primary" />
      </div>
    );
  }

  // Profil sélectionné et vérifié → afficher le dashboard
  if (profil && !needsSelection) {
    return <>{children}</>;
  }

  // Étape 2 : Saisie du mot de passe après sélection d'un profil
  if (selectedProfil) {
    const profilIndex = profils.findIndex((p) => p.id === selectedProfil.id);

    return (
      <div className="min-h-screen flex items-center justify-center bg-rzpanda-fond p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 rounded-full ${getCouleur(profilIndex)} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}
            >
              {getInitiales(selectedProfil.prenom, selectedProfil.nom)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedProfil.prenom} {selectedProfil.nom}</h1>
            {selectedProfil.poste && (
              <p className="text-gray-500 text-sm">{getPosteLabel(selectedProfil.poste)}</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock size={14} className="inline mr-1.5 -mt-0.5" />
                Mot de passe
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleVerifyPin(); }}
                placeholder="Entrez votre mot de passe"
                autoFocus
                className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm text-center tracking-widest"
              />
              {pinError && (
                <p className="text-sm text-red-500 mt-2 text-center">{pinError}</p>
              )}
            </div>

            <button
              onClick={handleVerifyPin}
              disabled={verifying || !pin.trim()}
              className="w-full h-12 rounded-xl bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verifying && <Loader2 size={16} className="animate-spin" />}
              Valider
            </button>

            <button
              onClick={handleBack}
              className="w-full h-10 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
            >
              Changer de profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Étape 1 : Écran de sélection "Qui êtes-vous ?"
  return (
    <div className="min-h-screen flex items-center justify-center bg-rzpanda-fond p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Qui êtes-vous ?</h1>
          <p className="text-gray-500">Sélectionnez votre profil pour commencer</p>
        </div>

        {profils.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Aucun profil trouvé. Rechargez la page.</p>
            <button onClick={() => window.location.reload()} className="mt-3 h-10 px-5 rounded-xl bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90">
              Recharger
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {profils.map((p: ProfilActif, index: number) => (
            <button
              key={p.id}
              onClick={() => handleSelectProfil(p)}
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
