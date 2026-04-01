"use client";

import { useAuth } from "@/hooks/use-auth";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PastilleStatut } from "@/components/shared/pastille-statut";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";
import {
  Thermometer,
  SprayCan,
  Package,
  Baby,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface KpiData {
  tempNonConformes: number;
  tempEnAttente: boolean;
  nettoyagePct: number;
  nettoyageFait: number;
  nettoyageTotal: number;
  alertesDlc: number;
  biberonsAujourdhui: number;
}

export default function DashboardPage() {
  const { prenom } = useAuth();
  const params = useParams();
  const structureId = params.structureId as string;
  const supabase = createClient();
  const [kpi, setKpi] = useState<KpiData>({
    tempNonConformes: 0,
    tempEnAttente: false,
    nettoyagePct: 0,
    nettoyageFait: 0,
    nettoyageTotal: 0,
    alertesDlc: 0,
    biberonsAujourdhui: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<
    { heure: string; type: string; description: string }[]
  >([]);

  const aujourdhui = new Date();
  const dateStr = aujourdhui.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fetchKpis = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Températures non conformes aujourd'hui
    const { count: tempNC } = await supabase
      .from("ReleveTemperature")
      .select("*", { count: "exact", head: true })
      .eq("structure_id", structureId)
      .eq("conforme", false)
      .gte("date", todayStart.toISOString())
      .lte("date", todayEnd.toISOString());

    // Biberons aujourd'hui
    const { count: biberons } = await supabase
      .from("Biberon")
      .select("*", { count: "exact", head: true })
      .eq("structure_id", structureId)
      .gte("date", todayStart.toISOString())
      .lte("date", todayEnd.toISOString());

    // Alertes DLC
    const dansDeuxJours = new Date();
    dansDeuxJours.setDate(dansDeuxJours.getDate() + 2);
    const { count: dlcAlerts } = await supabase
      .from("ReceptionMarchandise")
      .select("*", { count: "exact", head: true })
      .eq("structure_id", structureId)
      .eq("statut", "EN_STOCK")
      .lte("dlc", dansDeuxJours.toISOString());

    // Transmissions récentes
    const { data: transmissions } = await supabase
      .from("Transmission")
      .select("contenu, auteur, date, type_transm")
      .eq("structure_id", structureId)
      .gte("date", todayStart.toISOString())
      .order("date", { ascending: false })
      .limit(5);

    setKpi({
      tempNonConformes: tempNC ?? 0,
      tempEnAttente: false,
      nettoyagePct: 0,
      nettoyageFait: 0,
      nettoyageTotal: 0,
      alertesDlc: dlcAlerts ?? 0,
      biberonsAujourdhui: biberons ?? 0,
    });

    setRecentActivity(
      (transmissions ?? []).map((t) => ({
        heure: new Date(t.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        type: t.type_transm,
        description: `${t.auteur} : ${t.contenu.substring(0, 80)}${t.contenu.length > 80 ? "…" : ""}`,
      }))
    );

    setLoading(false);
  };

  useEffect(() => {
    fetchKpis();
  }, [structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime updates
  useRealtimeSubscription("ReleveTemperature", structureId, { onInsert: () => fetchKpis() });
  useRealtimeSubscription("Biberon", structureId, { onInsert: () => fetchKpis() });
  useRealtimeSubscription("ReceptionMarchandise", structureId, { onInsert: () => fetchKpis() });
  useRealtimeSubscription("Transmission", structureId, { onInsert: () => fetchKpis() });

  const tempStatus = kpi.tempNonConformes > 0 ? "alerte" : "conforme";
  const dlcStatus = kpi.alertesDlc > 0 ? "attention" : "conforme";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Bonjour {prenom} 👋
        </h1>
        <p className="text-sm text-gray-500 capitalize mt-1">{dateStr}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Températures */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer size={20} className="text-petitsafe-primary" />
            <span className="text-sm font-medium text-gray-600">Températures</span>
          </div>
          <div className="flex items-center gap-2">
            <PastilleStatut status={tempStatus as "conforme" | "attention" | "alerte"} />
            <span className="text-sm font-semibold">
              {kpi.tempNonConformes === 0
                ? "Tous conformes ✅"
                : `${kpi.tempNonConformes} non conforme${kpi.tempNonConformes > 1 ? "s" : ""} ⚠️`}
            </span>
          </div>
        </div>

        {/* Nettoyage */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <SprayCan size={20} className="text-petitsafe-secondary" />
            <span className="text-sm font-medium text-gray-600">Nettoyage</span>
          </div>
          <div className="flex items-center gap-2">
            <PastilleStatut status="conforme" />
            <span className="text-sm font-semibold">
              {kpi.nettoyageTotal === 0
                ? "Aucune tâche configurée"
                : `${kpi.nettoyagePct}% — ${kpi.nettoyageFait}/${kpi.nettoyageTotal}`}
            </span>
          </div>
        </div>

        {/* Stock / DLC */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Package size={20} className="text-petitsafe-accent" />
            <span className="text-sm font-medium text-gray-600">Stock</span>
          </div>
          <div className="flex items-center gap-2">
            <PastilleStatut status={dlcStatus as "conforme" | "attention" | "alerte"} />
            <span className="text-sm font-semibold">
              {kpi.alertesDlc === 0
                ? "Aucune alerte DLC"
                : `${kpi.alertesDlc} alerte${kpi.alertesDlc > 1 ? "s" : ""} DLC`}
            </span>
          </div>
        </div>

        {/* Biberons */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Baby size={20} className="text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Biberons</span>
          </div>
          <span className="text-sm font-semibold">
            {kpi.biberonsAujourdhui} préparé{kpi.biberonsAujourdhui > 1 ? "s" : ""} aujourd&apos;hui
          </span>
        </div>
      </div>

      {/* Actions requises */}
      {(kpi.tempNonConformes > 0 || kpi.alertesDlc > 0) && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-petitsafe-warning" />
            Actions requises
          </h2>
          <div className="space-y-3">
            {kpi.tempNonConformes > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p className="text-sm text-red-800">
                  {kpi.tempNonConformes} relevé{kpi.tempNonConformes > 1 ? "s" : ""} de température non conforme{kpi.tempNonConformes > 1 ? "s" : ""} — action corrective requise
                </p>
              </div>
            )}
            {kpi.alertesDlc > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <p className="text-sm text-orange-800">
                  {kpi.alertesDlc} produit{kpi.alertesDlc > 1 ? "s" : ""} avec DLC proche ou dépassée
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activité du jour */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Clock size={20} className="text-gray-400" />
          Aujourd&apos;hui
        </h2>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Aucune saisie aujourd&apos;hui.</p>
            <p className="text-gray-300 text-xs mt-1">
              Commencez par ajouter vos enfants et faire vos saisies quotidiennes.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 font-mono text-xs mt-0.5 shrink-0 w-12">
                  {item.heure}
                </span>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
