"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEnfant, supprimerEnfant } from "@/app/actions/enfants";
import { getTransmissionsEnfant } from "@/app/actions/transmissions";
import { calculerAge } from "@/lib/business-logic";
import { BadgeAllergie } from "@/components/shared/badge-allergie";
import { Loader2, ArrowLeft, Edit, Trash2, Phone, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Enfant {
  id: string; prenom: string; nom: string; date_naissance: string; sexe?: string | null;
  groupe?: string | null; photo_url?: string | null;
  allergies: { id: string; allergene: string; severite: "LEGERE" | "MODEREE" | "SEVERE"; protocole?: string | null; document_pai?: string | null }[];
  contacts: { id: string; nom: string; lien: string; telephone: string; est_autorise_recuperer: boolean; ordre_priorite: number }[];
}

interface TransmissionEnfant {
  id: string; contenu: string; auteur: string; date: string; type_transm: string;
}

const TABS = ["Infos générales", "Allergies & Santé", "Contacts urgence", "Transmissions"];
const SEVERITE_LABELS: Record<string, string> = { LEGERE: "Légère", MODEREE: "Modérée", SEVERE: "Sévère" };
const COULEURS_AVATAR = ["#2E86C1", "#27AE60", "#F4A261", "#E53E3E", "#8E44AD", "#F39C12"];

export default function FicheEnfantPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;
  const enfantId = params.id as string;
  const [enfant, setEnfant] = useState<Enfant | null>(null);
  const [transmissions, setTransmissions] = useState<TransmissionEnfant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [result, transRes] = await Promise.all([
        getEnfant(enfantId, structureId),
        getTransmissionsEnfant(structureId, enfantId),
      ]);
      if (result.success && result.data) {
        setEnfant({ ...result.data, date_naissance: result.data.date_naissance.toISOString() });
      } else {
        toast.error(result.error ?? "Enfant non trouvé.");
        router.push(`/dashboard/${structureId}/enfants`);
      }
      if (transRes.success && transRes.data) {
        setTransmissions(transRes.data.map((t) => ({ ...t, date: (t.date as unknown as Date).toISOString?.() ?? String(t.date) })) as TransmissionEnfant[]);
      }
      setLoading(false);
    };
    fetchData();
  }, [enfantId, structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir archiver cet enfant ?")) return;
    const result = await supprimerEnfant(enfantId, structureId);
    if (result.success) { toast.success("Enfant archivé."); router.push(`/dashboard/${structureId}/enfants`); }
    else toast.error(result.error);
  };

  if (loading || !enfant) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-petitsafe-primary" /></div>;

  const age = calculerAge(new Date(enfant.date_naissance), new Date());
  const couleur = COULEURS_AVATAR[enfant.prenom.charCodeAt(0) % COULEURS_AVATAR.length];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push(`/dashboard/${structureId}/enfants`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-petitsafe-primary">
          <ArrowLeft size={16} /> Retour
        </button>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/dashboard/${structureId}/enfants/${enfantId}/modifier`)}
            className="h-9 px-3 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <Edit size={14} /> Modifier
          </button>
          <button onClick={handleDelete} className="h-9 px-3 rounded-lg border border-red-200 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
            <Trash2 size={14} /> Archiver
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        {enfant.photo_url ? (
          <img src={enfant.photo_url} alt={enfant.prenom} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: couleur }}>
            {enfant.prenom.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{enfant.prenom} {enfant.nom}</h1>
          <p className="text-sm text-gray-500">{age}{enfant.groupe ? ` · ${enfant.groupe}` : ""}{enfant.sexe ? ` · ${enfant.sexe === "FILLE" ? "Fille" : "Garçon"}` : ""}</p>
        </div>
      </div>

      {/* Allergie banner */}
      {enfant.allergies.length > 0 && <BadgeAllergie enfant={enfant} />}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === i ? "border-petitsafe-primary text-petitsafe-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {activeTab === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400 uppercase">Prénom</p><p className="font-medium">{enfant.prenom}</p></div>
              <div><p className="text-xs text-gray-400 uppercase">Nom</p><p className="font-medium">{enfant.nom}</p></div>
              <div><p className="text-xs text-gray-400 uppercase">Date de naissance</p><p className="font-medium">{new Date(enfant.date_naissance).toLocaleDateString("fr-FR")}</p></div>
              <div><p className="text-xs text-gray-400 uppercase">Âge</p><p className="font-medium">{age}</p></div>
              <div><p className="text-xs text-gray-400 uppercase">Groupe</p><p className="font-medium">{enfant.groupe ?? "Non assigné"}</p></div>
              <div><p className="text-xs text-gray-400 uppercase">Sexe</p><p className="font-medium">{enfant.sexe === "FILLE" ? "Fille" : enfant.sexe === "GARCON" ? "Garçon" : "Non renseigné"}</p></div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-4">
            {enfant.allergies.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucune allergie enregistrée.</p>
            ) : (
              enfant.allergies.map((a) => (
                <div key={a.id} className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-red-800">{a.allergene}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.severite === "SEVERE" ? "bg-red-200 text-red-800" : a.severite === "MODEREE" ? "bg-orange-200 text-orange-800" : "bg-yellow-200 text-yellow-800"}`}>
                      {SEVERITE_LABELS[a.severite]}
                    </span>
                  </div>
                  {a.protocole && <p className="text-sm text-red-700 mt-2">{a.protocole}</p>}
                  {a.document_pai && <a href={a.document_pai} target="_blank" rel="noreferrer" className="text-sm text-petitsafe-primary hover:underline mt-1 block">Voir le PAI</a>}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-3">
            {enfant.contacts.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun contact d&apos;urgence.</p>
            ) : (
              enfant.contacts.sort((a, b) => a.ordre_priorite - b.ordre_priorite).map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="h-10 w-10 rounded-full bg-petitsafe-primary/10 flex items-center justify-center shrink-0">
                    <User size={18} className="text-petitsafe-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{c.nom} <span className="text-sm text-gray-400">({c.lien})</span></p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone size={12} /> {c.telephone}
                      {c.est_autorise_recuperer && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Autorisé à récupérer</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">#{c.ordre_priorite}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-3">
            {transmissions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">Aucune transmission pour cet enfant.</p>
              </div>
            ) : (
              transmissions.map((t) => (
                <div key={t.id} className="p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">{t.auteur}</span>
                    <span className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString("fr-FR")} à {new Date(t.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{t.contenu}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
