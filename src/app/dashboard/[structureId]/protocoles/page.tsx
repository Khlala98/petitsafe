"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getProtocoles, creerProtocole, modifierProtocole, archiverProtocole } from "@/app/actions/protocoles";
import { CATEGORIES_PROTOCOLE } from "@/lib/schemas/protocole";
import { toast } from "sonner";
import { Loader2, FileText, Plus, Search, Edit, Archive, ArrowLeft, ChevronRight, X } from "lucide-react";

interface Protocole {
  id: string; titre: string; categorie: string; contenu_markdown: string; version: number; cree_par: string; date_creation: string;
}

const CATEGORIE_COLORS: Record<string, string> = {
  "Hygiène": "bg-blue-100 text-blue-700",
  "Sécurité": "bg-red-100 text-red-700",
  "Alimentation": "bg-green-100 text-green-700",
  "Change": "bg-purple-100 text-purple-700",
  "Biberonnerie": "bg-pink-100 text-pink-700",
  "Autre": "bg-gray-100 text-gray-700",
};

export default function ProtocolesPage() {
  const params = useParams();
  const structureId = params.structureId as string;
  const { user, activeRole } = useAuth();
  const userId = user?.id ?? "";
  const isGestionnaire = activeRole === "GESTIONNAIRE";

  const [protocoles, setProtocoles] = useState<Protocole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitre, setFormTitre] = useState("");
  const [formCategorie, setFormCategorie] = useState<string>(CATEGORIES_PROTOCOLE[0]);
  const [formContenu, setFormContenu] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProtocoles = useCallback(async () => {
    const res = await getProtocoles(structureId);
    if (res.success && res.data) setProtocoles(res.data.map((p) => ({ ...p, date_creation: (p.date_creation as unknown as Date).toISOString?.() ?? String(p.date_creation) })) as Protocole[]);
    setLoading(false);
  }, [structureId]);

  useEffect(() => { fetchProtocoles(); }, [fetchProtocoles]);

  const openCreate = () => {
    setEditingId(null);
    setFormTitre("");
    setFormCategorie(CATEGORIES_PROTOCOLE[0]);
    setFormContenu("");
    setShowForm(true);
  };

  const openEdit = (p: Protocole) => {
    setEditingId(p.id);
    setFormTitre(p.titre);
    setFormCategorie(p.categorie);
    setFormContenu(p.contenu_markdown);
    setShowForm(true);
    setSelectedId(null);
  };

  const handleSubmit = async () => {
    if (!formTitre.trim() || !formContenu.trim()) { toast.error("Titre et contenu requis."); return; }
    setSubmitting(true);

    const data = { titre: formTitre.trim(), categorie: formCategorie, contenu_markdown: formContenu.trim() };
    const res = editingId
      ? await modifierProtocole(editingId, structureId, data)
      : await creerProtocole(structureId, data, userId);

    setSubmitting(false);
    if (res.success) {
      toast.success(editingId ? "Protocole modifié" : "Protocole créé");
      setShowForm(false);
      fetchProtocoles();
    } else {
      toast.error(res.error);
    }
  };

  const handleArchiver = async (id: string) => {
    if (!confirm("Archiver ce protocole ?")) return;
    const res = await archiverProtocole(id, structureId);
    if (res.success) { toast.success("Protocole archivé"); setSelectedId(null); fetchProtocoles(); }
    else toast.error(res.error);
  };

  // Filter & search
  const filtered = protocoles.filter((p) => {
    if (filterCat && p.categorie !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.titre.toLowerCase().includes(q) || p.contenu_markdown.toLowerCase().includes(q);
    }
    return true;
  });

  // Group by category
  const grouped: Record<string, Protocole[]> = {};
  for (const p of filtered) {
    if (!grouped[p.categorie]) grouped[p.categorie] = [];
    grouped[p.categorie].push(p);
  }

  const selected = selectedId ? protocoles.find((p) => p.id === selectedId) : null;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-petitsafe-primary" /></div>;

  // ═══ DETAIL VIEW ═══
  if (selected) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-petitsafe-primary">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{selected.titre}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIE_COLORS[selected.categorie] ?? CATEGORIE_COLORS["Autre"]}`}>{selected.categorie}</span>
                <span className="text-xs text-gray-400">v{selected.version}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{new Date(selected.date_creation).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
            {isGestionnaire && (
              <div className="flex gap-2">
                <button onClick={() => openEdit(selected)} className="p-2 rounded-lg text-gray-400 hover:text-petitsafe-primary hover:bg-petitsafe-primary/5" aria-label="Modifier">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleArchiver(selected.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50" aria-label="Archiver">
                  <Archive size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Render markdown as plain text with line breaks */}
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {selected.contenu_markdown}
          </div>
        </div>
      </div>
    );
  }

  // ═══ FORM VIEW ═══
  if (showForm) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-petitsafe-primary">
          <ArrowLeft size={16} /> Annuler
        </button>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">{editingId ? "Modifier le protocole" : "Nouveau protocole"}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input value={formTitre} onChange={(e) => setFormTitre(e.target.value)} placeholder="Titre du protocole"
              className="w-full h-12 px-3 rounded-xl border border-gray-300 text-sm" aria-label="Titre du protocole" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select value={formCategorie} onChange={(e) => setFormCategorie(e.target.value)}
              className="w-full h-12 px-3 rounded-xl border border-gray-300 text-sm" aria-label="Catégorie">
              {CATEGORIES_PROTOCOLE.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu (Markdown)</label>
            <textarea value={formContenu} onChange={(e) => setFormContenu(e.target.value)} placeholder="Écrivez le contenu du protocole…" rows={12}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm resize-y font-mono focus:outline-none focus:ring-2 focus:ring-petitsafe-primary/30 focus:border-petitsafe-primary" aria-label="Contenu du protocole" />
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full h-12 rounded-xl bg-petitsafe-primary text-white text-sm font-medium hover:bg-petitsafe-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {editingId ? "Enregistrer les modifications" : "Créer le protocole"}
          </button>
        </div>
      </div>
    );
  }

  // ═══ LIST VIEW ═══
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Protocoles</h1>
        {isGestionnaire && (
          <button onClick={openCreate} className="h-10 px-4 rounded-xl bg-petitsafe-primary text-white text-sm font-medium hover:bg-petitsafe-primary/90 flex items-center gap-2">
            <Plus size={16} /> Nouveau
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un protocole…"
          className="w-full h-12 pl-10 pr-3 rounded-xl border border-gray-300 text-sm" aria-label="Rechercher" />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCat === null ? "bg-petitsafe-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Tous</button>
        {CATEGORIES_PROTOCOLE.map((c) => (
          <button key={c} onClick={() => setFilterCat(filterCat === c ? null : c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCat === c ? "bg-petitsafe-primary text-white" : CATEGORIE_COLORS[c] ?? "bg-gray-100 text-gray-600"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grouped list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <FileText size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">Aucun protocole trouvé.</p>
          {isGestionnaire && <p className="text-gray-300 text-xs mt-1">Créez votre premier protocole.</p>}
        </div>
      ) : (
        Object.entries(grouped).map(([cat, protos]) => (
          <div key={cat}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{cat}</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
              {protos.map((p) => (
                <button key={p.id} onClick={() => setSelectedId(p.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left transition-colors">
                  <div className="shrink-0 h-10 w-10 rounded-xl bg-petitsafe-primary/10 flex items-center justify-center">
                    <FileText size={18} className="text-petitsafe-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.titre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${CATEGORIE_COLORS[p.categorie] ?? CATEGORIE_COLORS["Autre"]}`}>{p.categorie}</span>
                      <span className="text-xs text-gray-400">v{p.version}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
