"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEnfant, supprimerEnfant, archiverEnfant } from "@/app/actions/enfants";
import { getTransmissionsEnfant } from "@/app/actions/transmissions";
import { genererTokenPortail, regenererTokenPortail } from "@/app/actions/portail-parents";
import { calculerAge } from "@/lib/business-logic";
import { BadgeAllergie } from "@/components/shared/badge-allergie";
import { BadgeRegime } from "@/components/shared/badge-regime";
import { Loader2, ArrowLeft, Edit, Trash2, Phone, User, MessageSquare, Link2, Copy, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useProfil } from "@/hooks/use-profil";
import { MedicamentsTab } from "@/components/enfants/medicaments-tab";
import { PAITab } from "@/components/enfants/pai-tab";
import { getPAI } from "@/app/actions/pai";

interface Enfant {
  id: string; prenom: string; nom: string; date_naissance: string; sexe?: string | null;
  groupe?: string | null; photo_url?: string | null;
  allergies: { id: string; allergene: string; severite: "LEGERE" | "MODEREE" | "SEVERE"; protocole?: string | null; document_pai?: string | null }[];
  contacts: { id: string; nom: string; lien: string; telephone: string; est_autorise_recuperer: boolean; ordre_priorite: number }[];
  regimes: string[];
}

interface TransmissionEnfant {
  id: string; contenu: string; auteur: string; date: string; type_transm: string;
}

const TABS = ["Infos générales", "Allergies & Santé", "Contacts urgence", "Médicaments", "PAI", "Transmissions"];
const SEVERITE_LABELS: Record<string, string> = { LEGERE: "Légère", MODEREE: "Modérée", SEVERE: "Sévère" };
const COULEURS_AVATAR = ["#66bb6a", "#4caf50", "#F4A261", "#E53E3E", "#8E44AD", "#F39C12"];

