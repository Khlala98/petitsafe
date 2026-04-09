"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEnfants } from "@/app/actions/enfants";
import { enregistrerRepas, enregistrerChange, debuterSieste, finirSieste, getSiesteEnCours, enregistrerTransmission, enregistrerIncident, getHistoriqueDuJour } from "@/app/actions/suivi";
import { useAuth } from "@/hooks/use-auth";
import { useProfil } from "@/hooks/use-profil";
import { useModules } from "@/hooks/use-modules";
import { BadgeAllergie } from "@/components/shared/badge-allergie";
import { BadgeRegime } from "@/components/shared/badge-regime";
import { toast } from "sonner";
import { Loader2, Baby, UtensilsCrossed, Droplets, Moon, MessageSquare, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Enfant {
  id: string; prenom: string; nom: string; date_naissance: string; groupe?: string | null;
  allergies: { id: string; allergene: string; severite: "LEGERE" | "MODEREE" | "SEVERE" }[];
  regimes: string[];
}

type ActiveForm = null | "repas" | "change" | "sieste" | "transmission" | "incident";

const COULEURS_AVATAR = ["#66bb6a", "#4caf50", "#F4A261", "#E53E3E", "#8E44AD", "#F39C12"];

export default function SuiviPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;
  const { user, modulesActifs } = useAuth();
  const { profil } = useProfil();
  const { isActif } = useModules(modulesActifs);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const [loading, setLoading] = useState(true);

  // Sieste state
  const [siesteEnCours, setSiesteEnCours] = useState<{ id: string; heure_debut: string } | null>(null);
  const [siesteTimer, setSiesteTimer] = useState(0);

  // Repas state
  const [typeRepas, setTypeRepas] = useState<string>("");
  const [entree, setEntree] = useState(""); const [entreeQte, setEntreeQte] = useState("");
  const [plat, setPlat] = useState(""); const [platQte, setPlatQte] = useState("");
  const [dessert, setDessert] = useState(""); const [dessertQte, setDessertQte] = useState("");
  const [observations, setObservations] = useState("");

  // Transmission state
  const [transType, setTransType] = useState("ENFANT");
  const [transContenu, setTransContenu] = useState("");

  // Incident state
  const [incType, setIncType] = useState("CHUTE");
  const [incDescription, setIncDescription] = useState("");
  const [incGravite, setIncGravite] = useState("MINEUR");
  const [incAction, setIncAction] = useState("");
  const [incParents, setIncParents] = useState(false);
  const [incHeure, setIncHeure] = useState(() => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));

  // Historique timeline
  type TimelineItem = { id: string; type: "biberon" | "repas" | "change" | "sieste" | "transmission" | "incident"; heure: string; details: string };
  const [historique, setHistorique] = useState<TimelineItem[]>([]);
  const [historiqueVersion, setHistoriqueVersion] = useState(0);
  const refreshHistorique = () => setHistoriqueVersion((v) => v + 1);

  const proId = user?.id ?? "";
  const selected = enfants.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    const fetch = async () => {
      const result = await getEnfants(structureId);
      if (result.success && result.data) {
        setEnfants(result.data.map((e) => ({ ...e, date_naissance: e.date_naissance.toISOString() })));
      }
      setLoading(false);
    };
    fetch();
  }, [structureId]);

  // Check sieste en cours when child selected
  useEffect(() => {
    if (!selectedId) return;
    const check = async () => {
      const result = await getSiesteEnCours(structureId, selectedId);
      if (result.success && result.data) {
        setSiesteEnCours({ id: result.data.id, heure_debut: result.data.heure_debut.toISOString() });
      } else {
        setSiesteEnCours(null);
      }
    };
    check();
  }, [selectedId, structureId]);

  // Fetch historique du jour
  useEffect(() => {
    if (!selectedId) { setHistorique([]); return; }
    const fetchH = async () => {
      const result = await getHistoriqueDuJour(structureId, selectedId);
      if (result.success && result.data) setHistorique(result.data);
    };
    fetchH();
  }, [selectedId, structureId, historiqueVersion]);

  // Sieste timer
  useEffect(() => {
    if (!siesteEnCours) { setSiesteTimer(0); return; }
    const interval = setInterval(() => {
      setSiesteTimer(Math.round((Date.now() - new Date(siesteEnCours.heure_debut).getTime()) / 60000));
    }, 10000);
    setSiesteTimer(Math.round((Date.now() - new Date(siesteEnCours.heure_debut).getTime()) / 60000));
    return () => clearInterval(interval);
  }, [siesteEnCours]);

  // ═══ HANDLERS ═══

  const handleChange = async (type: string) => {
    if (!selectedId) return;
    const result = await enregistrerChange({ structure_id: structureId, enfant_id: selectedId, type_change: type, professionnel_id: proId, profil_id: profil?.id });
    if (result.success) { toast.success("Change enregistré !"); refreshHistorique(); }
    else toast.error(result.error);
  };

  const handleRepas = async () => {
    if (!selectedId || !typeRepas) { toast.error("Sélectionnez le type de repas."); return; }
    const result = await enregistrerRepas({
      structure_id: structureId, enfant_id: selectedId, type_repas: typeRepas,
      entree: entree || undefined, entree_quantite: entreeQte || undefined,
      plat: plat || undefined, plat_quantite: platQte || undefined,
      dessert: dessert || undefined, dessert_quantite: dessertQte || undefined,
      observations: observations || undefined, professionnel_id: proId, profil_id: profil?.id,
    });
    if (result.success) { toast.success("Repas enregistré !"); setActiveForm(null); resetRepas(); refreshHistorique(); }
    else toast.error(result.error);
  };

  const resetRepas = () => { setTypeRepas(""); setEntree(""); setEntreeQte(""); setPlat(""); setPlatQte(""); setDessert(""); setDessertQte(""); setObservations(""); };

  const handleSiesteToggle = async () => {
    if (!selectedId) return;
    if (siesteEnCours) {
      const result = await finirSieste({ sieste_id: siesteEnCours.id });
      if (result.success) { toast.success("Sieste terminée !"); setSiesteEnCours(null); refreshHistorique(); }
      else toast.error(result.error);
    } else {
      const result = await debuterSieste({ structure_id: structureId, enfant_id: selectedId, professionnel_id: proId, profil_id: profil?.id });
      if (result.success && result.data) {
        toast.success("Sieste démarrée !");
        setSiesteEnCours({ id: result.data.id, heure_debut: result.data.heure_debut.toISOString() });
        refreshHistorique();
      } else toast.error(result.error);
    }
  };

  const handleTransmission = async () => {
    if (!transContenu.trim()) { toast.error("Écrivez un message."); return; }
    const result = await enregistrerTransmission({
      structure_id: structureId, enfant_id: transType === "ENFANT" ? selectedId ?? undefined : undefined,
      contenu: transContenu, type_transm: transType, auteur: profil?.prenom ?? user?.user_metadata?.prenom ?? "Pro", profil_id: profil?.id,
    });
    if (result.success) { toast.success("Transmission enregistrée !"); setActiveForm(null); setTransContenu(""); refreshHistorique(); }
    else toast.error(result.error);
  };

  const handleIncident = async () => {
    if (!selectedId) return;
    if (!incDescription.trim()) { toast.error("Décrivez l'incident."); return; }
    if (!incAction.trim()) { toast.error("Décrivez l'action prise."); return; }
    const result = await enregistrerIncident({
      structure_id: structureId, enfant_id: selectedId, type_incident: incType,
      description: incDescription, gravite: incGravite, action_prise: incAction,
      parents_prevenu: incParents, heure: incHeure, professionnel_id: proId, profil_id: profil?.id,
    });
    if (result.success) {
      toast.success("Incident enregistré");
      setActiveForm(null);
      setIncType("CHUTE"); setIncDescription(""); setIncGravite("MINEUR");
      setIncAction(""); setIncParents(false);
      setIncHeure(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      refreshHistorique();
    } else toast.error(result.error);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-rzpanda-primary" /></div>;

  const QteButton = ({ value, current, onChange }: { value: string; current: string; onChange: (v: string) => void }) => {
    const labels: Record<string, string> = { TOUT: "✅ Tout", BIEN: "👍 Bien", PEU: "😐 Peu", RIEN: "❌ Rien" };
    return (
      <button onClick={() => onChange(value)}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${current === value ? "bg-rzpanda-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
        {labels[value]}
      </button>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Suivi du jour</h1>
        <Link href={`/dashboard/${structureId}/suivi/groupe`} className="text-sm text-rzpanda-primary hover:underline">
          Vue groupe →
        </Link>
      </div>

      {/* Child selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {enfants.map((e) => {
          const couleur = COULEURS_AVATAR[e.prenom.charCodeAt(0) % COULEURS_AVATAR.length];
          return (
            <button key={e.id} onClick={() => { setSelectedId(e.id); setActiveForm(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0 transition-colors ${selectedId === e.id ? "bg-rzpanda-primary text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: selectedId === e.id ? "rgba(255,255,255,0.3)" : couleur }}>
                {e.prenom.charAt(0)}
              </div>
              <span className="text-sm font-medium">{e.prenom}</span>
              {e.allergies.length > 0 && <span className="text-xs">⚠️</span>}
            </button>
          );
        })}
      </div>

      {!selected && <p className="text-center text-gray-400 py-10">Sélectionnez un enfant pour commencer.</p>}

      {selected && (
        <>
          {/* Allergie & régime banners */}
          {selected.allergies.length > 0 && <BadgeAllergie enfant={selected} />}
          {selected.regimes.length > 0 && <BadgeRegime enfant={selected} />}

          {/* Action buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {isActif("biberonnerie") && (
              <button onClick={() => router.push(`/dashboard/${structureId}/biberonnerie/nouveau?enfant=${selected.id}`)}
                className="h-20 rounded-xl text-white font-semibold flex flex-col items-center justify-center gap-1" style={{ backgroundColor: "#3498DB" }}>
                <Baby size={24} /><span className="text-sm">Biberon</span>
              </button>
            )}
            {isActif("repas") && (
              <button onClick={() => setActiveForm("repas")}
                className={`h-20 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 ${activeForm === "repas" ? "ring-2 ring-offset-2 ring-[#E67E22]" : ""}`} style={{ backgroundColor: "#E67E22", color: "white" }}>
                <UtensilsCrossed size={24} /><span className="text-sm">Repas</span>
              </button>
            )}
            {isActif("changes") && (
              <button onClick={() => setActiveForm("change")}
                className={`h-20 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 ${activeForm === "change" ? "ring-2 ring-offset-2 ring-[#2ECC71]" : ""}`} style={{ backgroundColor: "#2ECC71", color: "white" }}>
                <Droplets size={24} /><span className="text-sm">Change</span>
              </button>
            )}
            {isActif("siestes") && (
              <button onClick={() => setActiveForm("sieste")}
                className={`h-20 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 ${activeForm === "sieste" ? "ring-2 ring-offset-2 ring-[#8E44AD]" : ""}`} style={{ backgroundColor: "#8E44AD", color: "white" }}>
                <Moon size={24} /><span className="text-sm">{siesteEnCours ? `${siesteTimer}min` : "Sieste"}</span>
              </button>
            )}
            {isActif("transmissions") && (
              <button onClick={() => setActiveForm("transmission")}
                className={`h-20 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 ${activeForm === "transmission" ? "ring-2 ring-offset-2 ring-[#95A5A6]" : ""}`} style={{ backgroundColor: "#95A5A6", color: "white" }}>
                <MessageSquare size={24} /><span className="text-sm">Transmission</span>
              </button>
            )}
            <button onClick={() => { setActiveForm("incident"); setIncHeure(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })); }}
              className={`h-20 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 ${activeForm === "incident" ? "ring-2 ring-offset-2 ring-[#E74C3C]" : ""}`} style={{ backgroundColor: "#E74C3C", color: "white" }}>
              <AlertTriangle size={24} /><span className="text-sm">Incident</span>
            </button>
          </div>

          {/* ═══ FORMS ═══ */}

          {/* CHANGE — 1 tap */}
          {activeForm === "change" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-semibold text-gray-700">Change — {selected.prenom}</h3>
              <div className="grid grid-cols-3 gap-3">
                {[{ value: "MOUILLEE", label: "Mouillée 💧" }, { value: "SELLE", label: "Selle 💩" }, { value: "LES_DEUX", label: "Les deux" }].map((t) => (
                  <button key={t.value} onClick={() => handleChange(t.value)}
                    className="h-16 rounded-xl bg-green-50 border-2 border-green-200 text-green-800 font-semibold hover:bg-green-100 active:bg-green-200 transition-colors text-sm">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* REPAS */}
          {activeForm === "repas" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-semibold text-gray-700">Repas — {selected.prenom}</h3>
              {selected.allergies.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  ⚠️ ATTENTION — {selected.prenom} est allergique à : {selected.allergies.map((a) => a.allergene).join(", ")}. Vérifiez que le repas ne contient pas ces allergènes.
                </div>
              )}
              <div className="flex gap-2">
                {["PETIT_DEJ", "DEJEUNER", "GOUTER", "DINER"].map((t) => {
                  const labels: Record<string, string> = { PETIT_DEJ: "Petit-déj", DEJEUNER: "Déjeuner", GOUTER: "Goûter", DINER: "Dîner" };
                  return (
                    <button key={t} onClick={() => setTypeRepas(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${typeRepas === t ? "bg-rzpanda-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                      {labels[t]}
                    </button>
                  );
                })}
              </div>
              {["Entrée", "Plat", "Dessert"].map((comp) => {
                const val = comp === "Entrée" ? entree : comp === "Plat" ? plat : dessert;
                const setVal = comp === "Entrée" ? setEntree : comp === "Plat" ? setPlat : setDessert;
                const qte = comp === "Entrée" ? entreeQte : comp === "Plat" ? platQte : dessertQte;
                const setQte = comp === "Entrée" ? setEntreeQte : comp === "Plat" ? setPlatQte : setDessertQte;
                return (
                  <div key={comp} className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">{comp}</label>
                    <input type="text" value={val} onChange={(e) => setVal(e.target.value)} placeholder={`Nom du ${comp.toLowerCase()}`}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:border-rzpanda-primary outline-none" />
                    <div className="flex gap-2">
                      {["TOUT", "BIEN", "PEU", "RIEN"].map((q) => <QteButton key={q} value={q} current={qte} onChange={setQte} />)}
                    </div>
                  </div>
                );
              })}
              <input type="text" value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Observations (optionnel)"
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:border-rzpanda-primary outline-none" />
              <button onClick={handleRepas} className="w-full h-12 rounded-xl bg-rzpanda-primary text-white font-medium">Enregistrer le repas</button>
            </div>
          )}

          {/* SIESTE */}
          {activeForm === "sieste" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4 text-center">
              <h3 className="font-semibold text-gray-700">Sieste — {selected.prenom}</h3>
              <button onClick={handleSiesteToggle}
                className={`w-full h-16 rounded-xl font-semibold text-white text-lg ${siesteEnCours ? "bg-yellow-500 hover:bg-yellow-600" : "bg-purple-600 hover:bg-purple-700"}`}>
                {siesteEnCours ? `Fin sieste ☀️ (en cours depuis ${siesteTimer}min)` : "Début sieste 😴"}
              </button>
            </div>
          )}

          {/* TRANSMISSION */}
          {activeForm === "transmission" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-semibold text-gray-700">Transmission</h3>
              <div className="flex gap-2">
                {[{ v: "ENFANT", l: "Par enfant" }, { v: "GENERAL", l: "Général" }, { v: "EQUIPE", l: "Équipe" }].map((t) => (
                  <button key={t.v} onClick={() => setTransType(t.v)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${transType === t.v ? "bg-rzpanda-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                    {t.l}
                  </button>
                ))}
              </div>
              <textarea value={transContenu} onChange={(e) => setTransContenu(e.target.value)} placeholder="Votre message..."
                className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-rzpanda-primary outline-none resize-none" />
              <button onClick={handleTransmission} className="w-full h-12 rounded-xl bg-rzpanda-primary text-white font-medium">Enregistrer</button>
            </div>
          )}

          {/* INCIDENT */}
          {activeForm === "incident" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-red-200 space-y-4">
              <h3 className="font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle size={18} /> Signaler un incident — {selected.prenom}
              </h3>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Type d&apos;incident</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { v: "CHUTE", l: "Chute" }, { v: "MORSURE", l: "Morsure" }, { v: "GRIFFURE", l: "Griffure" },
                    { v: "PLEURS_PROLONGES", l: "Pleurs prolongés" }, { v: "FIEVRE", l: "Fièvre" }, { v: "AUTRE", l: "Autre" },
                  ].map((t) => (
                    <button key={t.v} onClick={() => setIncType(t.v)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${incType === t.v ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Heure */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Heure de l&apos;incident</label>
                <input type="time" value={incHeure} onChange={(e) => setIncHeure(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-gray-300 text-sm focus:border-rzpanda-primary outline-none" />
              </div>

              {/* Gravité */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Gravité</label>
                <div className="flex gap-2">
                  {[
                    { v: "MINEUR", l: "Mineur", c: "bg-yellow-100 text-yellow-800 border-yellow-300", ac: "bg-yellow-500 text-white" },
                    { v: "MODERE", l: "Modéré", c: "bg-orange-100 text-orange-800 border-orange-300", ac: "bg-orange-500 text-white" },
                    { v: "GRAVE", l: "Grave", c: "bg-red-100 text-red-800 border-red-300", ac: "bg-red-600 text-white" },
                  ].map((g) => (
                    <button key={g.v} onClick={() => setIncGravite(g.v)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${incGravite === g.v ? g.ac : g.c}`}>
                      {g.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Description</label>
                <textarea value={incDescription} onChange={(e) => setIncDescription(e.target.value)}
                  placeholder="Décrivez ce qui s'est passé..."
                  className="w-full h-20 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-rzpanda-primary outline-none resize-none" />
              </div>

              {/* Action prise */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Action prise</label>
                <textarea value={incAction} onChange={(e) => setIncAction(e.target.value)}
                  placeholder="Soins apportés, appel parents, glaçage..."
                  className="w-full h-20 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-rzpanda-primary outline-none resize-none" />
              </div>

              {/* Parents prévenus */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={incParents} onChange={(e) => setIncParents(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-rzpanda-primary focus:ring-rzpanda-primary" />
                <span className="text-sm font-medium text-gray-700">Parents prévenus</span>
              </label>

              <button onClick={handleIncident}
                className="w-full h-12 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 flex items-center justify-center gap-2">
                <AlertTriangle size={18} /> Enregistrer l&apos;incident
              </button>
            </div>
          )}

          {/* ═══ HISTORIQUE DU JOUR ═══ */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-gray-400" />
              <h3 className="font-semibold text-gray-700">Historique du jour</h3>
              <span className="text-xs text-gray-400 ml-auto">{historique.length} action{historique.length !== 1 ? "s" : ""}</span>
            </div>
            {historique.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune action enregistrée aujourd&apos;hui.</p>
            ) : (
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200" />
                <div className="space-y-4">
                  {historique.map((item) => {
                    const config: Record<string, { icon: string; color: string; bg: string }> = {
                      biberon: { icon: "🍼", color: "bg-blue-500", bg: "bg-blue-50" },
                      repas: { icon: "🍽️", color: "bg-orange-500", bg: "bg-orange-50" },
                      change: { icon: "💧", color: "bg-rzpanda-primary", bg: "bg-green-50" },
                      sieste: { icon: "😴", color: "bg-purple-500", bg: "bg-purple-50" },
                      transmission: { icon: "📝", color: "bg-gray-400", bg: "bg-gray-50" },
                      incident: { icon: "⚠️", color: "bg-red-500", bg: "bg-red-50" },
                    };
                    const c = config[item.type];
                    const labels: Record<string, string> = { biberon: "Biberon", repas: "Repas", change: "Change", sieste: "Sieste", transmission: "Transmission", incident: "Incident" };
                    return (
                      <div key={item.id} className="relative flex items-start gap-3">
                        {/* Dot on line */}
                        <div className={`absolute -left-6 top-1.5 h-[14px] w-[14px] rounded-full border-2 border-white ${c.color} shadow-sm`} />
                        <div className={`flex-1 rounded-lg p-3 ${c.bg}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-base">{c.icon}</span>
                            <span className="text-sm font-semibold text-gray-700">{labels[item.type]}</span>
                            <span className="text-xs text-gray-400 ml-auto font-mono">{item.heure}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">{item.details}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
