"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";
import { getTachesJour } from "@/lib/business-logic";
import { PastilleStatut } from "@/components/shared/pastille-statut";
import {
  getZonesAvecTaches, initialiserZonesDefaut, validerTache,
  getValidationsDuJour, getHistoriqueNettoyage, creerZone, creerTache, supprimerZone, supprimerTache,
} from "@/app/actions/nettoyage";
import { toast } from "sonner";
import {
  Loader2, ChevronLeft, ChevronRight, Plus, Trash2, Calendar, CheckCircle2, Clock, Settings2,
} from "lucide-react";

type Frequence = "APRES_UTILISATION" | "QUOTIDIEN" | "BIQUOTIDIEN" | "HEBDO" | "BIMENSUEL" | "MENSUEL";

interface Tache {
  id: string; zone_id: string; nom: string; frequence: Frequence; methode: string; produit?: string | null; notes?: string | null; actif: boolean;
}
interface Zone {
  id: string; nom: string; couleur_code?: string | null; ordre: number; taches: Tache[];
}
interface Validation {
  id: string; tache_id: string; heure: Date; professionnel_nom: string; observations?: string | null;
  tache: { id: string; zone_id: string };
}

const FREQ_LABELS: Record<string, string> = {
  APRES_UTILISATION: "Après utilisation", QUOTIDIEN: "Quotidien", BIQUOTIDIEN: "2×/jour",
  HEBDO: "Hebdo", BIMENSUEL: "Bimensuel", MENSUEL: "Mensuel",
};

