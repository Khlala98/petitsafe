"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from "@/hooks/use-auth";
import { useModules } from "@/hooks/use-modules";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PastilleStatut } from "@/components/shared/pastille-statut";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";
import { getNettoyageKpi } from "@/app/actions/nettoyage";
import { Thermometer, Sparkles, Package, Baby, AlertTriangle, Clock } from "lucide-react";

interface KpiData {
  tempNonConformes: number;
  nettoyagePct: number;
  nettoyageFait: number;
  nettoyageTotal: number;
  alertesDlc: number;
  biberonsAujourdhui: number;
}

export default function DashboardPage() {
  const { prenom, modulesActifs } = useAuth();
  const { isActif } = useModules(modulesActifs);
  const params = useParams();
  const structureId = params.structureId as string;
  const supabase = createClient();
  const [kpi, setKpi] = useState<KpiData>({ tempNonConformes: 0, nettoyagePct: 0, nettoyageFait: 0, nettoyageTotal: 0, alertesDlc: 0, biberonsAujourdhui: 0 });
  const [recentActivity, setRecentActivity] = useState<{ heure: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const aujourdhui = new Date();
  const dateStr = aujourdhui.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const fetchKpis = async () => {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    let tempNC = 0;
    let biberons = 0;
    let dlcAlerts = 0;

    if (isActif("temperatures")) {
      const { count } = await supabase.from("ReleveTemperature").select("*", { count: "exact", head: true })
        .eq("structure_id", structureId).eq("conforme", false).gte("date", todayStart.toISOString()).lte("date", todayEnd.toISOString());
      tempNC = count ?? 0;
    }
    if (isActif("biberonnerie")) {
      const { count } = await supabase.from("Biberon").select("*", { count: "exact", head: true })
        .eq("structure_id", structureId).gte("date", todayStart.toISOString()).lte("date", todayEnd.toISOString());
      biberons = count ?? 0;
    }
    if (isActif("tracabilite") || isActif("stocks")) {
      const dansDeuxJours = new Date(); dansDeuxJours.setDate(dansDeuxJours.getDate() + 2);
      const { count } = await supabase.from("ReceptionMarchandise").select("*", { count: "exact", head: true })
        .eq("structure_id", structureId).eq("statut", "EN_STOCK").lte("dlc", dansDeuxJours.toISOString());
      dlcAlerts = count ?? 0;
    }

    const { data: transmissions } = await supabase.from("Transmission").select("contenu, auteur, date")
      .eq("structure_id", structureId).gte("date", todayStart.toISOString()).order("date", { ascending: false }).limit(5);

    let nettPct = 0, nettFait = 0, nettTotal = 0;
    if (isActif("nettoyage")) {
      const nettRes = await getNettoyageKpi(structureId);
      if (nettRes.success && nettRes.data) { nettPct = nettRes.data.pct; nettFait = nettRes.data.fait; nettTotal = nettRes.data.total; }
    }

    setKpi({ tempNonConformes: tempNC, nettoyagePct: nettPct, nettoyageFait: nettFait, nettoyageTotal: nettTotal, alertesDlc: dlcAlerts, biberonsAujourdhui: biberons });
    setRecentActivity((transmissions ?? []).map((t) => ({
      heure: new Date(t.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      description: `${t.auteur} : ${t.contenu.substring(0, 80)}${t.contenu.length > 80 ? "…" : ""}`,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchKpis(); }, [structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hooks must always be called in the same order — pass null to disable
  useRealtimeSubscription("ReleveTemperature", isActif("temperatures") ? structureId : null, { onInsert: () => fetchKpis() });
  useRealtimeSubscription("Biberon", isActif("biberonnerie") ? structureId : null, { onInsert: () => fetchKpis() });
  useRealtimeSubscription("ReceptionMarchandise", isActif("tracabilite") ? structureId : null, { onInsert: () => fetchKpis() });
  useRealtimeSubscription("ValidationNettoyage", isActif("nettoyage") ? structureId : null, { onInsert: () => fetchKpis() });

  // Count active KPI cards for grid
  const kpiCards: JSX.Element[] = [];

  if (isActif("temperatures")) {
    const status = kpi.tempNonConformes > 0 ? "alerte" : "conforme";
    kpiCards.push(
      <div key="temp" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3"><Thermometer size={20} className="text-petitsafe-primary" /><span className="text-sm font-medium text-gray-600">Températures</span></div>
        <div className="flex items-center gap-2"><PastilleStatut status={status} /><span className="text-sm font-semibold">{kpi.tempNonConformes === 0 ? "Tous conformes" : `${kpi.tempNonConformes} non conforme${kpi.tempNonConformes > 1 ? "s" : ""}`}</span></div>
      </div>
    );
  }
  if (isActif("nettoyage")) {
    const nettStatus = kpi.nettoyageTotal === 0 ? "conforme" : kpi.nettoyagePct === 100 ? "conforme" : kpi.nettoyagePct >= 50 ? "attention" : "alerte";
    kpiCards.push(
      <div key="nett" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3"><Sparkles size={20} className="text-petitsafe-secondary" /><span className="text-sm font-medium text-gray-600">Nettoyage</span></div>
        <div className="flex items-center gap-2"><PastilleStatut status={nettStatus} /><span className="text-sm font-semibold">{kpi.nettoyageTotal === 0 ? "Aucune tâche configurée" : `${kpi.nettoyagePct}% — ${kpi.nettoyageFait}/${kpi.nettoyageTotal}`}</span></div>
      </div>
    );
  }
  if (isActif("tracabilite") || isActif("stocks")) {
    const status = kpi.alertesDlc > 0 ? "attention" : "conforme";
    kpiCards.push(
      <div key="stock" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3"><Package size={20} className="text-petitsafe-accent" /><span className="text-sm font-medium text-gray-600">Stock</span></div>
        <div className="flex items-center gap-2"><PastilleStatut status={status} /><span className="text-sm font-semibold">{kpi.alertesDlc === 0 ? "Aucune alerte DLC" : `${kpi.alertesDlc} alerte${kpi.alertesDlc > 1 ? "s" : ""} DLC`}</span></div>
      </div>
    );
  }
  if (isActif("biberonnerie")) {
    kpiCards.push(
      <div key="bib" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3"><Baby size={20} className="text-purple-500" /><span className="text-sm font-medium text-gray-600">Biberons</span></div>
        <span className="text-sm font-semibold">{kpi.biberonsAujourdhui} préparé{kpi.biberonsAujourdhui > 1 ? "s" : ""} aujourd&apos;hui</span>
      </div>
    );
  }

  const gridCols = kpiCards.length === 1 ? "grid-cols-1" : kpiCards.length === 2 ? "grid-cols-2" : kpiCards.length === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4";

  // Actions section
  const actions: JSX.Element[] = [];
  if (isActif("temperatures") && kpi.tempNonConformes > 0) {
    actions.push(<div key="a-temp" className="flex items-start gap-3 p-3 rounded-lg bg-red-50"><span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 mt-1.5 shrink-0" /><p className="text-sm text-red-800">{kpi.tempNonConformes} relevé{kpi.tempNonConformes > 1 ? "s" : ""} non conforme{kpi.tempNonConformes > 1 ? "s" : ""} — action corrective requise</p></div>);
  }
  if ((isActif("tracabilite") || isActif("stocks")) && kpi.alertesDlc > 0) {
    actions.push(<div key="a-dlc" className="flex items-start gap-3 p-3 rounded-lg bg-orange-50"><span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-400 mt-1.5 shrink-0" /><p className="text-sm text-orange-800">{kpi.alertesDlc} produit{kpi.alertesDlc > 1 ? "s" : ""} avec DLC proche ou dépassée</p></div>);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bonjour {prenom} 👋</h1>
        <p className="text-sm text-gray-500 capitalize mt-1">{dateStr}</p>
      </div>

      {kpiCards.length > 0 && <div className={`grid ${gridCols} gap-4`}>{kpiCards}</div>}

      {actions.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4"><AlertTriangle size={20} className="text-petitsafe-warning" />Actions requises</h2>
          <div className="space-y-3">{actions}</div>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4"><Clock size={20} className="text-gray-400" />Aujourd&apos;hui</h2>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Aucune saisie aujourd&apos;hui.</p>
            <p className="text-gray-300 text-xs mt-1">Commencez par ajouter vos enfants et faire vos saisies quotidiennes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 font-mono text-xs mt-0.5 shrink-0 w-12">{item.heure}</span>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
