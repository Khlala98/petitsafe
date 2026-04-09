"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useProfil } from "@/hooks/use-profil";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";
import { getTransmissionsDuJour, creerTransmission } from "@/app/actions/transmissions";
import { getEnfants } from "@/app/actions/enfants";
import { listerProfils, modifierProfil } from "@/app/actions/profils";
import type { ProfilActif } from "@/hooks/use-profil";
import { toast } from "sonner";
import { Loader2, MessageSquare, Send, User, Baby, Users, Filter, Plus, X, Search, Phone, Mail, Award, BookOpen, Pencil } from "lucide-react";

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
  const { profil, isAdmin } = useProfil();
  const proNom = profil?.prenom ?? user?.user_metadata?.prenom ?? "Professionnel";
  const [tab, setTab] = useState<"transmissions" | "annuaire">("transmissions");
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [profilsEquipe, setProfilsEquipe] = useState<ProfilActif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("GENERAL");
  const [formEnfant, setFormEnfant] = useState("");
  const [formDestinataire, setFormDestinataire] = useState("");
  const [formContenu, setFormContenu] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Annuaire
  const [annuaireSearch, setAnnuaireSearch] = useState("");
  const [selectedMembre, setSelectedMembre] = useState<ProfilActif | null>(null);
  const [editNotes, setEditNotes] = useState(false);
  const [notesTemp, setNotesTemp] = useState("");

  const fetchAll = useCallback(async () => {
    const [transRes, enfantsRes, profilsRes] = await Promise.all([
      getTransmissionsDuJour(structureId),
      getEnfants(structureId),
      listerProfils(structureId),
    ]);
    if (transRes.success && transRes.data) setTransmissions(transRes.data.map((t) => ({ ...t, date: (t.date as unknown as Date).toISOString?.() ?? t.date })) as Transmission[]);
    if (enfantsRes.success && enfantsRes.data) setEnfants(enfantsRes.data.map((e) => ({ id: e.id, prenom: e.prenom, nom: e.nom })));
    if (profilsRes.success) setProfilsEquipe(profilsRes.data as ProfilActif[]);
    setLoading(false);
  }, [structureId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useRealtimeSubscription("Transmission", structureId, { onInsert: () => fetchAll() });

  const handleSubmit = async () => {
    if (!formContenu.trim()) { toast.error("Le contenu est requis."); return; }
    if (formType === "ENFANT" && !formEnfant) { toast.error("Sélectionnez un enfant."); return; }
    setSubmitting(true);

    let contenuFinal = formContenu.trim();
    if (formType === "EQUIPE" && formDestinataire) {
      const dest = profilsEquipe.find((p) => p.id === formDestinataire);
      if (dest) contenuFinal = `@${dest.prenom} ${dest.nom} — ${contenuFinal}`;
    }

    const res = await creerTransmission({
      structure_id: structureId,
      contenu: contenuFinal,
      type_transm: formType,
      auteur: proNom,
      profil_id: profil?.id,
      enfant_id: formType === "ENFANT" ? formEnfant : undefined,
    });

    setSubmitting(false);
    if (res.success) {
      toast.success("Transmission enregistrée");
      setFormContenu("");
      setFormEnfant("");
      setFormDestinataire("");
      setShowForm(false);
      fetchAll();
    } else {
      toast.error(res.error);
    }
  };

  const filtered = filter ? transmissions.filter((t) => t.type_transm === filter) : transmissions;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-rzpanda-primary" /></div>;

  const handleSaveNotes = async () => {
    if (!selectedMembre) return;
    const res = await modifierProfil(selectedMembre.id, { notes: notesTemp });
    if (res.success) {
      toast.success("Notes enregistrées");
      setEditNotes(false);
      setSelectedMembre({ ...selectedMembre, notes: notesTemp });
      fetchAll();
    } else {
      toast.error(res.error);
    }
  };

  const annuaireFiltered = profilsEquipe.filter((p) =>
    `${p.prenom} ${p.nom}`.toLowerCase().includes(annuaireSearch.toLowerCase())
  );

  const COULEURS_ANNUAIRE = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-orange-500"];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Transmissions</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button onClick={() => setTab("transmissions")}
          className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-colors ${tab === "transmissions" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <MessageSquare size={16} /> Messages
        </button>
        <button onClick={() => setTab("annuaire")}
          className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-colors ${tab === "annuaire" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Users size={16} /> Annuaire ({profilsEquipe.length})
        </button>
      </div>

      {tab === "transmissions" ? (
        <>
          {/* Filters */}
          <div className="flex gap-2 items-center">
            <Filter size={16} className="text-gray-400" />
            <button onClick={() => setFilter(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === null ? "bg-rzpanda-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Tous</button>
            {Object.entries(TYPE_LABELS).map(([key, val]) => (
              <button key={key} onClick={() => setFilter(filter === key ? null : key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === key ? "bg-rzpanda-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{val.label}</button>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                <MessageSquare size={64} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">Aucune transmission aujourd&apos;hui</p>
                <p className="text-gray-400 text-sm mt-1">Cliquez sur + pour en ajouter une.</p>
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
                          <p className="text-xs text-rzpanda-primary font-medium mb-1">
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

          {/* Floating action button */}
          <button onClick={() => setShowForm(true)}
            className="fixed bottom-24 md:bottom-8 right-6 h-14 w-14 rounded-full bg-rzpanda-primary text-white shadow-lg hover:bg-rzpanda-primary/90 flex items-center justify-center z-40 transition-transform hover:scale-105"
            aria-label="Nouvelle transmission">
            <Plus size={24} />
          </button>
        </>
      ) : (
        /* ═══ ANNUAIRE ═══ */
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher un membre..." value={annuaireSearch} onChange={(e) => setAnnuaireSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm" />
          </div>

          {/* Profils list */}
          {annuaireFiltered.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <Users size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 text-sm">Aucun membre trouvé.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {annuaireFiltered.map((p, idx) => (
                <button key={p.id} onClick={() => { setSelectedMembre(p); setNotesTemp(p.notes || ""); setEditNotes(false); }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full ${COULEURS_ANNUAIRE[idx % COULEURS_ANNUAIRE.length]} flex items-center justify-center text-white text-sm font-bold`}>
                      {p.prenom.charAt(0)}{p.nom.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{p.prenom} {p.nom}</p>
                      <p className="text-xs text-gray-500">{p.poste || "—"}</p>
                      {p.role === "ADMINISTRATEUR" && (
                        <span className="inline-block mt-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Admin</span>
                      )}
                    </div>
                    {p.telephone && <Phone size={14} className="text-gray-300 shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Membre detail modal */}
          {selectedMembre && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelectedMembre(null)}>
              <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-rzpanda-primary flex items-center justify-center text-white text-lg font-bold">
                      {selectedMembre.prenom.charAt(0)}{selectedMembre.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-800">{selectedMembre.prenom} {selectedMembre.nom}</p>
                      <p className="text-sm text-gray-500">{selectedMembre.poste || "—"}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedMembre(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
                </div>

                <div className="space-y-2">
                  {selectedMembre.telephone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Phone size={16} className="text-gray-400" />
                      <a href={`tel:${selectedMembre.telephone}`} className="text-sm text-rzpanda-primary hover:underline">{selectedMembre.telephone}</a>
                    </div>
                  )}
                  {selectedMembre.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Mail size={16} className="text-gray-400" />
                      <a href={`mailto:${selectedMembre.email}`} className="text-sm text-rzpanda-primary hover:underline">{selectedMembre.email}</a>
                    </div>
                  )}
                  {selectedMembre.certifications && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Award size={16} className="text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700">{selectedMembre.certifications}</p>
                    </div>
                  )}
                  {/* Notes */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <BookOpen size={16} className="text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      {editNotes ? (
                        <div className="space-y-2">
                          <textarea value={notesTemp} onChange={(e) => setNotesTemp(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-sm resize-none" rows={3} placeholder="Notes, horaires, contrat..." />
                          <div className="flex gap-2">
                            <button onClick={handleSaveNotes} className="h-8 px-3 rounded-lg bg-rzpanda-primary text-white text-xs font-medium">Enregistrer</button>
                            <button onClick={() => setEditNotes(false)} className="h-8 px-3 rounded-lg border border-gray-300 text-xs text-gray-600">Annuler</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-gray-700">{selectedMembre.notes || <span className="text-gray-400 italic">Aucune note</span>}</p>
                          {isAdmin && (
                            <button onClick={() => setEditNotes(true)} className="p-1 rounded hover:bg-gray-200 text-gray-400" title="Modifier les notes">
                              <Pencil size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Envoyer une transmission ciblée */}
                <button onClick={() => {
                  setSelectedMembre(null);
                  setFormType("EQUIPE");
                  setFormDestinataire(selectedMembre.id);
                  setShowForm(true);
                }} className="w-full h-11 rounded-xl border border-rzpanda-primary text-rzpanda-primary text-sm font-medium hover:bg-rzpanda-primary/5 flex items-center justify-center gap-2">
                  <Send size={16} />
                  Envoyer une transmission à {selectedMembre.prenom}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
                  const TypeIcon = val.icon;
                  return (
                    <button key={key} onClick={() => { setFormType(key); if (key !== "EQUIPE") setFormDestinataire(""); }}
                      className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-medium border transition-colors ${formType === key ? "border-rzpanda-primary bg-rzpanda-primary/10 text-rzpanda-primary" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      <TypeIcon size={16} />
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

              {/* Destinataire selector (équipe) */}
              {formType === "EQUIPE" && (
                <select value={formDestinataire} onChange={(e) => setFormDestinataire(e.target.value)} className="w-full h-12 px-3 rounded-xl border border-gray-300 text-sm" aria-label="Destinataire">
                  <option value="">Toute l&apos;équipe</option>
                  {profilsEquipe.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                </select>
              )}

              {/* Content */}
              <textarea value={formContenu} onChange={(e) => setFormContenu(e.target.value)} placeholder="Écrire la transmission..." rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rzpanda-primary/30 focus:border-rzpanda-primary" aria-label="Contenu de la transmission" />

              <button onClick={handleSubmit} disabled={submitting || !formContenu.trim()}
                className="w-full h-12 rounded-xl bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
