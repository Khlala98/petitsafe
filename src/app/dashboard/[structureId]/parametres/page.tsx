"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { updateModulesActifs } from "@/app/actions/stock";
import { getStructureInfo, updateStructureInfo, nettoyerDonneesAberrantes } from "@/app/actions/structure";
import { MODULES_DISPONIBLES, PRESETS_MODULES, type ModuleId } from "@/lib/constants";
import { toast } from "sonner";
import { Shield, Sparkles, Loader2, Check, Trash2 } from "lucide-react";

export default function ParametresPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;
  const { modulesActifs, activeRole } = useAuth();
  const [modules, setModules] = useState<ModuleId[]>(modulesActifs as ModuleId[]);
  const [saving, setSaving] = useState(false);

  // Infos structure
  const [infoNom, setInfoNom] = useState("");
  const [infoAdresse, setInfoAdresse] = useState("");
  const [infoCp, setInfoCp] = useState("");
  const [infoVille, setInfoVille] = useState("");
  const [infoTel, setInfoTel] = useState("");
  const [infoEmail, setInfoEmail] = useState("");
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [infoSaving, setInfoSaving] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const isGestionnaire = activeRole === "GESTIONNAIRE";

  useEffect(() => {
    getStructureInfo(structureId).then((res) => {
      if (res.success && res.data) {
        setInfoNom(res.data.nom ?? "");
        setInfoAdresse(res.data.adresse ?? "");
        setInfoCp(res.data.code_postal ?? "");
        setInfoVille(res.data.ville ?? "");
        setInfoTel(res.data.telephone ?? "");
        setInfoEmail(res.data.email ?? "");
      }
      setInfoLoaded(true);
    });
  }, [structureId]);

  const handleSaveInfo = async () => {
    setInfoSaving(true);
    const result = await updateStructureInfo(structureId, {
      nom: infoNom,
      adresse: infoAdresse,
      code_postal: infoCp,
      ville: infoVille,
      telephone: infoTel,
      email: infoEmail,
    });
    setInfoSaving(false);
    if (result.success) {
      toast.success("Informations enregistrées ! Rechargement...");
      setTimeout(() => window.location.reload(), 800);
    } else {
      toast.error(result.error);
    }
  };

  const handleNettoyer = async () => {
    if (!confirm("Supprimer définitivement toutes les données aberrantes (températures hors plage, stocks > 10 000, produits au nom invalide) ?")) return;
    setCleaning(true);
    const result = await nettoyerDonneesAberrantes(structureId);
    setCleaning(false);
    if (result.success && result.data) {
      const { relevesSupprimes, equipementsSupprimes, stocksSupprimes, receptionsSupprimees } = result.data;
      toast.success(`Nettoyage terminé : ${relevesSupprimes} relevés, ${equipementsSupprimes} équipements, ${stocksSupprimes} stocks, ${receptionsSupprimees} réceptions supprimés.`);
    } else {
      toast.error(result.success ? "Erreur" : result.error);
    }
  };

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
          {/* Infos structure */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Informations de la structure</h2>
              <p className="text-sm text-gray-500 mt-1">Ces informations apparaissent sur les exports PDF et le portail parents.</p>
            </div>
            {!infoLoaded ? (
              <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-rzpanda-primary" /></div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la structure *</label>
                  <input type="text" value={infoNom} onChange={(e) => setInfoNom(e.target.value)} placeholder="Crèche Les Petits Pandas"
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input type="text" value={infoAdresse} onChange={(e) => setInfoAdresse(e.target.value)} placeholder="12 rue des Lilas"
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                    <input type="text" value={infoCp} onChange={(e) => setInfoCp(e.target.value)} placeholder="75001"
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input type="text" value={infoVille} onChange={(e) => setInfoVille(e.target.value)} placeholder="Paris"
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" value={infoTel} onChange={(e) => setInfoTel(e.target.value)} placeholder="01 23 45 67 89"
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                    <input type="email" value={infoEmail} onChange={(e) => setInfoEmail(e.target.value)} placeholder="contact@creche.fr"
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm" />
                  </div>
                </div>
                <button onClick={handleSaveInfo} disabled={infoSaving}
                  className="h-11 px-5 rounded-xl bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 disabled:opacity-50 flex items-center gap-2">
                  {infoSaving && <Loader2 size={16} className="animate-spin" />}
                  Enregistrer
                </button>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Modules activés</h2>
              <p className="text-sm text-gray-500 mt-1">Choisissez les fonctionnalités adaptées à votre structure. Les données des modules désactivés sont conservées.</p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => selectPreset(PRESETS_MODULES.haccp_essentiel)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${isPresetSelected(PRESETS_MODULES.haccp_essentiel) ? "border-rzpanda-primary bg-rzpanda-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-rzpanda-primary shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">HACCP Essentiel</p>
                    <p className="text-xs text-gray-500">Températures, traçabilité, nettoyage, biberonnerie</p>
                  </div>
                  {isPresetSelected(PRESETS_MODULES.haccp_essentiel) && <Check size={18} className="text-rzpanda-primary" />}
                </div>
              </button>

              <button onClick={() => selectPreset(PRESETS_MODULES.complet)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${isPresetSelected(PRESETS_MODULES.complet) ? "border-rzpanda-primary bg-rzpanda-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-rzpanda-accent shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Solution complète</p>
                    <p className="text-xs text-gray-500">Tous les modules activés</p>
                  </div>
                  {isPresetSelected(PRESETS_MODULES.complet) && <Check size={18} className="text-rzpanda-primary" />}
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
                          className={`relative h-6 w-11 rounded-full transition-colors ${modules.includes(id) ? "bg-rzpanda-primary" : "bg-gray-300"}`}>
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
                className="w-full h-12 rounded-xl bg-rzpanda-primary text-white font-medium hover:bg-rzpanda-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 size={20} className="animate-spin" />}
                Enregistrer les modifications
              </button>
            )}
          </div>

          {/* Maintenance — données aberrantes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Maintenance</h2>
              <p className="text-sm text-gray-500 mt-1">
                Supprime en un clic les données de test ou aberrantes : températures hors plage (&lt; -50°C ou &gt; 100°C), stocks &gt; 10 000 unités, produits au nom invalide.
              </p>
            </div>
            <button onClick={handleNettoyer} disabled={cleaning}
              className="h-11 px-5 rounded-xl border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 flex items-center gap-2">
              {cleaning ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Nettoyer les données aberrantes
            </button>
          </div>
        </>
      )}
    </div>
  );
}