export default function FicheEnfantPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;
  const enfantId = params.id as string;
  const { isAdmin } = useProfil();
  const [enfant, setEnfant] = useState<Enfant | null>(null);
  const [transmissions, setTransmissions] = useState<TransmissionEnfant[]>([]);
  const [paiActif, setPaiActif] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [result, transRes, paiRes] = await Promise.all([
        getEnfant(enfantId, structureId),
        getTransmissionsEnfant(structureId, enfantId),
        getPAI(enfantId),
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
      if (paiRes.success && paiRes.data) {
        setPaiActif(paiRes.data.actif);
      }
      setLoading(false);
    };
    fetchData();
  }, [enfantId, structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleArchive = async () => {
    if (!confirm("Archiver cet enfant ? Il n'apparaîtra plus dans la liste mais son historique sera conservé.")) return;
    const result = await archiverEnfant(enfantId, structureId);
    if (result.success) { toast.success("Enfant archivé."); router.push(`/dashboard/${structureId}/enfants`); }
    else toast.error(result.error);
  };

  const handleDelete = async () => {
    if (!enfant) return;
    if (!confirm(`Supprimer définitivement ${enfant.prenom} ${enfant.nom} ?`)) return;
    if (!confirm("Cette action est IRRÉVERSIBLE. Tous les biberons, repas, changes, siestes, transmissions et allergies liés seront également supprimés. Confirmer ?")) return;
    const result = await supprimerEnfant(enfantId, structureId);
    if (result.success) { toast.success("Enfant supprimé."); router.push(`/dashboard/${structureId}/enfants`); }
    else toast.error(result.error);
  };

  const handleGenererLien = async () => {
    setPortalLoading(true);
    const res = await genererTokenPortail(enfantId, structureId);
    setPortalLoading(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    if (res.data) {
      const url = `${window.location.origin}/portail/${res.data.token}`;
      setPortalUrl(url);
    }
  };

  const handleRegenererLien = async () => {
    if (!confirm("Régénérer le lien ? L'ancien lien ne fonctionnera plus.")) return;
    setPortalLoading(true);
    const res = await regenererTokenPortail(enfantId, structureId);
    setPortalLoading(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    if (res.data) {
      const url = `${window.location.origin}/portail/${res.data.token}`;
      setPortalUrl(url);
      toast.success("Nouveau lien généré");
    }
  };

  const handleCopyLink = () => {
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl);
    toast.success("Lien copié dans le presse-papiers");
  };

  if (loading || !enfant) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-rzpanda-primary" /></div>;

  const age = calculerAge(new Date(enfant.date_naissance), new Date());
  const couleur = COULEURS_AVATAR[enfant.prenom.charCodeAt(0) % COULEURS_AVATAR.length];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push(`/dashboard/${structureId}/enfants`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-rzpanda-primary">
          <ArrowLeft size={16} /> Retour
        </button>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => router.push(`/dashboard/${structureId}/enfants/${enfantId}/modifier`)}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              <Edit size={14} /> Modifier
            </button>
            <button onClick={handleArchive} className="h-9 px-3 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              <Edit size={14} /> Archiver
            </button>
            <button onClick={handleDelete} className="h-9 px-3 rounded-lg border border-red-300 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        )}
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

      {/* PAI badge */}
      {paiActif && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">PAI actif</p>
            <p className="text-xs text-amber-700">
              Cet enfant a un Projet d&apos;Accueil Individualisé. Consultez l&apos;onglet PAI pour le protocole d&apos;urgence.
            </p>
          </div>
          <button
            onClick={() => setActiveTab(4)}
            className="text-xs font-medium text-amber-700 hover:underline shrink-0"
          >
            Voir le PAI →
          </button>
        </div>
      )}

      {/* Allergie & régime banners */}
      {enfant.allergies.length > 0 && <BadgeAllergie enfant={enfant} />}
      {enfant.regimes.length > 0 && <BadgeRegime enfant={enfant} />}

      {/* Portail parents */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={16} className="text-rzpanda-primary" />
          <h3 className="text-sm font-semibold text-gray-700">Portail Parents</h3>
        </div>

        {portalUrl ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input value={portalUrl} readOnly className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-600 truncate" />
              <button onClick={handleCopyLink} className="h-10 px-3 rounded-lg bg-rzpanda-primary text-white hover:bg-rzpanda-primary/90 flex items-center gap-1.5 shrink-0">
                <Copy size={14} /> <span className="text-sm">Copier</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Partagez ce lien aux parents pour qu&apos;ils consultent les activités.</p>
              <button onClick={handleRegenererLien} disabled={portalLoading}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                <RefreshCw size={12} /> Régénérer
              </button>
            </div>
          </div>
        ) : (
          <button onClick={handleGenererLien} disabled={portalLoading}
            className="w-full h-10 rounded-lg bg-rzpanda-primary/10 text-rzpanda-primary text-sm font-medium hover:bg-rzpanda-primary/20 flex items-center justify-center gap-2 disabled:opacity-50">
            {portalLoading ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
            Générer le lien portail parents
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === i ? "border-rzpanda-primary text-rzpanda-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
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
          <div className="space-y-6">
            {/* Allergies */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Allergies</h3>
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
                    {a.document_pai && <a href={a.document_pai} target="_blank" rel="noreferrer" className="text-sm text-rzpanda-primary hover:underline mt-1 block">Voir le PAI</a>}
                  </div>
                ))
              )}
            </div>

            {/* Régimes alimentaires */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Régimes alimentaires</h3>
              {enfant.regimes.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucun régime particulier.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {enfant.regimes.map((r) => (
                    <span key={r} className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{r}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-3">
            {enfant.contacts.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun contact d&apos;urgence.</p>
            ) : (
              enfant.contacts.sort((a, b) => a.ordre_priorite - b.ordre_priorite).map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="h-10 w-10 rounded-full bg-rzpanda-primary/10 flex items-center justify-center shrink-0">
                    <User size={18} className="text-rzpanda-primary" />
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

        {activeTab === 3 && <MedicamentsTab structureId={structureId} enfantId={enfantId} />}

        {activeTab === 4 && <PAITab structureId={structureId} enfantId={enfantId} />}

        {activeTab === 5 && (
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
