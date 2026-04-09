"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getEnfants } from "@/app/actions/enfants";
import { creerBiberon } from "@/app/actions/biberons";
import { isBoiteLaitExpiree } from "@/lib/business-logic";
import { TYPES_LAIT, QUANTITES_BIBERON_ML } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { useProfil } from "@/hooks/use-profil";
import { BadgeAllergie } from "@/components/shared/badge-allergie";
import { BadgeRegime } from "@/components/shared/badge-regime";
import { toast } from "sonner";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";

interface Enfant {
  id: string; prenom: string; nom: string;
  allergies: { id: string; allergene: string; severite: "LEGERE" | "MODEREE" | "SEVERE" }[];
  regimes: string[];
}

const PLV_KEYWORDS = ["lait de vache", "plv", "protéines de lait", "lactose", "caséine"];

function hasPLVAllergy(allergies: { allergene: string }[]): boolean {
  return allergies.some((a) => PLV_KEYWORDS.some((kw) => a.allergene.toLowerCase().includes(kw)));
}

function isLaitIncompatible(typeLait: string, hasPLV: boolean): boolean {
  if (!hasPLV) return false;
  return ["1er âge", "2ème âge", "Croissance"].includes(typeLait);
}

function NouveauBiberonContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const structureId = params.structureId as string;
  const preselectedEnfantId = searchParams.get("enfant");
  const { user } = useAuth();
  const { profil } = useProfil();

  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [selectedEnfantId, setSelectedEnfantId] = useState<string>(preselectedEnfantId ?? "");
  const [typeLait, setTypeLait] = useState("");
  const [nomLait, setNomLait] = useState("");
  const [numeroLot, setNumeroLot] = useState("");
  const [datePeremption, setDatePeremption] = useState("");
  const [dateOuverture, setDateOuverture] = useState(new Date().toISOString().split("T")[0]);
  const [dosettes, setDosettes] = useState<number | "">("");
  const [quantite, setQuantite] = useState<number | "">("");
  const [preparateur, setPreparateur] = useState(profil?.prenom ?? user?.user_metadata?.prenom ?? "");
  const [observations, setObservations] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const result = await getEnfants(structureId);
      if (result.success && result.data) {
        setEnfants(result.data.map((e) => ({ id: e.id, prenom: e.prenom, nom: e.nom, allergies: e.allergies, regimes: e.regimes })));
      }
      setLoading(false);
    };
    fetch();
  }, [structureId]);

  useEffect(() => { setPreparateur(profil?.prenom ?? user?.user_metadata?.prenom ?? ""); }, [profil, user]);

  const selected = enfants.find((e) => e.id === selectedEnfantId) ?? null;
  const plvAllergy = selected ? hasPLVAllergy(selected.allergies) : false;
  const blocked = isLaitIncompatible(typeLait, plvAllergy);
  const boiteExpiree = dateOuverture ? isBoiteLaitExpiree(new Date(dateOuverture), new Date()) : false;

  const handleSubmit = async () => {
    if (!selectedEnfantId) { toast.error("Sélectionnez un enfant."); return; }
    if (!typeLait) { toast.error("Sélectionnez le type de lait."); return; }
    if (blocked) { toast.error("Ce lait est incompatible avec l'allergie de l'enfant."); return; }
    if (!numeroLot) { toast.error("Numéro de lot obligatoire (traçabilité)."); return; }
    if (!quantite) { toast.error("Quantité requise."); return; }
    if (!preparateur) { toast.error("Nom du préparateur obligatoire (émargement)."); return; }

    setSubmitting(true);
    const result = await creerBiberon({
      structure_id: structureId, enfant_id: selectedEnfantId, type_lait: typeLait,
      nom_lait: nomLait || undefined, numero_lot: numeroLot,
      date_peremption_lait: datePeremption || undefined, date_ouverture_boite: dateOuverture || undefined,
      nombre_dosettes: dosettes ? Number(dosettes) : undefined,
      quantite_preparee_ml: Number(quantite), preparateur_nom: preparateur,
      professionnel_id: user?.id ?? "", profil_id: profil?.id, observations: observations || undefined,
    });
    setSubmitting(false);

    if (result.success) {
      toast.success("Biberon préparé ! Le timer ANSES est lancé.");
      router.push(`/dashboard/${structureId}/biberonnerie`);
    } else {
      toast.error(result.error);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-rzpanda-primary" /></div>;

  const inputClass = "w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-rzpanda-primary">
        <ArrowLeft size={16} /> Retour
      </button>

      <h1 className="text-2xl font-bold text-gray-800">Préparer un biberon</h1>

      {/* Enfant selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <label className="block text-sm font-medium text-gray-700">Enfant</label>
        <select value={selectedEnfantId} onChange={(e) => { setSelectedEnfantId(e.target.value); setTypeLait(""); }}
          className={`${inputClass} bg-white`}>
          <option value="">Sélectionnez un enfant...</option>
          {enfants.map((e) => (
            <option key={e.id} value={e.id}>{e.prenom} {e.nom}{e.allergies.length > 0 ? " ⚠️" : ""}</option>
          ))}
        </select>

        {selected && selected.allergies.length > 0 && <BadgeAllergie enfant={selected} />}
        {selected && selected.regimes.length > 0 && <BadgeRegime enfant={selected} />}
      </div>

      {selected && (
        <>
          {/* Type de lait */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <label className="block text-sm font-medium text-gray-700">Type de lait</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {TYPES_LAIT.map((t) => {
                const incompatible = isLaitIncompatible(t, plvAllergy);
                return (
                  <button key={t} onClick={() => !incompatible && setTypeLait(t)}
                    disabled={incompatible}
                    className={`h-12 rounded-xl text-sm font-medium transition-colors ${
                      incompatible ? "bg-red-50 text-red-300 cursor-not-allowed border-2 border-red-200" :
                      typeLait === t ? "bg-rzpanda-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {t}
                  </button>
                );
              })}
            </div>

            {/* PLV Block */}
            {blocked && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-100 border border-red-300">
                <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-semibold">
                  Ce lait contient des PLV. {selected.prenom} est allergique. Choisissez &quot;Maternel&quot; ou &quot;Spécial HA-AR&quot;.
                </p>
              </div>
            )}

            {typeLait && !blocked && (
              <div className="space-y-3">
                <input type="text" value={nomLait} onChange={(e) => setNomLait(e.target.value)} placeholder="Nom commercial (ex: Gallia Calisma)" className={inputClass} />
              </div>
            )}
          </div>

          {/* Traçabilité */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-700">Traçabilité</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de lot *</label>
              <input type="text" value={numeroLot} onChange={(e) => setNumeroLot(e.target.value)} placeholder="Ex: G2024-1150" className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de péremption</label>
                <input type="date" value={datePeremption} onChange={(e) => setDatePeremption(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date ouverture boîte</label>
                <input type="date" value={dateOuverture} onChange={(e) => setDateOuverture(e.target.value)} className={inputClass} />
              </div>
            </div>
            {boiteExpiree && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
                <AlertTriangle size={16} className="text-orange-600 shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700">Boîte ouverte depuis plus de 30 jours. À jeter.</p>
              </div>
            )}
          </div>

          {/* Quantité */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-700">Préparation</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de dosettes</label>
              <input type="number" value={dosettes} onChange={(e) => setDosettes(Number(e.target.value) || "")} placeholder="Ex: 4" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité préparée (ml) *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {QUANTITES_BIBERON_ML.map((q) => (
                  <button key={q} onClick={() => setQuantite(q)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${quantite === q ? "bg-rzpanda-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                    {q}ml
                  </button>
                ))}
              </div>
              <input type="number" value={quantite} onChange={(e) => setQuantite(Number(e.target.value) || "")} placeholder="Autre quantité" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Préparateur *</label>
              <input type="text" value={preparateur} onChange={(e) => setPreparateur(e.target.value)} className={inputClass} />
            </div>
            <input type="text" value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Observations (optionnel)" className={inputClass} />
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={submitting || blocked}
            className="w-full h-12 rounded-xl bg-rzpanda-primary text-white font-medium hover:bg-rzpanda-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting && <Loader2 size={20} className="animate-spin" />}
            Enregistrer la préparation
          </button>
        </>
      )}
    </div>
  );
}

export default function NouveauBiberonPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-rzpanda-primary" />
      </div>
    }>
      <NouveauBiberonContent />
    </Suspense>
  );
}
