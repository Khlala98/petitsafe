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
    modules_actifs: string[];
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
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) console.error("[useAuth] getUser error:", authError);
        setUser(user);
        if (user) {
          const { data, error } = await supabase
            .from("UserStructure")
            .select("id, structure_id, role, structure:Structure(id, nom, type, modules_actifs)")
            .eq("user_id", user.id);
          if (error) {
            console.error("[useAuth] UserStructure query error:", error);
          } else if (data && data.length > 0) {
            setStructures(data as unknown as UserStructure[]);
            const savedId = localStorage.getItem("activeStructureId");
            const validId = data.find((s) => s.structure_id === savedId);
            setActiveStructureId(validId ? savedId : data[0].structure_id);
          }
        }
      } catch (e) {
        console.error("[useAuth] unexpected error:", e);
      } finally {
        setLoading(false);
      }
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
  const modulesActifs = activeStructure?.structure.modules_actifs ?? [];
  const meta = user?.user_metadata ?? {};
  const prenom: string =
    (typeof meta.prenom === "string" && meta.prenom.trim()) ||
    (typeof meta.full_name === "string" && meta.full_name.trim().split(/\s+/)[0]) ||
    (typeof meta.name === "string" && meta.name.trim().split(/\s+/)[0]) ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "";

  return { user, prenom, structures, activeStructureId, activeStructure, activeRole, modulesActifs, switchStructure, loading };
}
