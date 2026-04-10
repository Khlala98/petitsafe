"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useProfil, type ProfilActif } from "@/hooks/use-profil";
import { updateModulesActifs } from "@/app/actions/stock";
import { getStructureInfo, updateStructureInfo, nettoyerDonneesAberrantes, getSeuilsAge, updateSeuilsAge } from "@/app/actions/structure";
import { creerProfil, modifierProfil, desactiverProfil, listerTousProfils } from "@/app/actions/profils";
import { MODULES_DISPONIBLES, PRESETS_MODULES, type ModuleId } from "@/lib/constants";
import { toast } from "sonner";
import { Shield, Sparkles, Loader2, Check, Trash2, Users, Plus, Pencil, UserX, UserCheck, Baby } from "lucide-react";
import { RoleProfil } from "@prisma/client";

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

  // Seuils d'âge
  const [seuilBebes, setSeuilBebes] = useState(18);
  const [seuilMoyens, setSeuilMoyens] = useState(30);
  const [seuilsLoaded, setSeuilsLoaded] = useState(false);
  const [seuilsSaving, setSeuilsSaving] = useState(false);

  // Équipe
  const { refreshProfils } = useProfil();
  const [equipeProfils, setEquipeProfils] = useState<ProfilActif[]>([]);
  const [equipeLoaded, setEquipeLoaded] = useState(false);
  const [showEquipeForm, setShowEquipeForm] = useState(false);
  const [editingProfil, setEditingProfil] = useState<ProfilActif | null>(null);
  const [equipeForm, setEquipeForm] = useState({ prenom: "", nom: "", poste: "", role: "PROFESSIONNEL" as RoleProfil, telephone: "", email: "", certifications: "", notes: "", pin: "" });
  const [equipeSaving, setEquipeSaving] = useState(false);

  const { isAdmin } = useProfil();
  const isGestionnaire = isAdmin || activeRole === "GESTIONNAIRE";

  const loadEquipe = async () => {
    const res = await listerTousProfils(structureId);
    if (res.success) setEquipeProfils(res.data as ProfilActif[]);
    setEquipeLoaded(true);
  };

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
    loadEquipe();
    getSeuilsAge(structureId).then((res) => {
      if (res.success && res.data) {
        setSeuilBebes(res.data.seuil_bebes_max);
        setSeuilMoyens(res.data.seuil_moyens_max);
      }
      setSeuilsLoaded(true);
    });
  }, [structureId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSaveSeuils = async () => {
    setSeuilsSaving(true);
    const result = await updateSeuilsAge(structureId, seuilBebes, seuilMoyens);
    setSeuilsSaving(false);
    if (result.success) toast.success("Seuils d'âge enregistrés !");
    else toast.error(result.error);
  };

  const resetEquipeForm = () => {
    setEquipeForm({ prenom: "", nom: "", poste: "", role: "PROFESSIONNEL" as RoleProfil, telephone: "", email: "", certifications: "", notes: "", pin: "" });
    setEditingProfil(null);
    setShowEquipeForm(false);
  };

  const handleEditProfil = (p: ProfilActif) => {
    setEditingProfil(p);
    setEquipeForm({
      prenom: p.prenom,
      nom: p.nom,
      poste: p.poste || "",
      role: p.role as RoleProfil,
      telephone: p.telephone || "",
      email: p.email || "",
      certifications: p.certifications || "",
      notes: p.notes || "",
      pin: "",
    });
    setShowEquipeForm(true);
  };

  const handleSaveEquipe = async () => {
    if (!equipeForm.prenom.trim() || !equipeForm.nom.trim()) {
      toast.error("Le prénom et le nom sont obligatoires.");
      return;
    }
    if (!editingProfil && !equipeForm.pin.trim()) {
      toast.error("Le mot de passe profil est obligatoire.");
      return;
    }
    setEquipeSaving(true);
    const payload = {
      prenom: equipeForm.prenom,
      nom: equipeForm.nom,
      poste: equipeForm.poste || undefined,
      role: equipeForm.role,
      telephone: equipeForm.telephone || undefined,
      email: equipeForm.email || undefined,
      certifications: equipeForm.certifications || undefined,
      notes: equipeForm.notes || undefined,
      pin: equipeForm.pin.trim() || undefined,
    };

    const result = editingProfil
      ? await modifierProfil(editingProfil.id, payload)
      : await creerProfil({ structure_id: structureId, ...payload });

    setEquipeSaving(false);
    if (result.success) {
      toast.success(editingProfil ? "Profil modifié !" : "Profil créé !");
      resetEquipeForm();
      await loadEquipe();
      await refreshProfils();
    } else {
      toast.error(result.error);
    }
  };

  const handleDesactiverProfil = async (profilId: string, actif: boolean) => {
    if (actif && !confirm("Désactiver ce profil ? Il ne pourra plus se connecter.")) return;
    if (!actif) {
      const result = await modifierProfil(profilId, { actif: true });
      if (result.success) {
        toast.success("Profil réactivé !");
        await loadEquipe();
        await refreshProfils();
      } else {
        toast.error(result.error);
      }
      return;
    }
    const result = await desactiverProfil(profilId);
    if (result.success) {
      toast.success("Profil désactivé.");
      await loadEquipe();
      await refreshProfils();
    } else {
      toast.error(result.error);
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

          {/* Section Équipe */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users size={20} className="text-rzpanda-primary" />
                  Équipe
                </h2>
                <p className="text-sm text-gray-500 mt-1">Gérez les profils de votre équipe. Chaque salarié sélectionne son prénom à la connexion.</p>
              </div>
              {!showEquipeForm && (
                <button onClick={() => { resetEquipeForm(); setShowEquipeForm(true); }}
                  className="h-9 px-4 rounded-lg bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 flex items-center gap-1.5">
                  <Plus size={16} />
                  Ajouter
                </button>
              )}
            </div>

            {/* Formulaire ajout/édition */}
            {showEquipeForm && (
              <div className="border border-rzpanda-primary/20 rounded-xl p-4 bg-rzpanda-primary/5 space-y-3">
                <p className="text-sm font-medium text-gray-700">{editingProfil ? "Modifier le profil" : "Nouveau profil"}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Prénom *</label>
                    <input type="text" value={equipeForm.prenom} onChange={(e) => setEquipeForm((f) => ({ ...f, prenom: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm" placeholder="Marie" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                    <input type="text" value={equipeForm.nom} onChange={(e) => setEquipeForm((f) => ({ ...f, nom: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm" placeholder="Dupont" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Poste</label>
                    <select value={equipeForm.poste} onChange={(e) => setEquipeForm((f) => ({ ...f, poste: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm bg-white">
                      <option value="">— Choisir —</option>
                      <option value="Directrice">Directrice</option>
                      <option value="Auxiliaire">Auxiliaire de puériculture</option>
                      <option value="EJE">EJE</option>
                      <option value="Stagiaire">Stagiaire</option>
                      <option value="Agent">Agent</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Rôle</label>
                    <select value={equipeForm.role} onChange={(e) => setEquipeForm((f) => ({ ...f, role: e.target.value as RoleProfil }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm bg-white">
                      <option value="PROFESSIONNEL">Professionnel</option>
                      <option value="ADMINISTRATEUR">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                    <input type="tel" value={equipeForm.telephone} onChange={(e) => setEquipeForm((f) => ({ ...f, telephone: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm" placeholder="06 12 34 56 78" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email perso</label>
                    <input type="email" value={equipeForm.email} onChange={(e) => setEquipeForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm" placeholder="marie@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Mot de passe profil {!editingProfil && "*"}
                    </label>
                    <input type="password" value={equipeForm.pin} onChange={(e) => setEquipeForm((f) => ({ ...f, pin: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm"
                      placeholder={editingProfil ? "Laisser vide pour ne pas changer" : "Mot de passe obligatoire"} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Certifications</label>
                  <input type="text" value={equipeForm.certifications} onChange={(e) => setEquipeForm((f) => ({ ...f, certifications: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm" placeholder="CAP Petite enfance, PSC1..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                  <textarea value={equipeForm.notes} onChange={(e) => setEquipeForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm resize-none" rows={2} placeholder="Infos complémentaires..." />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveEquipe} disabled={equipeSaving}
                    className="h-10 px-5 rounded-lg bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 disabled:opacity-50 flex items-center gap-2">
                    {equipeSaving && <Loader2 size={14} className="animate-spin" />}
                    {editingProfil ? "Modifier" : "Créer le profil"}
                  </button>
                  <button onClick={resetEquipeForm} className="h-10 px-4 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste des profils */}
            {!equipeLoaded ? (
              <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-rzpanda-primary" /></div>
            ) : equipeProfils.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucun profil créé.</p>
            ) : (
              <div className="space-y-2">
                {equipeProfils.map((p) => (
                  <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg ${p.actif ? "bg-gray-50" : "bg-gray-100 opacity-60"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${p.actif ? "bg-rzpanda-primary" : "bg-gray-400"}`}>
                        {p.prenom.charAt(0)}{p.nom.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{p.prenom} {p.nom}</span>
                          {p.role === "ADMINISTRATEUR" && (
                            <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Admin</span>
                          )}
                          {!p.actif && (
                            <span className="text-[10px] font-medium bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Inactif</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{p.poste || "—"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEditProfil(p)} className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-gray-600" title="Modifier">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDesactiverProfil(p.id, p.actif)}
                        className={`p-2 rounded-lg hover:bg-white ${p.actif ? "text-gray-400 hover:text-red-500" : "text-gray-400 hover:text-green-500"}`}
                        title={p.actif ? "Désactiver" : "Réactiver"}>
                        {p.actif ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seuils d'âge — groupes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Baby size={20} className="text-rzpanda-primary" />
                Groupes d&apos;âge
              </h2>
              <p className="text-sm text-gray-500 mt-1">Configurez les seuils pour la bascule automatique des groupes. Les enfants avec un groupe forcé manuellement ne sont pas affectés.</p>
            </div>
            {!seuilsLoaded ? (
              <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-rzpanda-primary" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-sm font-medium text-blue-800 mb-2">Bébés</p>
                    <p className="text-xs text-blue-600 mb-1">0 à <strong>{seuilBebes}</strong> mois</p>
                    <div className="flex items-center gap-2">
                      <input type="range" min={6} max={36} value={seuilBebes}
                        onChange={(e) => setSeuilBebes(Number(e.target.value))}
                        className="flex-1 accent-blue-500" />
                      <span className="text-sm font-mono font-bold text-blue-700 w-8 text-right">{seuilBebes}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-sm font-medium text-amber-800 mb-2">Moyens</p>
                    <p className="text-xs text-amber-600 mb-1">{seuilBebes} à <strong>{seuilMoyens}</strong> mois</p>
                    <div className="flex items-center gap-2">
                      <input type="range" min={seuilBebes + 1} max={48} value={seuilMoyens}
                        onChange={(e) => setSeuilMoyens(Number(e.target.value))}
                        className="flex-1 accent-amber-500" />
                      <span className="text-sm font-mono font-bold text-amber-700 w-8 text-right">{seuilMoyens}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                    <p className="text-sm font-medium text-green-800 mb-2">Grands</p>
                    <p className="text-xs text-green-600">{seuilMoyens} mois et +</p>
                  </div>
                </div>
                <button onClick={handleSaveSeuils} disabled={seuilsSaving}
                  className="h-11 px-5 rounded-xl bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 disabled:opacity-50 flex items-center gap-2">
                  {seuilsSaving && <Loader2 size={16} className="animate-spin" />}
                  Enregistrer les seuils
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
