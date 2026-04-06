"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEquipements, creerEquipement, getReleves, creerReleve, getRelevesPlat, creerRelevePlat, getRelevesHistorique } from "@/app/actions/temperatures";
import { getConformiteTemperature, getConformitePlat, validerPlageTemperature } from "@/lib/business-logic";
import { SEUILS_TEMPERATURE } from "@/lib/constants";
import { PastilleStatut } from "@/components/shared/pastille-statut";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";
import { toast } from "sonner";
import { Loader2, Plus, ChevronLeft, ChevronRight, AlertTriangle, Thermometer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";

interface Equipement { id: string; nom: string; type: "REFRIGERATEUR" | "CONGELATEUR"; temperature_max: number }
interface Releve { id: string; equipement_id: string; temperature: number; conforme: boolean; heure: string; action_corrective?: string | null; equipement: { nom: string; type: string } }
interface RelevePlat { id: string; nom_plat: string; type_plat: "CHAUD" | "FROID"; temperature_avant: number; temperature_apres: number; conforme: boolean; heure_avant: string; heure_apres: string; action_corrective?: string | null }

export default function TemperaturesPage() {
  const params = useParams();
  const structureId = params.structureId as string;
  const { user } = useAuth();
  const proId = user?.id ?? "";
  const proNom = user?.user_metadata?.prenom ?? "";

  const [tab, setTab] = useState<"enceintes" | "plats">("enceintes");
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [releves, setReleves] = useState<Releve[]>([]);
  const [relevesPlat, setRelevesPlat] = useState<RelevePlat[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  // Form enceinte
  const [showForm, setShowForm] = useState(false);
  const [formEquipId, setFormEquipId] = useState("");
  const [formTemp, setFormTemp] = useState<number | "">("");
  const [formHeure, setFormHeure] = useState(new Date().toTimeString().slice(0, 5));
  const [formAction, setFormAction] = useState("");
  const [formPlageWarning, setFormPlageWarning] = useState<string | null>(null);
  const [formPlageConfirmed, setFormPlageConfirmed] = useState(false);

  // Form plat
  const [showFormPlat, setShowFormPlat] = useState(false);
  const [platNom, setPlatNom] = useState("");
  const [platAvant, setPlatAvant] = useState<number | "">("");
  const [platHeureAvant, setPlatHeureAvant] = useState("");
  const [platApres, setPlatApres] = useState<number | "">("");
  const [platHeureApres, setPlatHeureApres] = useState("");
  const [platType, setPlatType] = useState<"CHAUD" | "FROID">("CHAUD");
  const [platAction, setPlatAction] = useState("");

  // Add equipement
  const [showAddEquip, setShowAddEquip] = useState(false);
  const [newEquipNom, setNewEquipNom] = useState("");
  const [newEquipType, setNewEquipType] = useState<"REFRIGERATEUR" | "CONGELATEUR">("REFRIGERATEUR");

  // Graph
  const [graphEquipId, setGraphEquipId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{ date: string; temperature: number }[]>([]);

  const fetchData = async () => {
    const [eqRes, relRes, platRes] = await Promise.all([
      getEquipements(structureId),
      getReleves(structureId, date),
      getRelevesPlat(structureId, date),
    ]);
    if (eqRes.success && eqRes.data) setEquipements(eqRes.data);
    if (relRes.success && relRes.data) setReleves(relRes.data.map((r) => ({ ...r, heure: r.heure.toISOString() })));
    if (platRes.success && platRes.data) setRelevesPlat(platRes.data.map((r) => ({ ...r, heure_avant: r.heure_avant.toISOString(), heure_apres: r.heure_apres.toISOString() })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [structureId, date]); // eslint-disable-line react-hooks/exhaustive-deps

  useRealtimeSubscription("ReleveTemperature", structureId, { onInsert: () => fetchData() });

  const loadGraph = async (equipId: string) => {
    setGraphEquipId(equipId);
    const res = await getRelevesHistorique(structureId, equipId, 7);
    if (res.success && res.data) {
      setGraphData(res.data.map((r) => ({
        date: new Date(r.heure).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) + " " + new Date(r.heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        temperature: r.temperature,
      })));
    }
  };

  // Conformity calc for form
  const selectedEquip = equipements.find((e) => e.id === formEquipId);
  const formConformite = selectedEquip && formTemp !== "" ? getConformiteTemperature(Number(formTemp), selectedEquip.type) : null;
  const platConformite = platApres !== "" ? getConformitePlat(Number(platApres), platType) : null;

  // Range validation — update warning when equipment or temp changes
  useEffect(() => {
    if (selectedEquip && formTemp !== "") {
      const warning = validerPlageTemperature(Number(formTemp), selectedEquip.type);
      setFormPlageWarning(warning);
      if (!warning) setFormPlageConfirmed(false);
    } else {
      setFormPlageWarning(null);
      setFormPlageConfirmed(false);
    }
  }, [formTemp, selectedEquip]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmitReleve = async () => {
    if (!formEquipId || formTemp === "") { toast.error("Sélectionnez un équipement et une température."); return; }
    if (formPlageWarning && !formPlageConfirmed) { toast.error("Confirmez que la valeur hors plage est correcte avant d'enregistrer."); return; }
    const conforme = formConformite === "conforme";
    if (!conforme && formConformite === "alerte" && !formAction.trim()) { toast.error("Action corrective obligatoire pour une température non conforme."); return; }

    const today = new Date(date);
    const [h, m] = formHeure.split(":").map(Number);
    today.setHours(h, m, 0, 0);

    const result = await creerReleve({
      structure_id: structureId, equipement_id: formEquipId, temperature: Number(formTemp),
      conforme: formConformite !== "alerte", action_corrective: formAction || undefined,
      professionnel_id: proId, heure: today.toISOString(),
      plage_confirmee: formPlageConfirmed,
    });
    if (result.success) { toast.success("Relevé enregistré !"); setShowForm(false); setFormTemp(""); setFormAction(""); setFormPlageWarning(null); setFormPlageConfirmed(false); fetchData(); }
    else toast.error(result.error);
  };

  const handleSubmitPlat = async () => {
    if (!platNom || platAvant === "" || platApres === "") { toast.error("Remplissez tous les champs."); return; }
    const conforme = platConformite === "conforme";
    if (!conforme && !platAction.trim()) { toast.error("Action corrective obligatoire si non conforme."); return; }

    const now = new Date();
    const result = await creerRelevePlat({
      structure_id: structureId, nom_plat: platNom, type_plat: platType,
      temperature_avant: Number(platAvant), heure_avant: platHeureAvant || now.toISOString(),
      temperature_apres: Number(platApres), heure_apres: platHeureApres || now.toISOString(),
      conforme, action_corrective: platAction || undefined, professionnel_id: proId,
    });
    if (result.success) { toast.success("Relevé plat enregistré !"); setShowFormPlat(false); setPlatNom(""); setPlatType("CHAUD"); setPlatAvant(""); setPlatApres(""); setPlatAction(""); fetchData(); }
    else toast.error(result.error);
  };

  const handleAddEquip = async () => {
    if (!newEquipNom) { toast.error("Nom requis."); return; }
    const tempMax = newEquipType === "REFRIGERATEUR" ? SEUILS_TEMPERATURE.frigo_max : SEUILS_TEMPERATURE.congel_max;
    const result = await creerEquipement({ structure_id: structureId, nom: newEquipNom, type: newEquipType, temperature_max: tempMax });
    if (result.success) { toast.success("Équipement ajouté !"); setShowAddEquip(false); setNewEquipNom(""); fetchData(); }
    else toast.error(result.error);
  };

  const changeDate = (delta: number) => {
    const d = new Date(date); d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split("T")[0]);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-petitsafe-primary" /></div>;

  const inputClass = "w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-petitsafe-primary focus:ring-2 focus:ring-petitsafe-primary/20 outline-none text-sm";
  const graphEquip = equipements.find((e) => e.id === graphEquipId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Températures</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button onClick={() => setTab("enceintes")} className={`px-4 py-2.5 text-sm font-medium border-b-2 ${tab === "enceintes" ? "border-petitsafe-primary text-petitsafe-primary" : "border-transparent text-gray-500"}`}>Enceintes froides</button>
        <button onClick={() => setTab("plats")} className={`px-4 py-2.5 text-sm font-medium border-b-2 ${tab === "plats" ? "border-petitsafe-primary text-petitsafe-primary" : "border-transparent text-gray-500"}`}>Plats témoins</button>
      </div>

      {/* Date nav */}
      <div className="flex items-center gap-4">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Jour précédent"><ChevronLeft size={20} /></button>
        <span className="text-sm font-medium text-gray-700">{new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
        <button onClick={() => changeDate(1)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Jour suivant"><ChevronRight size={20} /></button>
      </div>

      {/* ═══ ENCEINTES FROIDES ═══ */}
      {tab === "enceintes" && (
        <div className="space-y-4">
          {/* Equipment cards */}
          {equipements.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
              <Thermometer size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">Aucun équipement configuré</p>
              <button onClick={() => setShowAddEquip(true)} className="text-sm text-petitsafe-primary hover:underline">+ Ajouter un frigo ou congélateur</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipements.map((eq) => {
                const dernierReleve = releves.find((r) => r.equipement_id === eq.id);
                const statut = dernierReleve ? getConformiteTemperature(dernierReleve.temperature, eq.type) : null;
                return (
                  <div key={eq.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-800">{eq.nom}</p>
                      <span className="text-xs text-gray-400">{eq.type === "REFRIGERATEUR" ? "Frigo" : "Congélateur"}</span>
                    </div>
                    {dernierReleve ? (
                      <div className="flex items-center gap-2">
                        <PastilleStatut status={statut!} />
                        <span className="text-lg font-mono font-bold">{dernierReleve.temperature}°C</span>
                        <span className="text-xs text-gray-400">{new Date(dernierReleve.heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Aucun relevé aujourd&apos;hui</p>
                    )}
                    <button onClick={() => loadGraph(eq.id)} className="text-xs text-petitsafe-primary hover:underline mt-2 block">Voir l&apos;historique</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => setShowForm(true)} className="h-10 px-4 rounded-xl bg-petitsafe-primary text-white text-sm font-medium flex items-center gap-2"><Plus size={16} /> Nouveau relevé</button>
            <button onClick={() => setShowAddEquip(true)} className="h-10 px-4 rounded-xl border border-gray-300 text-sm text-gray-600 flex items-center gap-2"><Plus size={16} /> Ajouter un équipement</button>
          </div>

          {/* Form relevé */}
          {showForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-semibold text-gray-700">Nouveau relevé de température</h3>
              <select value={formEquipId} onChange={(e) => setFormEquipId(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Sélectionnez un équipement...</option>
                {equipements.map((e) => <option key={e.id} value={e.id}>{e.nom} ({e.type === "REFRIGERATEUR" ? "Frigo" : "Congélateur"})</option>)}
              </select>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Température (°C)</label>
                  <input type="number" step="0.1" value={formTemp} onChange={(e) => setFormTemp(Number(e.target.value))} placeholder="Ex: 3.5" className={inputClass} inputMode="decimal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input type="time" value={formHeure} onChange={(e) => setFormHeure(e.target.value)} className={inputClass} />
                </div>
              </div>
              {formPlageWarning && (
                <div className="space-y-2">
                  <p className="text-sm text-red-600 font-medium">{formPlageWarning}</p>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={formPlageConfirmed} onChange={(e) => setFormPlageConfirmed(e.target.checked)}
                      className="rounded border-gray-300 text-petitsafe-primary focus:ring-petitsafe-primary" />
                    Cette valeur semble anormale. Je confirme qu&apos;elle est correcte.
                  </label>
                </div>
              )}
              {formConformite && (
                <div className="flex items-center gap-2">
                  <PastilleStatut status={formConformite} />
                  <span className="text-sm font-medium">{formConformite === "conforme" ? "Conforme" : formConformite === "attention" ? "Attention" : "Non conforme"}</span>
                </div>
              )}
              {formConformite === "alerte" && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50">
                    <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">Température hors norme. Décrivez l&apos;action corrective.</p>
                  </div>
                  <textarea value={formAction} onChange={(e) => setFormAction(e.target.value)} placeholder="Ex: vérification joint, dégivrage, appel maintenance..."
                    className="w-full h-20 px-3 py-2 rounded-lg border border-red-300 text-sm outline-none resize-none focus:border-red-500" />
                </div>
              )}
              {formConformite === "attention" && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50">
                  <AlertTriangle size={14} className="text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700">Température en zone d&apos;attention. Surveillez l&apos;équipement.</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="h-10 px-4 rounded-xl border border-gray-300 text-sm text-gray-600">Annuler</button>
                <button onClick={handleSubmitReleve} className="h-10 px-6 rounded-xl bg-petitsafe-primary text-white text-sm font-medium">Enregistrer</button>
              </div>
            </div>
          )}

          {/* Add equipment modal */}
          {showAddEquip && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-semibold text-gray-700">Ajouter un équipement</h3>
              <input type="text" value={newEquipNom} onChange={(e) => setNewEquipNom(e.target.value)} placeholder="Ex: Frigo cuisine" className={inputClass} />
              <div className="flex gap-2">
                <button onClick={() => setNewEquipType("REFRIGERATEUR")} className={`flex-1 h-10 rounded-lg text-sm font-medium ${newEquipType === "REFRIGERATEUR" ? "bg-petitsafe-primary text-white" : "bg-gray-100 text-gray-600"}`}>Réfrigérateur</button>
                <button onClick={() => setNewEquipType("CONGELATEUR")} className={`flex-1 h-10 rounded-lg text-sm font-medium ${newEquipType === "CONGELATEUR" ? "bg-petitsafe-primary text-white" : "bg-gray-100 text-gray-600"}`}>Congélateur</button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddEquip(false)} className="h-10 px-4 rounded-xl border border-gray-300 text-sm text-gray-600">Annuler</button>
                <button onClick={handleAddEquip} className="h-10 px-6 rounded-xl bg-petitsafe-primary text-white text-sm font-medium">Ajouter</button>
              </div>
            </div>
          )}

          {/* Recharts Graph */}
          {graphEquipId && graphData.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">Historique — {graphEquip?.nom} (7 jours)</h3>
                <button onClick={() => setGraphEquipId(null)} className="text-xs text-gray-400 hover:text-gray-600">Fermer</button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                  <Tooltip />
                  {graphEquip?.type === "REFRIGERATEUR" && (
                    <ReferenceArea y1={SEUILS_TEMPERATURE.frigo_min} y2={SEUILS_TEMPERATURE.frigo_max} fill="#27AE60" fillOpacity={0.1} />
                  )}
                  <Line type="monotone" dataKey="temperature" stroke="#2E86C1" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Relevés du jour */}
          {releves.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3">Relevés du jour</h3>
              <div className="space-y-2">
                {releves.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <PastilleStatut status={r.conforme ? "conforme" : "alerte"} />
                    <span className="font-mono font-bold">{r.temperature}°C</span>
                    <span className="text-sm text-gray-600">{r.equipement.nom}</span>
                    <span className="text-xs text-gray-400 ml-auto">{new Date(r.heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                    {r.action_corrective && <span className="text-xs text-red-500">⚠️ {r.action_corrective}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ PLATS TÉMOINS ═══ */}
      {tab === "plats" && (
        <div className="space-y-4">
          <button onClick={() => setShowFormPlat(true)} className="h-10 px-4 rounded-xl bg-petitsafe-primary text-white text-sm font-medium flex items-center gap-2"><Plus size={16} /> Nouveau relevé plat</button>

          {showFormPlat && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-semibold text-gray-700">Relevé plat témoin</h3>
              <input type="text" value={platNom} onChange={(e) => setPlatNom(e.target.value)} placeholder="Nom du plat" className={inputClass} />
              <div className="flex gap-2">
                <button onClick={() => setPlatType("CHAUD")} className={`flex-1 h-10 rounded-lg text-sm font-medium ${platType === "CHAUD" ? "bg-petitsafe-primary text-white" : "bg-gray-100 text-gray-600"}`}>Plat chaud</button>
                <button onClick={() => setPlatType("FROID")} className={`flex-1 h-10 rounded-lg text-sm font-medium ${platType === "FROID" ? "bg-petitsafe-primary text-white" : "bg-gray-100 text-gray-600"}`}>Plat froid</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">T° avant (°C)</label>
                  <input type="number" step="0.1" value={platAvant} onChange={(e) => setPlatAvant(Number(e.target.value))} className={inputClass} inputMode="decimal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">T° après (°C)</label>
                  <input type="number" step="0.1" value={platApres} onChange={(e) => setPlatApres(Number(e.target.value))} className={inputClass} inputMode="decimal" />
                </div>
              </div>
              {platConformite && (
                <div className="flex items-center gap-2">
                  <PastilleStatut status={platConformite === "conforme" ? "conforme" : "alerte"} />
                  <span className="text-sm">{platConformite === "conforme" ? "Conforme" : "Non conforme"} ({platType === "CHAUD" ? "seuil ≥ 63°C" : "seuil ≤ 3°C"})</span>
                </div>
              )}
              {platConformite === "alerte" && (
                <textarea value={platAction} onChange={(e) => setPlatAction(e.target.value)} placeholder="Action corrective obligatoire..."
                  className="w-full h-20 px-3 py-2 rounded-lg border border-red-300 text-sm outline-none resize-none" />
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowFormPlat(false)} className="h-10 px-4 rounded-xl border border-gray-300 text-sm text-gray-600">Annuler</button>
                <button onClick={handleSubmitPlat} className="h-10 px-6 rounded-xl bg-petitsafe-primary text-white text-sm font-medium">Enregistrer</button>
              </div>
            </div>
          )}

          {relevesPlat.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-400">Aucun relevé plat aujourd&apos;hui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relevesPlat.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <PastilleStatut status={r.conforme ? "conforme" : "alerte"} />
                    <span className="font-semibold text-gray-800">{r.nom_plat}</span>
                    <span className="text-xs text-gray-400">{r.type_plat === "FROID" ? "Froid" : "Chaud"}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Avant : {r.temperature_avant}°C → Après : {r.temperature_apres}°C</p>
                  {r.action_corrective && <p className="text-xs text-red-500 mt-1">⚠️ {r.action_corrective}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
