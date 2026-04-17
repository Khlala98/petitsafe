"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  listerLaitsMaternels, creerLaitMaternel, modifierLaitMaternel,
  decongelerLaitMaternel, changerStatutLaitMaternel, supprimerLaitMaternel,
} from "@/app/actions/lait-maternel";
import { getEnfants } from "@/app/actions/enfants";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Milk, Snowflake, Thermometer, Trash2, AlertTriangle, CheckCircle2, X } from "lucide-react";
import type { StatutLaitMaternel } from "@prisma/client";

interface Lait {
  id: string;
  enfant_id: string;
  enfant: { id: string; prenom: string; nom: string };
  date_recueil: string;
  congele: boolean;
  date_decongelation: string | null;
  quantite_ml: number;
  quantite_restante_ml: number | null;
  dlc: string;
  statut: StatutLaitMaternel;
  notes: string | null;
}

interface Enfant {
  id: string;
  prenom: string;
  nom: string;
}

const STATUT_LABELS: Record<StatutLaitMaternel, string> = {
  DISPONIBLE: "Disponible",
  UTILISE: "Utilisé",
  JETE: "Jeté",
  PERIME: "Périmé",
};

export default function LaitMaternelPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;

  const [laits, setLaits] = useState<Lait[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const nowLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [enfantId, setEnfantId] = useState("");
  const [dateRecueil, setDateRecueil] = useState(nowLocal());
  const [congele, setCongele] = useState(false);
  const [dateDecongelation, setDateDecongelation] = useState("");
  const [quantite, setQuantite] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    const [lmRes, enfRes] = await Promise.all([
      listerLaitsMaternels(structureId),
      getEnfants(structureId),
    ]);
    if (lmRes.success && lmRes.data) {
      setLaits(
        lmRes.data.map((lm) => ({
          id: lm.id,
          enfant_id: lm.enfant_id,
          enfant: lm.enfant,
          date_recueil: lm.date_recueil.toISOString(),
          congele: lm.congele,
          date_decongelation: lm.date_decongelation?.toISOString() ?? null,
          quantite_ml: lm.quantite_ml,
          quantite_restante_ml: lm.quantite_restante_ml,
          dlc: lm.dlc.toISOString(),
          statut: lm.statut,
          notes: lm.notes,
        })),
      );
    }
    if (enfRes.success && enfRes.data) {
      setEnfants(enfRes.data.map((e) => ({ id: e.id, prenom: e.prenom, nom: e.nom })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setEnfantId("");
    setDateRecueil(nowLocal());
    setCongele(false);
    setDateDecongelation("");
    setQuantite("");
    setNotes("");
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!enfantId) { toast.error("Sélectionnez un enfant."); return; }
    if (!dateRecueil) { toast.error("Date de recueil obligatoire."); return; }
    if (!quantite || Number(quantite) <= 0) { toast.error("Quantité invalide."); return; }
    setSaving(true);
    const res = await creerLaitMaternel(structureId, {
      enfant_id: enfantId,
      date_recueil: new Date(dateRecueil).toISOString(),
      congele,
      date_decongelation: congele && dateDecongelation ? new Date(dateDecongelation).toISOString() : undefined,
      quantite_ml: Number(quantite),
      notes: notes || undefined,
    });
    setSaving(false);
    if (res.success) {
      toast.success("Lait maternel enregistré.");
      resetForm();
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleDecongeler = async (lm: Lait) => {
    if (!confirm(`Marquer le lait de ${lm.enfant.prenom} comme décongelé ? La DLC sera ramenée à 24h.`)) return;
    const res = await decongelerLaitMaternel(lm.id);
    if (res.success) {
      toast.success("Lait marqué comme décongelé.");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleStatut = async (lm: Lait, statut: StatutLaitMaternel) => {
    const labels: Record<StatutLaitMaternel, string> = {
      DISPONIBLE: "remettre comme disponible",
      UTILISE: "marquer comme utilisé",
      JETE: "marquer comme jeté",
      PERIME: "marquer comme périmé",
    };
    if (!confirm(`Confirmer : ${labels[statut]} le lait de ${lm.enfant.prenom} ?`)) return;
    const res = await changerStatutLaitMaternel(lm.id, statut);
    if (res.success) {
      toast.success("Statut mis à jour.");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (lm: Lait) => {
    if (!confirm(`Supprimer définitivement ce recueil de lait ?`)) return;
    const res = await supprimerLaitMaternel(lm.id);
    if (res.success) {
      toast.success("Lait supprimé.");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm";

  const now = new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.push(`/dashboard/${structureId}/biberonnerie`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-rzpanda-primary"
      >
        <ArrowLeft size={16} /> Biberonnerie
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Milk size={24} className="text-pink-500" />
            Lait maternel
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            DLC automatique : <strong>24h au frigo</strong> à partir du recueil ou de la décongélation —{" "}
            <strong>6 mois au congélateur</strong> à partir du recueil.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="h-10 px-4 rounded-xl bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 flex items-center gap-2"
          >
            <Plus size={16} /> Nouveau recueil
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-200 space-y-4">
          <h2 className="font-semibold text-gray-800">Nouveau recueil de lait maternel</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Enfant *</label>
              <select value={enfantId} onChange={(e) => setEnfantId(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">— Sélectionner —</option>
                {enfants.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.prenom} {e.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date et heure de recueil *</label>
              <input type="datetime-local" value={dateRecueil} onChange={(e) => setDateRecueil(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantité (ml) *</label>
              <input
                type="number"
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value) || "")}
                placeholder="Ex : 120"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={congele} onChange={(e) => setCongele(e.target.checked)} className="rounded" />
                Stockage au congélateur
              </label>
            </div>
            {congele && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Date de décongélation (si déjà décongelé)</label>
                <input
                  type="datetime-local"
                  value={dateDecongelation}
                  onChange={(e) => setDateDecongelation(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Si vide : DLC = recueil + 6 mois. Sinon : décongélation + 24h.
                </p>
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optionnel" className={inputClass} />
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-rzpanda-primary" />
        </div>
      ) : laits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Milk size={32} className="mx-auto text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm">Aucun lait maternel enregistré.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {laits.map((lm) => {
            const dlcDate = new Date(lm.dlc);
            const dlcExpire = dlcDate < now;
            const dlcProche = !dlcExpire && (dlcDate.getTime() - now.getTime()) / 36e5 <= 24;
            const cardColor = lm.statut !== "DISPONIBLE"
              ? "bg-gray-50 border-gray-200 opacity-70"
              : dlcExpire
                ? "bg-red-50 border-red-200"
                : dlcProche
                  ? "bg-orange-50 border-orange-200"
                  : "bg-white border-gray-200";
            return (
              <div key={lm.id} className={`p-4 rounded-xl border ${cardColor}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800">
                        {lm.enfant.prenom} {lm.enfant.nom}
                      </p>
                      <span className="text-[10px] font-medium bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full">
                        {lm.quantite_ml} ml
                      </span>
                      {lm.congele && (
                        <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Snowflake size={10} /> Congelé
                        </span>
                      )}
                      {lm.date_decongelation && (
                        <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Thermometer size={10} /> Décongelé
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          lm.statut === "DISPONIBLE"
                            ? "bg-green-100 text-green-700"
                            : lm.statut === "UTILISE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {STATUT_LABELS[lm.statut]}
                      </span>
                      {dlcExpire && lm.statut === "DISPONIBLE" && (
                        <span className="text-[10px] font-medium bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle size={10} /> DLC dépassée
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Recueilli le {new Date(lm.date_recueil).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                    <p className={`text-xs mt-0.5 ${dlcExpire ? "text-red-700 font-semibold" : dlcProche ? "text-orange-700 font-semibold" : "text-gray-500"}`}>
                      DLC : {dlcDate.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                    {lm.quantite_restante_ml !== null && lm.quantite_restante_ml < lm.quantite_ml && (
                      <p className="text-xs text-gray-400 mt-0.5">Reste {lm.quantite_restante_ml} ml</p>
                    )}
                    {lm.notes && <p className="text-xs text-gray-400 mt-0.5 italic">« {lm.notes} »</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 flex-wrap">
                    {lm.statut === "DISPONIBLE" && lm.congele && !lm.date_decongelation && (
                      <button
                        onClick={() => handleDecongeler(lm)}
                        className="h-8 px-3 rounded-lg border border-amber-300 text-amber-700 text-xs font-medium hover:bg-amber-50 flex items-center gap-1"
                      >
                        <Thermometer size={12} /> Décongeler
                      </button>
                    )}
                    {lm.statut === "DISPONIBLE" && (
                      <>
                        <button
                          onClick={() => handleStatut(lm, "UTILISE")}
                          className="h-8 px-3 rounded-lg border border-blue-300 text-blue-700 text-xs font-medium hover:bg-blue-50 flex items-center gap-1"
                        >
                          <CheckCircle2 size={12} /> Utilisé
                        </button>
                        <button
                          onClick={() => handleStatut(lm, "JETE")}
                          className="h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 flex items-center gap-1"
                        >
                          <X size={12} /> Jeté
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(lm)} className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-red-500" title="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
