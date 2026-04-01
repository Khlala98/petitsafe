"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserStructure {
  id: string;
  structure_id: string;
  role: string;
  structure: {
    id: string;
    nom: string;
    type: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [structures, setStructures] = useState<UserStructure[]>([]);
  const [activeStructureId, setActiveStructureId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("UserStructure")
          .select("id, structure_id, role, structure:Structure(id, nom, type)")
          .eq("user_id", user.id);

        if (data && data.length > 0) {
          setStructures(data as unknown as UserStructure[]);
          const savedId = localStorage.getItem("activeStructureId");
          const validId = data.find((s) => s.structure_id === savedId);
          setActiveStructureId(validId ? savedId : data[0].structure_id);
        }
      }
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchStructure = (structureId: string) => {
    setActiveStructureId(structureId);
    localStorage.setItem("activeStructureId", structureId);
  };

  const activeStructure = structures.find((s) => s.structure_id === activeStructureId);
  const activeRole = activeStructure?.role ?? null;
  const prenom = user?.user_metadata?.prenom ?? "Utilisateur";

  return {
    user,
    prenom,
    structures,
    activeStructureId,
    activeStructure,
    activeRole,
    switchStructure,
    loading,
  };
}
