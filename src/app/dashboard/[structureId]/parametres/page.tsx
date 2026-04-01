"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { updateModulesActifs } from "@/app/actions/stock";
import { MODULES_DISPONIBLES, PRESETS_MODULES, type ModuleId } from "@/lib/constants";
import { toast } from "sonner";
import { Shield, Sparkles, Loader2, Check } from "lucide-react";

export default function ParametresPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;
  const { modulesActifs, activeRole } = useAuth();
  const [modules, setModules] = useState<ModuleId[]>(modulesActifs as ModuleId[]);
  const [saving, setSaving] = useState(false);

  const isGestionnaire = activeRole === "GESTIONNAIRE";

  const toggle = (moduleId: ModuleId) => {
    setModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const selectPreset = (preset: readonly ModuleId[]) => {
    setModules([...preset]);
  };

  const isPresetSelected = (preset: readonly ModuleId[]) => {
    return preset.length === modules.length && preset.every((m) => modules.includes(m));
  };

  const handleSave = async () => {
    if (modules.length === 0) { toast.error("Activez au moins un module."); return; }
    setSaving(true);
    const result = await updateModulesActifs(structureId, modules);
    setSaving(false);
    if (result.success) {
      toast.success("Modules mis à jour ! Rechargement...");
      setTimeout(() => { window.location.reload(); }, 1000);
    } else {
      toast.error(result.error);
    }
  };

  const categoriesModules = {
    haccp: Object.entries(MODULES_DISPONIBLES).filter(([, m]) => m.categorie === "haccp") as [ModuleId, typeof MODULES_DISPONIBLES[ModuleId]][],
    suivi: Object.entries(MODULES_DISPONIBLES).filter(([, m]) => m.categorie === "suivi") as [ModuleId, typeof MODULES_DISPONIBLES[ModuleId]][],
    gestion: Object.entries(MODULES_DISPONIBLES).filter(([, m]) => m.categorie === "gestion") as [ModuleId, typeof MODULES_DISPONIBLES[ModuleId]][],
  };

  const hasChanged = JSON.stringify([...modules].sort()) !== JSON.stringify([...(modulesActifs as string[])].sort());

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>

      {!isGestionnaire ? (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500">Seul le gestionnaire peut modifier les paramètres.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Modules activés</h2>
              <p className="text-sm text-gray-500 mt-1">Choisissez les fonctionnalités adaptées à votre structure. Les données des modules désactivés sont conservées.</p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => selectPreset(PRESETS_MODULES.haccp_essentiel)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${isPresetSelected(PRESETS_MODULES.haccp_essentiel) ? "border-petitsafe-primary bg-petitsafe-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-petitsafe-primary shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">HACCP Essentiel</p>
                    <p className="text-xs text-gray-500">Températures, traçabilité, nettoyage, biberonnerie</p>
                  </div>
                  {isPresetSelected(PRESETS_MODULES.haccp_essentiel) && <Check size={18} className="text-petitsafe-primary" />}
                </div>
              </button>

              <button onClick={() => selectPreset(PRESETS_MODULES.complet)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${isPresetSelected(PRESETS_MODULES.complet) ? "border-petitsafe-primary bg-petitsafe-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-petitsafe-accent shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Solution complète</p>
                    <p className="text-xs text-gray-500">Tous les modules activés</p>
                  </div>
                  {isPresetSelected(PRESETS_MODULES.complet) && <Check size={18} className="text-petitsafe-primary" />}
                </div>
              </button>
            </div>

            {/* Module toggles */}
            <div className="space-y-6">
              {Object.entries(categoriesModules).map(([cat, mods]) => (
                <div key={cat}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    {cat === "haccp" ? "HACCP & Traçabilité" : cat === "suivi" ? "Suivi Enfants" : "Gestion"}
                  </p>
                  <div className="space-y-2">
                    {mods.map(([id, mod]) => (
                      <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{mod.label}</p>
                          <p className="text-xs text-gray-500">{mod.description}</p>
                        </div>
                        <button onClick={() => toggle(id)} role="switch" aria-checked={modules.includes(id)}
                          className={`relative h-6 w-11 rounded-full transition-colors ${modules.includes(id) ? "bg-petitsafe-primary" : "bg-gray-300"}`}>
                          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${modules.includes(id) ? "translate-x-5" : ""}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 italic">Les modules &quot;Enfants&quot; et &quot;Exports PDF&quot; sont toujours disponibles car nécessaires au fonctionnement de base.</p>

            {hasChanged && (
              <button onClick={handleSave} disabled={saving}
                className="w-full h-12 rounded-xl bg-petitsafe-primary text-white font-medium hover:bg-petitsafe-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 size={20} className="animate-spin" />}
                Enregistrer les modifications
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
