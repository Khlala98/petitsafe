"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2, Plus, Pill, Trash2, ShieldCheck, AlertTriangle, FileText, X, CheckCircle2, UserCheck,
} from "lucide-react";
import {
  listerAdministrations, creerAdministration, supprimerAdministration,
  signerAdministration, cosignerAdministration, type AdministrationInput,
} from "@/app/actions/medicaments";
import { useProfil, type ProfilActif } from "@/hooks/use-profil";
import { listerProfils } from "@/app/actions/profils";
import type { VoieAdministration } from "@prisma/client";

interface MedicamentsTabProps {
  structureId: string;
  enfantId: string;
}

interface Administration {
  id: string;
  nom_medicament: string;
  posologie: string;
  voie: VoieAdministration;
  date_administration: string;
  ordonnance_fournie: boolean;
  observations: string | null;
  signe: boolean;
  signe_par_id: string | null;
  signe_par_nom: string | null;
  signe_le: string | null;
  temoin_id: string | null;
  temoin_nom: string | null;
  temoin_signe_le: string | null;
}

const VOIES: { value: VoieAdministration; label: string }[] = [
  { value: "ORALE", label: "Orale" },
  { value: "CUTANEE", label: "Cutanée" },
  { value: "NASALE", label: "Nasale" },
  { value: "OCULAIRE", label: "Oculaire" },
  { value: "AURICULAIRE", label: "Auriculaire" },
  { value: "RECTALE", label: "Rectale" },
  { value: "INHALEE", label: "Inhalée" },
  { value: "AUTRE", label: "Autre" },
];

