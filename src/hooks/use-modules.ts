"use client";

import { useMemo } from "react";
import { isModuleActif, getModulesParCategorie } from "@/lib/business-logic";
import type { ModuleId, CategorieModule } from "@/lib/constants";

export function useModules(modulesActifs: string[]) {
  const isActif = (moduleId: ModuleId): boolean => {
    return isModuleActif(modulesActifs, moduleId);
  };

  const modulesParCategorie = useMemo(
    () => getModulesParCategorie(modulesActifs),
    [modulesActifs]
  );

  return { isActif, modulesParCategorie };
}