export default function NettoyagePage() {
  const params = useParams();
  const structureId = params.structureId as string;
  const { user, activeRole } = useAuth();
  const proId = user?.id ?? "";
  const proNom = user?.user_metadata?.prenom ?? "Professionnel";

  const [zones, setZones] = useState<Zone[]>([]);
  const [validations, setValidations] = useState<Validation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeZone, setActiveZone] = useState(0);
  const [view, setView] = useState<"jour" | "historique" | "admin">("jour");

  // Historique
  const [histMois, setHistMois] = useState(new Date().getMonth());
  const [histAnnee, setHistAnnee] = useState(new Date().getFullYear());
  const [histData, setHistData] = useState<Record<string, { total: number; fait: number; details: { tache_id: string; professionnel_nom: string; heure: string }[] }>>({});
  const [histSelectedDay, setHistSelectedDay] = useState<string | null>(null);

  // Admin form
  const [newZoneName, setNewZoneName] = useState("");
  const [newTacheName, setNewTacheName] = useState("");
  const [newTacheFreq, setNewTacheFreq] = useState("QUOTIDIEN");
  const [newTacheMethode, setNewTacheMethode] = useState("");
  const [newTacheProduit, setNewTacheProduit] = useState("");
  const [newTacheZoneId, setNewTacheZoneId] = useState("");

  const isGestionnaire = activeRole === "GESTIONNAIRE";

  const fetchAll = useCallback(async () => {
    const [zonesRes, valsRes] = await Promise.all([
      getZonesAvecTaches(structureId),
      getValidationsDuJour(structureId),
    ]);

    if (zonesRes.success && zonesRes.data) {
      if (zonesRes.data.length === 0) {
        const initRes = await initialiserZonesDefaut(structureId);
        if (initRes.success) {
          const newZones = await getZonesAvecTaches(structureId);
          if (newZones.success && newZones.data) setZones(newZones.data as Zone[]);
        }
      } else {
        setZones(zonesRes.data as Zone[]);
      }
    }
    if (valsRes.success && valsRes.data) setValidations(valsRes.data as Validation[]);
    setLoading(false);
  }, [structureId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useRealtimeSubscription("ValidationNettoyage", structureId, { onInsert: () => fetchAll() });

  const fetchHistorique = useCallback(async () => {
    const res = await getHistoriqueNettoyage(structureId, histMois, histAnnee);
    if (res.success && res.data) setHistData(res.data);
  }, [structureId, histMois, histAnnee]);

  useEffect(() => { if (view === "historique") fetchHistorique(); }, [view, fetchHistorique]);

  // Filter tasks for today
  const today = new Date();
  const currentZone = zones[activeZone];
  const tachesDuJour = currentZone ? getTachesJour(currentZone.taches, today) : [];
  const validatedIds = new Set(validations.map((v) => v.tache_id));

  // Zone progress
  const getZoneProgress = (zone: Zone) => {
    const taches = getTachesJour(zone.taches, today);
    if (taches.length === 0) return { fait: 0, total: 0, pct: 100 };
    const fait = taches.filter((t) => validatedIds.has(t.id)).length;
    return { fait, total: taches.length, pct: Math.round((fait / taches.length) * 100) };
  };

  // Global progress
  const allTachesJour = zones.flatMap((z) => getTachesJour(z.taches, today));
  const globalFait = allTachesJour.filter((t) => validatedIds.has(t.id)).length;
  const globalTotal = allTachesJour.length;
  const globalPct = globalTotal === 0 ? 100 : Math.round((globalFait / globalTotal) * 100);
  const globalStatus = globalPct === 100 ? "conforme" : globalPct >= 50 ? "attention" : "alerte";

  const handleValider = async (tacheId: string) => {
    const res = await validerTache({ tache_id: tacheId, professionnel_id: proId, professionnel_nom: proNom });
    if (res.success) {
      toast.success("Tâche validée");
      fetchAll();
    } else {
      toast.error(res.error);
    }
  };

  const handleAddZone = async () => {
    if (!newZoneName.trim()) return;
    const res = await creerZone(structureId, { nom: newZoneName });
    if (res.success) { toast.success("Zone ajoutée"); setNewZoneName(""); fetchAll(); }
    else toast.error(res.error);
  };

  const handleAddTache = async () => {
    if (!newTacheName.trim() || !newTacheMethode.trim() || !newTacheZoneId) return;
    const res = await creerTache({
      zone_id: newTacheZoneId, nom: newTacheName, frequence: newTacheFreq,
      methode: newTacheMethode, produit: newTacheProduit || undefined,
    });
    if (res.success) { toast.success("Tâche ajoutée"); setNewTacheName(""); setNewTacheMethode(""); setNewTacheProduit(""); fetchAll(); }
    else toast.error(res.error);
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm("Supprimer cette zone et toutes ses tâches ?")) return;
    const res = await supprimerZone(zoneId, structureId);
    if (res.success) { toast.success("Zone supprimée"); setActiveZone(0); fetchAll(); }
    else toast.error(res.error);
  };

  const handleDeleteTache = async (tacheId: string) => {
    if (!confirm("Supprimer cette tâche ?")) return;
    const res = await supprimerTache(tacheId);
    if (res.success) { toast.success("Tâche supprimée"); fetchAll(); }
    else toast.error(res.error);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-petitsafe-primary" /></div>;

  // ═══ HISTORIQUE VIEW ═══
  const renderHistorique = () => {
    const daysInMonth = new Date(histAnnee, histMois + 1, 0).getDate();
    const firstDay = new Date(histAnnee, histMois, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday-first

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => { if (histMois === 0) { setHistMois(11); setHistAnnee(histAnnee - 1); } else setHistMois(histMois - 1); }} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Mois précédent"><ChevronLeft size={20} /></button>
          <h3 className="text-lg font-semibold">{monthNames[histMois]} {histAnnee}</h3>
          <button onClick={() => { if (histMois === 11) { setHistMois(0); setHistAnnee(histAnnee + 1); } else setHistMois(histMois + 1); }} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Mois suivant"><ChevronRight size={20} /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
            <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
          {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${histAnnee}-${String(histMois + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayData = histData[dateStr];
            let color = "bg-gray-100 text-gray-400"; // no data
            if (dayData) {
              const pct = dayData.total === 0 ? 100 : Math.round((dayData.fait / dayData.total) * 100);
              if (pct === 100) color = "bg-green-100 text-green-800";
              else if (pct >= 50) color = "bg-orange-100 text-orange-800";
              else color = "bg-red-100 text-red-800";
            }

            return (
              <button key={day} onClick={() => setHistSelectedDay(histSelectedDay === dateStr ? null : dateStr)}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${color} ${histSelectedDay === dateStr ? "ring-2 ring-petitsafe-primary" : ""}`}
                aria-label={`${day} ${monthNames[histMois]} ${histAnnee}`}>
                {day}
              </button>
            );
          })}
        </div>

        {histSelectedDay && histData[histSelectedDay] && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Détail du {new Date(histSelectedDay + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</h4>
            <p className="text-sm text-gray-500">{histData[histSelectedDay].fait} tâche{histData[histSelectedDay].fait > 1 ? "s" : ""} effectuée{histData[histSelectedDay].fait > 1 ? "s" : ""}</p>
            <div className="space-y-1">
              {histData[histSelectedDay].details.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  <span className="text-gray-600">{d.professionnel_nom}</span>
                  <span className="text-gray-400 font-mono text-xs">{d.heure}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══ ADMIN VIEW ═══
  const renderAdmin = () => (
    <div className="space-y-6">
      {/* Add zone */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Ajouter une zone</h3>
        <div className="flex gap-2">
          <input value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} placeholder="Nom de la zone" className="flex-1 h-12 px-3 rounded-xl border border-gray-300 text-sm" aria-label="Nom de la zone" />
          <button onClick={handleAddZone} className="h-12 px-4 rounded-xl bg-petitsafe-primary text-white text-sm font-medium hover:bg-petitsafe-primary/90" aria-label="Ajouter la zone">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Add task */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Ajouter une tâche</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={newTacheZoneId} onChange={(e) => setNewTacheZoneId(e.target.value)} className="h-12 px-3 rounded-xl border border-gray-300 text-sm" aria-label="Zone">
            <option value="">Choisir une zone</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.nom}</option>)}
          </select>
          <input value={newTacheName} onChange={(e) => setNewTacheName(e.target.value)} placeholder="Nom de la tâche" className="h-12 px-3 rounded-xl border border-gray-300 text-sm" aria-label="Nom de la tâche" />
          <select value={newTacheFreq} onChange={(e) => setNewTacheFreq(e.target.value)} className="h-12 px-3 rounded-xl border border-gray-300 text-sm" aria-label="Fréquence">
            {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input value={newTacheMethode} onChange={(e) => setNewTacheMethode(e.target.value)} placeholder="Méthode" className="h-12 px-3 rounded-xl border border-gray-300 text-sm" aria-label="Méthode" />
          <input value={newTacheProduit} onChange={(e) => setNewTacheProduit(e.target.value)} placeholder="Produit (optionnel)" className="h-12 px-3 rounded-xl border border-gray-300 text-sm" aria-label="Produit" />
          <button onClick={handleAddTache} className="h-12 px-4 rounded-xl bg-petitsafe-primary text-white text-sm font-medium hover:bg-petitsafe-primary/90">Ajouter</button>
        </div>
      </div>

      {/* Zones & tâches list */}
      {zones.map((zone) => (
        <div key={zone.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {zone.couleur_code && <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: zone.couleur_code }} aria-hidden="true" />}
              <h3 className="font-semibold text-gray-800">{zone.nom}</h3>
              <span className="text-xs text-gray-400">{zone.taches.length} tâche{zone.taches.length > 1 ? "s" : ""}</span>
            </div>
            <button onClick={() => handleDeleteZone(zone.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg" aria-label={`Supprimer la zone ${zone.nom}`}>
              <Trash2 size={16} />
            </button>
          </div>
          <div className="space-y-1">
            {zone.taches.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{t.nom}</p>
                  <p className="text-xs text-gray-400">{FREQ_LABELS[t.frequence]} · {t.methode}{t.produit ? ` · ${t.produit}` : ""}</p>
                </div>
                <button onClick={() => handleDeleteTache(t.id)} className="p-1.5 text-red-400 hover:text-red-600" aria-label={`Supprimer ${t.nom}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Plan de nettoyage</h1>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setView("jour")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "jour" ? "bg-white shadow-sm text-petitsafe-primary" : "text-gray-500"}`}>Aujourd&apos;hui</button>
          <button onClick={() => setView("historique")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "historique" ? "bg-white shadow-sm text-petitsafe-primary" : "text-gray-500"}`}>
            <Calendar size={14} className="inline mr-1" />Historique
          </button>
          {isGestionnaire && (
            <button onClick={() => setView("admin")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "admin" ? "bg-white shadow-sm text-petitsafe-primary" : "text-gray-500"}`}>
              <Settings2 size={14} className="inline mr-1" />Gérer
            </button>
          )}
        </div>
      </div>

      {/* Global progress */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PastilleStatut status={globalStatus} />
            <span className="text-sm font-semibold text-gray-800">Progression globale</span>
          </div>
          <span className="text-sm font-bold text-gray-600">{globalFait}/{globalTotal} — {globalPct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${globalPct === 100 ? "bg-green-500" : globalPct >= 50 ? "bg-orange-400" : "bg-red-500"}`} style={{ width: `${globalPct}%` }} />
        </div>
      </div>

      {view === "historique" && renderHistorique()}
      {view === "admin" && renderAdmin()}

      {view === "jour" && (
        <>
          {/* Zone tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {zones.map((zone, i) => {
              const progress = getZoneProgress(zone);
              const status = progress.pct === 100 ? "conforme" : progress.pct >= 50 ? "attention" : "alerte";
              return (
                <button key={zone.id} onClick={() => setActiveZone(i)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${activeZone === i ? "bg-petitsafe-primary/10 border-petitsafe-primary/30 text-petitsafe-primary" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  <div className="flex items-center gap-2">
                    {zone.couleur_code && <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: zone.couleur_code }} aria-hidden="true" />}
                    <span>{zone.nom}</span>
                    <PastilleStatut status={status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{progress.fait}/{progress.total}</p>
                </button>
              );
            })}
          </div>

          {/* Zone task list */}
          {currentZone && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
              {tachesDuJour.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">Aucune tâche prévue pour aujourd&apos;hui dans cette zone.</p>
                </div>
              ) : (
                tachesDuJour.map((tache) => {
                  const isValidated = validatedIds.has(tache.id);
                  const validation = validations.find((v) => v.tache_id === tache.id);

                  return (
                    <div key={tache.id} className={`flex items-center gap-3 p-4 ${isValidated ? "bg-green-50/50" : ""}`}>
                      <button onClick={() => !isValidated && handleValider(tache.id)} disabled={isValidated}
                        className={`shrink-0 h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-colors ${isValidated ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-petitsafe-primary hover:bg-petitsafe-primary/5"}`}
                        aria-label={isValidated ? `${tache.nom} — validée` : `Valider ${tache.nom}`}>
                        {isValidated && <CheckCircle2 size={16} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isValidated ? "text-green-700 line-through" : "text-gray-800"}`}>{tache.nom}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{FREQ_LABELS[tache.frequence]}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-500">{tache.methode}</span>
                          {tache.produit && <><span className="text-xs text-gray-300">·</span><span className="text-xs text-petitsafe-primary">{tache.produit}</span></>}
                        </div>
                        {tache.notes && <p className="text-xs text-orange-600 mt-0.5">{tache.notes}</p>}
                      </div>
                      {isValidated && validation && (
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-green-600 font-medium">{validation.professionnel_nom}</p>
                          <p className="text-xs text-green-500 flex items-center gap-1 justify-end">
                            <Clock size={10} />
                            {new Date(validation.heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