export function MedicamentsTab({ structureId, enfantId }: MedicamentsTabProps) {
  const { profil } = useProfil();
  const [admins, setAdmins] = useState<Administration[]>([]);
  const [profilsEquipe, setProfilsEquipe] = useState<ProfilActif[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // form state
  const [nom, setNom] = useState("");
  const [posologie, setPosologie] = useState("");
  const [voie, setVoie] = useState<VoieAdministration>("ORALE");
  const nowLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [dateAdmin, setDateAdmin] = useState<string>(nowLocal());
  const [ordonnance, setOrdonnance] = useState(false);
  const [observations, setObservations] = useState("");

  // signature state
  const [showSignModal, setShowSignModal] = useState<Administration | null>(null);
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [signing, setSigning] = useState(false);

  // co-signature state
  const [showCosignModal, setShowCosignModal] = useState<Administration | null>(null);
  const [temoinProfilId, setTemoinProfilId] = useState<string>("");

  const fetchData = async () => {
    const [adminsRes, profilsRes] = await Promise.all([
      listerAdministrations(structureId, { enfantId }),
      listerProfils(structureId),
    ]);
    if (adminsRes.success && adminsRes.data) {
      setAdmins(
        adminsRes.data.map((a) => ({
          id: a.id,
          nom_medicament: a.nom_medicament,
          posologie: a.posologie,
          voie: a.voie,
          date_administration: a.date_administration.toISOString(),
          ordonnance_fournie: a.ordonnance_fournie,
          observations: a.observations,
          signe: a.signe,
          signe_par_id: a.signe_par_id,
          signe_par_nom: a.signe_par_nom,
          signe_le: a.signe_le?.toISOString() ?? null,
          temoin_id: a.temoin_id,
          temoin_nom: a.temoin_nom,
          temoin_signe_le: a.temoin_signe_le?.toISOString() ?? null,
        })),
      );
    }
    if (profilsRes.success) setProfilsEquipe(profilsRes.data as ProfilActif[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [structureId, enfantId]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setNom("");
    setPosologie("");
    setVoie("ORALE");
    setDateAdmin(nowLocal());
    setOrdonnance(false);
    setObservations("");
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!nom.trim() || !posologie.trim() || !dateAdmin) {
      toast.error("Nom, posologie et date sont obligatoires.");
      return;
    }
    setSaving(true);
    const payload: AdministrationInput = {
      enfant_id: enfantId,
      nom_medicament: nom,
      posologie,
      voie,
      date_administration: new Date(dateAdmin).toISOString(),
      ordonnance_fournie: ordonnance,
      observations: observations || undefined,
    };
    const res = await creerAdministration(structureId, payload);
    setSaving(false);
    if (res.success) {
      toast.success("Administration enregistrée. À signer pour valider.");
      resetForm();
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (a: Administration) => {
    if (a.signe) {
      toast.error("Une administration signée ne peut pas être supprimée.");
      return;
    }
    if (!confirm(`Supprimer l'administration de ${a.nom_medicament} ?`)) return;
    const res = await supprimerAdministration(a.id);
    if (res.success) {
      toast.success("Administration supprimée.");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleSign = async () => {
    if (!showSignModal || !profil || !confirmCheck) return;
    setSigning(true);
    const res = await signerAdministration(showSignModal.id, {
      profil_id: profil.id,
      nom_complet: `${profil.prenom} ${profil.nom}`,
    });
    setSigning(false);
    if (res.success) {
      toast.success("Administration signée et horodatée.");
      setShowSignModal(null);
      setConfirmCheck(false);
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleCosign = async () => {
    if (!showCosignModal || !temoinProfilId) {
      toast.error("Sélectionnez le témoin.");
      return;
    }
    const temoin = profilsEquipe.find((p) => p.id === temoinProfilId);
    if (!temoin) {
      toast.error("Témoin introuvable.");
      return;
    }
    const res = await cosignerAdministration(showCosignModal.id, {
      profil_id: temoin.id,
      nom_complet: `${temoin.prenom} ${temoin.nom}`,
    });
    if (res.success) {
      toast.success("Co-signature enregistrée.");
      setShowCosignModal(null);
      setTemoinProfilId("");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm";

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={24} className="animate-spin text-rzpanda-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
        <ShieldCheck size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Les administrations sont visibles uniquement par l&apos;équipe (jamais sur le portail parents). Une fois signée, une administration est verrouillée
          et ne peut plus être ni modifiée ni supprimée.
        </p>
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="h-10 px-4 rounded-xl bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 flex items-center gap-2"
        >
          <Plus size={16} /> Nouvelle administration
        </button>
      )}

      {showForm && (
        <div className="bg-rzpanda-primary/5 border border-rzpanda-primary/30 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Nouvelle administration</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom du médicament *</label>
              <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Doliprane 100mg" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Posologie *</label>
              <input
                value={posologie}
                onChange={(e) => setPosologie(e.target.value)}
                placeholder="Ex : 1 dose-poids selon ordonnance"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Voie d&apos;administration *</label>
              <select value={voie} onChange={(e) => setVoie(e.target.value as VoieAdministration)} className={`${inputClass} bg-white`}>
                {VOIES.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date et heure d&apos;administration *</label>
              <input type="datetime-local" value={dateAdmin} onChange={(e) => setDateAdmin(e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={ordonnance} onChange={(e) => setOrdonnance(e.target.checked)} className="rounded" />
                Ordonnance fournie par les parents
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Observations</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm resize-none"
                placeholder="Optionnel"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="h-10 px-5 rounded-lg bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Enregistrer
            </button>
            <button onClick={resetForm} className="h-10 px-4 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </div>
      )}

      {admins.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Pill size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">Aucune administration enregistrée.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {admins.map((a) => {
            const dateAdmin = new Date(a.date_administration);
            return (
              <div key={a.id} className={`p-4 rounded-xl border ${a.signe ? "bg-white border-gray-200" : "bg-amber-50 border-amber-200"}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800">{a.nom_medicament}</p>
                      <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {VOIES.find((v) => v.value === a.voie)?.label}
                      </span>
                      {a.ordonnance_fournie ? (
                        <span className="text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <FileText size={10} /> Ordonnance
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle size={10} /> Sans ordonnance
                        </span>
                      )}
                      {a.signe ? (
                        <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={10} /> Signée
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">À signer</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{a.posologie}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Administré le {dateAdmin.toLocaleDateString("fr-FR")} à{" "}
                      {dateAdmin.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {a.observations && <p className="text-xs text-gray-500 mt-1 italic">« {a.observations} »</p>}
                    {a.signe && (
                      <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Signé par <strong>{a.signe_par_nom}</strong> le{" "}
                        {a.signe_le && new Date(a.signe_le).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    )}
                    {a.temoin_signe_le && (
                      <p className="text-xs text-blue-600 flex items-center gap-1">
                        <UserCheck size={12} /> Témoin : <strong>{a.temoin_nom}</strong> le{" "}
                        {new Date(a.temoin_signe_le).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!a.signe && (
                      <button
                        onClick={() => {
                          setShowSignModal(a);
                          setConfirmCheck(false);
                        }}
                        className="h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Signer
                      </button>
                    )}
                    {a.signe && !a.temoin_signe_le && (
                      <button
                        onClick={() => setShowCosignModal(a)}
                        className="h-8 px-3 rounded-lg border border-blue-300 text-blue-600 text-xs font-medium hover:bg-blue-50 flex items-center gap-1"
                      >
                        <UserCheck size={12} /> Co-signer
                      </button>
                    )}
                    {!a.signe && (
                      <button
                        onClick={() => handleDelete(a)}
                        className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-red-500"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale signature */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowSignModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-600" /> Signature électronique
              </h3>
              <button onClick={() => setShowSignModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                Vous vous apprêtez à signer l&apos;administration suivante :
              </p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                <p className="font-semibold text-gray-800">{showSignModal.nom_medicament}</p>
                <p className="text-gray-500">{showSignModal.posologie}</p>
              </div>
              <p className="text-gray-600">
                Signataire : <strong>{profil ? `${profil.prenom} ${profil.nom}` : "—"}</strong>
              </p>
              <p className="text-gray-600">
                Horodatage : <strong>{new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</strong>
              </p>
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={confirmCheck} onChange={(e) => setConfirmCheck(e.target.checked)} className="rounded mt-0.5" />
              <span>
                Je confirme avoir administré ce médicament conformément à la posologie indiquée. Cette signature est <strong>irréversible</strong>.
              </span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSignModal(null)}
                className="flex-1 h-10 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSign}
                disabled={!confirmCheck || !profil || signing}
                className="flex-1 h-10 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {signing && <Loader2 size={14} className="animate-spin" />}
                Signer définitivement
              </button>
            </div>
            {!profil && <p className="text-xs text-red-600 text-center">Aucun profil sélectionné — sélectionnez votre profil pour signer.</p>}
          </div>
        </div>
      )}

      {/* Modale co-signature */}
      {showCosignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCosignModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <UserCheck size={20} className="text-blue-600" /> Co-signature témoin
              </h3>
              <button onClick={() => setShowCosignModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Sélectionnez le professionnel qui a assisté à l&apos;administration de <strong>{showCosignModal.nom_medicament}</strong>.
            </p>
            <select value={temoinProfilId} onChange={(e) => setTemoinProfilId(e.target.value)} className={`${inputClass} bg-white`}>
              <option value="">— Choisir un témoin —</option>
              {profilsEquipe
                .filter((p) => p.id !== showCosignModal.signe_par_id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.prenom} {p.nom}
                    {p.poste ? ` (${p.poste})` : ""}
                  </option>
                ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCosignModal(null)}
                className="flex-1 h-10 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCosign}
                disabled={!temoinProfilId}
                className="flex-1 h-10 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Enregistrer le témoin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
