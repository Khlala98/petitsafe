"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { listerBoitesLait, creerBoiteLait, modifierBoiteLait, desactiverBoiteLait, supprimerBoiteLait } from "@/app/actions/boites-lait";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Pencil, Power, Trash2, Box, AlertTriangle } from "lucide-react";
import type { TypeBoiteLait } from "@prisma/client";

interface Boite {
  id: string;
  marque: string;
  type: TypeBoiteLait;
  numero_lot: string;
  dlc: string;
  date_ouverture: string | null;
  notes: string | null;
  actif: boolean;
}

const TYPES: { value: TypeBoiteLait; label: string }[] = [
  { value: "POUDRE", label: "Poudre" },
  { value: "LIQUIDE", label: "Liquide prêt à l'emploi" },
];

export default function BoitesLaitPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;

  const [boites, setBoites] = useState<Boite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Boite | null>(null);
  const [saving, setSaving] = useState(false);

  const [marque, setMarque] = useState("");
  const [type, setType] = useState<TypeBoiteLait>("POUDRE");
  const [numeroLot, setNumeroLot] = useState("");
  const [dlc, setDlc] = useState("");
  const [dateOuverture, setDateOuverture] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    const res = await listerBoitesLait(structureId);
    if (res.success && res.data) {
      setBoites(
        res.data.map((b) => ({
          id: b.id,
          marque: b.marque,
          type: b.type,
          numero_lot: b.numero_lot,
          dlc: b.dlc.toISOString(),
          date_ouverture: b.date_ouverture?.toISOString() ?? null,
          notes: b.notes,
          actif: b.actif,
        })),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setMarque("");
    setType("POUDRE");
    setNumeroLot("");
    setDlc("");
    setDateOuverture("");
    setNotes("");
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (b: Boite) => {
    setEditing(b);
    setMarque(b.marque);
    setType(b.type);
    setNumeroLot(b.numero_lot);
    setDlc(b.dlc.split("T")[0]);
    setDateOuverture(b.date_ouverture?.split("T")[0] ?? "");
    setNotes(b.notes ?? "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!marque.trim() || !numeroLot.trim() || !dlc) {
      toast.error("Marque, numéro de lot et DLC sont obligatoires.");
      return;
    }
    setSaving(true);
    const payload = {
      marque,
      type,
      numero_lot: numeroLot,
      dlc,
      date_ouverture: dateOuverture || undefined,
      notes: notes || undefined,
    };
    const res = editing
      ? await modifierBoiteLait(editing.id, payload)
      : await creerBoiteLait(structureId, payload);
    setSaving(false);
    if (res.success) {
      toast.success(editing ? "Boîte modifiée." : "Boîte ajoutée au catalogue.");
      resetForm();
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleToggleActif = async (b: Boite) => {
    if (b.actif && !confirm("Désactiver cette boîte ? Elle ne sera plus proposée à la préparation des biberons.")) return;
    const res = await modifierBoiteLait(b.id, { actif: !b.actif });
    if (res.success) {
      toast.success(b.actif ? "Boîte désactivée." : "Boîte réactivée.");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (b: Boite) => {
    if (!confirm(`Supprimer définitivement la boîte « ${b.marque} » (lot ${b.numero_lot}) ?`)) return;
    const res = await supprimerBoiteLait(b.id);
    if (res.success) {
      toast.success("Boîte supprimée.");
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
            <Box size={24} className="text-rzpanda-primary" />
            Catalogue des boîtes de lait
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enregistrez chaque boîte (marque + lot + DLC) une seule fois. Elle sera ensuite proposée dans la préparation des biberons.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="h-10 px-4 rounded-xl bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 flex items-center gap-2"
          >
            <Plus size={16} /> Nouvelle boîte
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-rzpanda-primary/30 space-y-4">
          <h2 className="font-semibold text-gray-800">{editing ? "Modifier la boîte" : "Nouvelle boîte"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Marque *</label>
              <input
                type="text"
                value={marque}
                onChange={(e) => setMarque(e.target.value)}
                placeholder="Ex : Gallia Calisma 1er âge"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
              <select value={type} onChange={(e) => setType(e.target.value as TypeBoiteLait)} className={`${inputClass} bg-white`}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Numéro de lot *</label>
              <input
                type="text"
                value={numeroLot}
                onChange={(e) => setNumeroLot(e.target.value)}
                placeholder="Ex : G2024-1150"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">DLC *</label>
              <input type="date" value={dlc} onChange={(e) => setDlc(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date d&apos;ouverture (si déjà ouverte)</label>
              <input
                type="date"
                value={dateOuverture}
                onChange={(e) => setDateOuverture(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optionnel"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-5 rounded-lg bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Enregistrer" : "Ajouter au catalogue"}
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
      ) : boites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Box size={32} className="mx-auto text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm">Aucune boîte enregistrée.</p>
          <p className="text-gray-300 text-xs mt-1">Ajoutez votre première boîte pour gagner du temps lors de la préparation.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {boites.map((b) => {
            const dlcDate = new Date(b.dlc);
            const dlcExpiree = dlcDate < now;
            const dlcProche = !dlcExpiree && (dlcDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 7;
            return (
              <div
                key={b.id}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  !b.actif ? "bg-gray-50 border-gray-200 opacity-60" : dlcExpiree ? "bg-red-50 border-red-200" : dlcProche ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">{b.marque}</p>
                    <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                      {b.type === "POUDRE" ? "Poudre" : "Liquide"}
                    </span>
                    {!b.actif && (
                      <span className="text-[10px] font-medium bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Inactive</span>
                    )}
                    {dlcExpiree && b.actif && (
                      <span className="text-[10px] font-medium bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle size={10} /> DLC dépassée
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Lot {b.numero_lot} · DLC {dlcDate.toLocaleDateString("fr-FR")}
                    {b.date_ouverture && ` · Ouverte le ${new Date(b.date_ouverture).toLocaleDateString("fr-FR")}`}
                  </p>
                  {b.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{b.notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(b)} className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-gray-600" title="Modifier">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleToggleActif(b)}
                    className={`p-2 rounded-lg hover:bg-white ${b.actif ? "text-gray-400 hover:text-orange-500" : "text-gray-400 hover:text-green-500"}`}
                    title={b.actif ? "Désactiver" : "Réactiver"}
                  >
                    <Power size={14} />
                  </button>
                  <button onClick={() => handleDelete(b)} className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-red-500" title="Supprimer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
