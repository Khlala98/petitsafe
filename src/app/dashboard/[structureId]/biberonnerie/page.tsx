"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBiberonsDuJour, marquerServi, marquerNettoye } from "@/app/actions/biberons";
import { getEnfants } from "@/app/actions/enfants";
import { getStatutBiberon } from "@/lib/business-logic";
import { QUANTITES_BIBERON_ML } from "@/lib/constants";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";
import { toast } from "sonner";
import { Loader2, Plus, Info, Clock, Check, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Biberon {
  id: string; enfant_id: string; heure_preparation: string; type_lait: string; nom_lait?: string | null;
  numero_lot: string; quantite_preparee_ml: number; quantite_bue_ml?: number | null;
  heure_service?: string | null; nettoyage_effectue: boolean; preparateur_nom: string;
  enfant: { prenom: string; nom: string; allergies: { allergene: string; severite: string }[] };
}

interface Enfant {
  id: string; prenom: string; allergies: { allergene: string; severite: string }[];
}

export default function BiberonneriePage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;
  const [biberons, setBiberons] = useState<Biberon[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [showServiModal, setShowServiModal] = useState<string | null>(null);
  const [quantiteBue, setQuantiteBue] = useState<number | null>(null);

  const fetchData = async () => {
    const [bibRes, enfRes] = await Promise.all([
      getBiberonsDuJour(structureId),
      getEnfants(structureId),
    ]);
    if (bibRes.success && bibRes.data) {
      setBiberons(bibRes.data.map((b) => ({
        ...b, heure_preparation: b.heure_preparation.toISOString(),
        heure_service: b.heure_service?.toISOString() ?? null,
      })));
    }
    if (enfRes.success && enfRes.data) {
      setEnfants(enfRes.data.map((e) => ({ id: e.id, prenom: e.prenom, allergies: e.allergies })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer tick every 30s
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Realtime
  useRealtimeSubscription("Biberon", structureId, { onInsert: () => fetchData(), onUpdate: () => fetchData() });

  const handleServi = async (biberonId: string) => {
    const result = await marquerServi(biberonId, quantiteBue ?? undefined);
    if (result.success) { toast.success("Biberon marqué servi !"); fetchData(); }
    else toast.error(result.error);
    setShowServiModal(null);
    setQuantiteBue(null);
  };

  const handleNettoye = async (biberonId: string) => {
    const result = await marquerNettoye(biberonId);
    if (result.success) { toast.success("Biberon marqué nettoyé !"); fetchData(); }
    else toast.error(result.error);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-petitsafe-primary" /></div>;

  const now = new Date();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Biberonnerie</h1>
        <Link href={`/dashboard/${structureId}/biberonnerie/nouveau`}
          className="h-10 px-4 rounded-xl bg-petitsafe-primary text-white text-sm font-medium hover:bg-petitsafe-primary/90 flex items-center gap-2">
          <Plus size={16} /> Nouveau biberon
        </Link>
      </div>

      {/* ANSES reminder */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Rappel ANSES : Ne jamais réchauffer au micro-ondes. Ne jamais réchauffer plus d&apos;une fois. T° max 37°C. Jeter tout biberon partiellement consommé. Boîte ouverte = 30 jours max.
        </p>
      </div>

      {/* Biberons du jour */}
      {biberons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-lg mb-2">Aucun biberon aujourd&apos;hui</p>
          <p className="text-gray-300 text-sm">Préparez le premier biberon de la journée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {biberons.map((bib) => {
            const statut = !bib.heure_service ? getStatutBiberon(new Date(bib.heure_preparation), now) : "ok";
            const heurePrep = new Date(bib.heure_preparation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
            const minutesEcoulees = Math.round((now.getTime() - new Date(bib.heure_preparation).getTime()) / 60000);
            const isServi = !!bib.heure_service;
            const isNettoye = bib.nettoyage_effectue;

            let borderColor = "border-gray-200";
            let bgColor = "bg-white";
            if (!isServi && statut === "alerte") { borderColor = "border-red-300"; bgColor = "bg-red-50"; }
            else if (!isServi && statut === "attention") { borderColor = "border-orange-300"; bgColor = "bg-orange-50"; }
            else if (isNettoye) { borderColor = "border-green-300"; bgColor = "bg-green-50"; }
            else if (isServi) { borderColor = "border-blue-200"; }

            return (
              <div key={bib.id} className={`rounded-xl p-4 shadow-sm border-2 ${borderColor} ${bgColor} space-y-3`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{bib.enfant.prenom}</p>
                    <p className="text-xs text-gray-500">{bib.type_lait} · {bib.quantite_preparee_ml}ml · Lot {bib.numero_lot}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-gray-600">{heurePrep}</p>
                    {!isServi && (
                      <span className={`text-xs font-semibold ${statut === "alerte" ? "text-red-600" : statut === "attention" ? "text-orange-600" : "text-gray-400"}`}>
                        {minutesEcoulees}min
                      </span>
                    )}
                  </div>
                </div>

                {/* Alert */}
                {!isServi && statut === "alerte" && (
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-red-100">
                    <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">
                      Biberon non servi depuis {minutesEcoulees}min. À consommer dans l&apos;heure ou réfrigérer à 4°C max.
                    </p>
                  </div>
                )}

                {/* Status badges */}
                <div className="flex gap-2">
                  {isServi ? (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={10} /> Servi{bib.quantite_bue_ml ? ` (${bib.quantite_bue_ml}ml)` : ""}
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={10} /> En attente
                    </span>
                  )}
                  {isNettoye && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={10} /> Nettoyé
                    </span>
                  )}
                </div>

                {/* Preparateur */}
                <p className="text-xs text-gray-400">Préparé par {bib.preparateur_nom}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  {!isServi && (
                    <button onClick={() => { setShowServiModal(bib.id); setQuantiteBue(null); }}
                      className="flex-1 h-10 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">
                      Marquer servi
                    </button>
                  )}
                  {isServi && !isNettoye && (
                    <button onClick={() => handleNettoye(bib.id)}
                      className="flex-1 h-10 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600">
                      Marquer nettoyé
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal servi — quantité bue */}
      {showServiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowServiModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800">Quantité bue (ml)</h3>
            <div className="flex flex-wrap gap-2">
              {QUANTITES_BIBERON_ML.map((q) => (
                <button key={q} onClick={() => setQuantiteBue(q)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${quantiteBue === q ? "bg-petitsafe-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                  {q}ml
                </button>
              ))}
            </div>
            <input type="number" value={quantiteBue ?? ""} onChange={(e) => setQuantiteBue(Number(e.target.value) || null)}
              placeholder="Autre quantité" className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
            <div className="flex gap-3">
              <button onClick={() => setShowServiModal(null)} className="flex-1 h-10 rounded-lg border border-gray-300 text-sm text-gray-600">Annuler</button>
              <button onClick={() => handleServi(showServiModal)} className="flex-1 h-10 rounded-lg bg-petitsafe-primary text-white text-sm font-medium">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
