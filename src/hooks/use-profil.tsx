"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { listerProfils } from "@/app/actions/profils";

export interface ProfilActif {
  id: string;
  structure_id: string;
  prenom: string;
  nom: string;
  poste: string | null;
  role: "ADMINISTRATEUR" | "PROFESSIONNEL";
  telephone: string | null;
  email: string | null;
  certifications: string | null;
  notes: string | null;
  actif: boolean;
}

interface ProfilContextType {
  profil: ProfilActif | null;
  profils: ProfilActif[];
  loading: boolean;
  selectProfil: (profil: ProfilActif) => void;
  clearProfil: () => void;
  refreshProfils: () => Promise<void>;
  isAdmin: boolean;
  needsSelection: boolean;
}

const ProfilContext = createContext<ProfilContextType>({
  profil: null,
  profils: [],
  loading: true,
  selectProfil: () => {},
  clearProfil: () => {},
  refreshProfils: async () => {},
  isAdmin: false,
  needsSelection: false,
});

const STORAGE_KEY = "activeProfilId";

export function ProfilProvider({ structureId, children }: { structureId: string | null; children: ReactNode }) {
  const [profil, setProfil] = useState<ProfilActif | null>(null);
  const [profils, setProfils] = useState<ProfilActif[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfils = useCallback(async () => {
    if (!structureId) {
      setProfils([]);
      setProfil(null);
      setLoading(false);
      return;
    }

    try {
      console.log("[useProfil] loadProfils appelée, structureId:", structureId);
      const result = await listerProfils(structureId);
      console.log("[useProfil] résultat listerProfils:", JSON.stringify(result).substring(0, 200));
      if (result.success) {
        const data = result.data as ProfilActif[];
        console.log("[useProfil] profils chargés:", data.length);
        setProfils(data);
        // Toujours forcer la sélection + saisie du mot de passe
        setProfil(null);
      } else {
        console.error("[useProfil] Échec listerProfils:", result.error);
        setProfils([]);
      }
    } catch (e) {
      console.error("[useProfil] Erreur chargement profils:", e);
      setProfils([]);
    } finally {
      setLoading(false);
    }
  }, [structureId]);

  useEffect(() => {
    loadProfils();
  }, [loadProfils]);

  const selectProfil = useCallback((p: ProfilActif) => {
    setProfil(p);
    localStorage.setItem(STORAGE_KEY, p.id);
  }, []);

  const clearProfil = useCallback(() => {
    setProfil(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const needsSelection = !loading && profils.length > 0 && !profil;

  return (
    <ProfilContext.Provider
      value={{
        profil,
        profils,
        loading,
        selectProfil,
        clearProfil,
        refreshProfils: loadProfils,
        isAdmin: profil?.role === "ADMINISTRATEUR",
        needsSelection,
      }}
    >
      {children}
    </ProfilContext.Provider>
  );
}

export function useProfil() {
  return useContext(ProfilContext);
}
