"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";
import { getTransmissionsDuJour, creerTransmission } from "@/app/actions/transmissions";
import { getEnfants } from "@/app/actions/enfants";
import { toast } from "sonner";
import { Loader2, MessageSquare, Send, User, Baby, Users, Filter, Plus, X } from "lucide-react";

interface Enfant { id: string; prenom: string; nom: string }
interface Transmission {
  id: string; contenu: string; auteur: string; type_transm: string; date: string;
  enfant?: { id: string; prenom: string; nom: string } | null;
}

const TYPE_LABELS: Record<string, { label: string; icon: typeof MessageSquare; color: string }> = {
  GENERAL: { label: "Général", icon: MessageSquare, color: "bg-blue-100 text-blue-700" },
  ENFANT: { label: "Enfant", icon: Baby, color: "bg-green-100 text-green-700" },
  EQUIPE: { label: "Équipe", icon: Users, color: "bg-purple-100 text-purple-700" },
};

export default function TransmissionsPage() {
  const params = useParams();
  const structureId = params.structureId as string;
  const { user } = useAuth();
  const proNom = user?.user_metadata?.prenom ?? "Professionnel";

  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("GENERAL");
  const [formEnfant, setFormEnfant] = useState("");
  const [formContenu, setFormContenu] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    const [transRes, enfantsRes] = await Promise.all([
      getTransmissionsDuJour(structureId),
      getEnfants(structureId),
    ]);
    if (transRes.success && transRes.data) setTransmissions(transRes.data.map((t) => ({ ...t, date: (t.date as unknown as Date).toISOString?.() ?? t.date })) as Transmission[]);
    if (enfantsRes.success && enfantsRes.data) setEnfants(enfantsRes.data.map((e) => ({ id: e.id, prenom: e.prenom, nom: e.nom })));
    setLoading(false);
  }, [structureId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useRealtimeSubscription("Transmission", structureId, { onInsert: () => fetchAll() });

  const handleSubmit = async () => {
    if (!formContenu.trim()) { toast.error("Le contenu est requis."); return; }
    if (formType === "ENFANT" && !formEnfant) { toast.error("Sélectionnez un enfant."); return; }
    setSubmitting(true);

    const res = await creerTransmission({
      structure_id: structureId,
      contenu: formContenu.trim(),
      type_transm: formType,
      auteur: proNom,
      enfant_id: formType === "ENFANT" ? formEnfant : undefined,
    });

    setSubmitting(false);
    if (res.success) {
      toast.success("Transmission enregistrée");
      setFormContenu("");
      setFormEnfant("");
      setShowForm(false);
      fetchAll();
    } else {
      toast.error(res.error);
    }
  };

  const filtered = filter ? transmissions.filter((t) => t.type_transm === filter) : transmissions;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-petitsafe-primary" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Transmissions</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center">
        <Filter size={16} className="text-gray-400" />
        <button onClick={() => setFilter(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === null ? "bg-petitsafe-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Tous</button>
        {Object.entries(TYPE_LABELS).map(([key, val]) => (
          <button key={key} onClick={() => setFilter(filter === key ? null : key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === key ? "bg-petitsafe-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{val.label}</button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <MessageSquare size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Aucune transmission aujourd&apos;hui.</p>
            <p className="text-gray-300 text-xs mt-1">Cliquez sur le bouton + pour en ajouter une.</p>
          </div>
        ) : (
          filtered.map((t) => {
            const typeInfo = TYPE_LABELS[t.type_transm] ?? TYPE_LABELS.GENERAL;
            const Icon = typeInfo.icon;
            const heure = new Date(t.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

            return (
              <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{t.auteur}</span>
                      <span className="text-xs text-gray-400 font-mono">{heure}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>{typeInfo.label}</span>
                    </div>
                    {t.enfant && (
                      <p className="text-xs text-petitsafe-primary font-medium mb-1">
                        <Baby size={12} className="inline mr-1" />
                        {t.enfant.prenom} {t.enfant.nom}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{t.contenu}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick add form (slide-up) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg bg-white rounded-t-2xl p-5 shadow-xl animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Nouvelle transmission</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Fermer"><X size={20} /></button>
            </div>

            <div className="space-y-3">
              {/* Type selector */}
              <div className="flex gap-2">
                {Object.entries(TYPE_LABELS).map(([key, val]) => {
                  const Icon = val.icon;
                  return (
                    <button key={key} onClick={() => setFormType(key)}
                      className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-medium border transition-colors ${formType === key ? "border-petitsafe-primary bg-petitsafe-primary/10 text-petitsafe-primary" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      <Icon size={16} />
                      {val.label}
                    </button>
                  );
                })}
              </div>

              {/* Child selector */}
              {formType === "ENFANT" && (
                <select value={formEnfant} onChange={(e) => setFormEnfant(e.target.value)} className="w-full h-12 px-3 rounded-xl border border-gray-300 text-sm" aria-label="Enfant concerné">
                  <option value="">Sélectionner un enfant</option>
                  {enfants.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                </select>
              )}

              {/* Content */}
              <textarea value={formContenu} onChange={(e) => setFormContenu(e.target.value)} placeholder="Écrire la transmission..." rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-petitsafe-primary/30 focus:border-petitsafe-primary" aria-label="Contenu de la transmission" />

              <button onClick={handleSubmit} disabled={submitting || !formContenu.trim()}
                className="w-full h-12 rounded-xl bg-petitsafe-primary text-white text-sm font-medium hover:bg-petitsafe-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating action button */}
      <button onClick={() => setShowForm(true)}
        className="fixed bottom-24 md:bottom-8 right-6 h-14 w-14 rounded-full bg-petitsafe-primary text-white shadow-lg hover:bg-petitsafe-primary/90 flex items-center justify-center z-40 transition-transform hover:scale-105"
        aria-label="Nouvelle transmission">
        <Plus size={24} />
      </button>
    </div>
  );
}
