"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldAlert, Save, Trash2, Phone, Stethoscope, Pill, FileText, AlertTriangle, ExternalLink } from "lucide-react";
import { getPAI, upsertPAI, supprimerPAI, type PAIInput } from "@/app/actions/pai";

interface PAITabProps {
  structureId: string;
  enfantId: string;
}

export function PAITab({ structureId, enfantId }: PAITabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [paiExiste, setPaiExiste] = useState(false);
  const [actif, setActif] = useState(false);
  const [allergenes, setAllergenes] = useState("");
  const [medicamentsAutorises, setMedicamentsAutorises] = useState("");
  const [protocoleUrgence, setProtocoleUrgence] = useState("");
  const [medecinNom, setMedecinNom] = useState("");
  const [medecinTel, setMedecinTel] = useState("");
  const [numeroUrgence, setNumeroUrgence] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [dateRevision, setDateRevision] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    const res = await getPAI(enfantId);
    if (res.success && res.data) {
      const p = res.data;
      setPaiExiste(true);
      setActif(p.actif);
      setAllergenes(p.allergenes.join(", "));
      setMedicamentsAutorises(p.medicaments_autorises ?? "");
      setProtocoleUrgence(p.protocole_urgence ?? "");
      setMedecinNom(p.medecin_nom ?? "");
      setMedecinTel(p.medecin_telephone ?? "");
      setNumeroUrgence(p.numero_urgence ?? "");
      setDocumentUrl(p.document_url ?? "");
      setDateRevision(p.date_revision ? p.date_revision.toISOString().split("T")[0] : "");
      setNotes(p.notes ?? "");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [enfantId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true);
    const payload: PAIInput = {
      enfant_id: enfantId,
      actif,
      allergenes: allergenes
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      medicaments_autorises: medicamentsAutorises || undefined,
      protocole_urgence: protocoleUrgence || undefined,
      medecin_nom: medecinNom || undefined,
      medecin_telephone: medecinTel || undefined,
      numero_urgence: numeroUrgence || undefined,
      document_url: documentUrl || undefined,
      date_revision: dateRevision || undefined,
      notes: notes || undefined,
    };
    const res = await upsertPAI(structureId, payload);
    setSaving(false);
    if (res.success) {
      toast.success(paiExiste ? "PAI mis à jour." : "PAI créé.");
      setPaiExiste(true);
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement le PAI de cet enfant ?")) return;
    const res = await supprimerPAI(enfantId);
    if (res.success) {
      toast.success("PAI supprimé.");
      setPaiExiste(false);
      setActif(false);
      setAllergenes("");
      setMedicamentsAutorises("");
      setProtocoleUrgence("");
      setMedecinNom("");
      setMedecinTel("");
      setNumeroUrgence("");
      setDocumentUrl("");
      setDateRevision("");
      setNotes("");
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
      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
        <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Le Projet d&apos;Accueil Individualisé (PAI) est un document légal. Il est visible uniquement par l&apos;équipe (jamais sur le portail parents).
          Quand l&apos;enfant est présent, une alerte s&apos;affiche dans le tableau de bord et la cloche.
        </p>
      </div>

      <label className="flex items-center justify-between p-3 rounded-xl bg-rzpanda-primary/5 border border-rzpanda-primary/30 cursor-pointer">
        <div>
          <p className="text-sm font-semibold text-gray-800">PAI actif</p>
          <p className="text-xs text-gray-500">L&apos;enfant a un PAI en cours de validité</p>
        </div>
        <button
          type="button"
          onClick={() => setActif((v) => !v)}
          role="switch"
          aria-checked={actif}
          className={`relative h-6 w-11 rounded-full transition-colors ${actif ? "bg-rzpanda-primary" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${actif ? "translate-x-5" : ""}`} />
        </button>
      </label>

      {actif && (
        <>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" /> Allergènes & médicaments
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Allergènes concernés (séparés par des virgules)
              </label>
              <input
                value={allergenes}
                onChange={(e) => setAllergenes(e.target.value)}
                placeholder="Ex : Arachide, lait de vache, œuf"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Pill size={12} /> Médicaments autorisés
              </label>
              <textarea
                value={medicamentsAutorises}
                onChange={(e) => setMedicamentsAutorises(e.target.value)}
                rows={2}
                placeholder="Liste des médicaments autorisés selon ordonnance jointe"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-600" /> Protocole d&apos;urgence
            </h3>
            <textarea
              value={protocoleUrgence}
              onChange={(e) => setProtocoleUrgence(e.target.value)}
              rows={4}
              placeholder="Décrivez les gestes à effectuer en cas d'urgence : symptômes à surveiller, médicaments à administrer, qui prévenir, etc."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm resize-none"
            />
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Stethoscope size={16} className="text-blue-600" /> Médecin référent
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                <input value={medecinNom} onChange={(e) => setMedecinNom(e.target.value)} placeholder="Dr Martin" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Phone size={12} /> Téléphone
                </label>
                <input
                  type="tel"
                  value={medecinTel}
                  onChange={(e) => setMedecinTel(e.target.value)}
                  placeholder="01 23 45 67 89"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Phone size={12} /> Numéro d&apos;urgence (en plus du SAMU)
                </label>
                <input
                  type="tel"
                  value={numeroUrgence}
                  onChange={(e) => setNumeroUrgence(e.target.value)}
                  placeholder="Ex : urgences pédiatriques de l'hôpital"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText size={16} className="text-gray-600" /> Document & révision
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Lien vers le document PAI (PDF)</label>
              <input
                type="url"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
              {documentUrl && (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-rzpanda-primary hover:underline mt-1 inline-flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Ouvrir le document
                </a>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date de révision prévue</label>
              <input type="date" value={dateRevision} onChange={(e) => setDateRevision(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Observations complémentaires"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-rzpanda-primary outline-none text-sm resize-none"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-5 rounded-xl bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {paiExiste ? "Enregistrer les modifications" : "Créer le PAI"}
        </button>
        {paiExiste && (
          <button
            onClick={handleDelete}
            className="h-11 px-4 rounded-xl border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={16} /> Supprimer
          </button>
        )}
      </div>
    </div>
  );
}
