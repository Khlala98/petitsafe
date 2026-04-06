"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from "@/hooks/use-auth";
import { useModules } from "@/hooks/use-modules";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PastilleStatut } from "@/components/shared/pastille-statut";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";
import { getDashboardData, type DashboardData } from "@/app/actions/dashboard";
import Link from "next/link";
import {
  Thermometer, Sparkles, Package, Baby, AlertTriangle, Clock,
  Users, ArrowRight, MessageSquare,
} from "lucide-react";

export default function DashboardPage() {
  const { prenom, modulesActifs } = useAuth();
  const { isActif } = useModules(modulesActifs);
  const params = useParams();
  const structureId = params.structureId as string;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const aujourdhui = new Date();
  const dateStr = aujourdhui.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const fetchData = async () => {
    const res = await getDashboardData(structureId, modulesActifs);
    if (res.success) setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  useRealtimeSubscription("ReleveTemperature", isActif("temperatures") ? structureId : null, { onInsert: () => fetchData() });
  useRealtimeSubscription("Biberon", isActif("biberonnerie") ? structureId : null, { onInsert: () => fetchData() });
  useRealtimeSubscription("ReceptionMarchandise", isActif("tracabilite") ? structureId : null, { onInsert: () => fetchData() });
  useRealtimeSubscription("ValidationNettoyage", isActif("nettoyage") ? structureId : null, { onInsert: () => fetchData() });

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-petitsafe-primary border-t-transparent" />
      </div>
    );
  }

  const moduleIcons: Record<string, typeof Thermometer> = {
    transmissions: MessageSquare,
    nettoyage: Sparkles,
    biberonnerie: Baby,
    temperatures: Thermometer,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bonjour {prenom} 👋</h1>
        <p className="text-sm text-gray-500 capitalize mt-1">{dateStr}</p>
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Enfants présents */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Users size={20} className="text-petitsafe-primary" />
            <span className="text-sm font-medium text-gray-600">Enfants inscrits</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">{data.enfantsCount}</span>
          <Link href={`/dashboard/${structureId}/enfants`} className="text-xs text-petitsafe-primary hover:underline block mt-2">
            Voir la liste <ArrowRight size={12} className="inline" />
          </Link>
        </div>

        {/* Nettoyage du jour */}
        {isActif("nettoyage") && data.nettoyage && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} className="text-petitsafe-secondary" />
              <span className="text-sm font-medium text-gray-600">Nettoyage du jour</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <PastilleStatut status={data.nettoyage.pct === 100 ? "conforme" : data.nettoyage.pct >= 50 ? "attention" : "alerte"} />
              <span className="text-sm font-semibold">{data.nettoyage.fait}/{data.nettoyage.total} taches — {data.nettoyage.pct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${data.nettoyage.pct === 100 ? "bg-green-500" : data.nettoyage.pct >= 50 ? "bg-orange-400" : "bg-red-500"}`}
                style={{ width: `${data.nettoyage.pct}%` }}
              />
            </div>
            <Link href={`/dashboard/${structureId}/nettoyage`} className="text-xs text-petitsafe-primary hover:underline block mt-2">
              Voir le plan <ArrowRight size={12} className="inline" />
            </Link>
          </div>
        )}

        {/* Prochaines DLC */}
        {(isActif("tracabilite") || isActif("stocks")) && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Package size={20} className="text-petitsafe-accent" />
              <span className="text-sm font-medium text-gray-600">Prochaines DLC</span>
            </div>
            {data.prochainesDlc.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune DLC a surveiller</p>
            ) : (
              <div className="space-y-1.5">
                {data.prochainesDlc.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${p.joursRestants <= 0 ? "bg-red-500" : p.joursRestants <= 3 ? "bg-orange-400" : "bg-green-500"}`} />
                    <span className="text-gray-700 truncate">{p.nom_produit}</span>
                    <span className={`ml-auto text-xs font-medium shrink-0 ${p.joursRestants <= 0 ? "text-red-600" : p.joursRestants <= 3 ? "text-orange-600" : "text-gray-400"}`}>
                      {p.joursRestants <= 0 ? "Expirée" : `J-${p.joursRestants}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link href={`/dashboard/${structureId}/stock`} className="text-xs text-petitsafe-primary hover:underline block mt-2">
              Voir le stock <ArrowRight size={12} className="inline" />
            </Link>
          </div>
        )}

        {/* Biberons en attente */}
        {isActif("biberonnerie") && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Baby size={20} className="text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Biberons en attente</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">{data.biberonsEnAttente.count}</span>
            {data.biberonsEnAttente.plusAncienPrep && (
              <p className="text-xs text-gray-400 mt-1">
                Plus ancien : {new Date(data.biberonsEnAttente.plusAncienPrep).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                {" "}({Math.round((Date.now() - new Date(data.biberonsEnAttente.plusAncienPrep).getTime()) / 60000)} min)
              </p>
            )}
            <Link href={`/dashboard/${structureId}/biberonnerie`} className="text-xs text-petitsafe-primary hover:underline block mt-2">
              Voir les biberons <ArrowRight size={12} className="inline" />
            </Link>
          </div>
        )}

        {/* Températures du jour */}
        {isActif("temperatures") && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer size={20} className="text-petitsafe-primary" />
              <span className="text-sm font-medium text-gray-600">Températures du jour</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">{data.temperatures.relevesAujourdhui} relevé{data.temperatures.relevesAujourdhui > 1 ? "s" : ""}</span>
            {data.temperatures.dernier && (
              <div className="flex items-center gap-2 mt-1">
                <PastilleStatut status={data.temperatures.dernier.conforme ? "conforme" : "alerte"} />
                <span className="text-sm font-mono">{data.temperatures.dernier.temperature}°C</span>
                <span className="text-xs text-gray-400">{data.temperatures.dernier.equipement}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(data.temperatures.dernier.heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
            <Link href={`/dashboard/${structureId}/temperatures`} className="text-xs text-petitsafe-primary hover:underline block mt-2">
              Voir les relevés <ArrowRight size={12} className="inline" />
            </Link>
          </div>
        )}
      </div>

      {/* ═══ ACTIVITÉ RÉCENTE ═══ */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Clock size={20} className="text-gray-400" />
          Activité récente
        </h2>
        {data.activiteRecente.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Aucune activité aujourd&apos;hui.</p>
            <p className="text-gray-300 text-xs mt-1">Commencez par faire vos saisies quotidiennes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.activiteRecente.map((item, i) => {
              const Icon = moduleIcons[item.module] ?? Clock;
              return (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-gray-400 font-mono text-xs mt-0.5 shrink-0 w-12">
                    {new Date(item.heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
