"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from "@/hooks/use-auth";
import { useProfil } from "@/hooks/use-profil";
import { useModules } from "@/hooks/use-modules";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PastilleStatut } from "@/components/shared/pastille-statut";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";
import { getDashboardData, type DashboardData } from "@/app/actions/dashboard";
import { getAlertes, type AlerteItem } from "@/app/actions/alertes";
import Link from "next/link";
import {
  Thermometer, Sparkles, Package, Baby, AlertTriangle, Clock,
  Users, ArrowRight, MessageSquare, Pill, Milk, ShieldAlert,
} from "lucide-react";

export default function DashboardPage() {
  const { prenom: authPrenom, modulesActifs } = useAuth();
  const { profil } = useProfil();
  const prenom = profil?.prenom || authPrenom;
  const { isActif } = useModules(modulesActifs);
  const params = useParams();
  const structureId = params.structureId as string;
  const [data, setData] = useState<DashboardData | null>(null);
  const [alertesSante, setAlertesSante] = useState<AlerteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const aujourdhui = new Date();
  const dateStr = aujourdhui.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const fetchData = async () => {
    try {
      const [res, alertesRes] = await Promise.all([
        getDashboardData(structureId, modulesActifs),
        getAlertes(structureId),
      ]);
      if (res.success) {
        setData(res.data);
        setFetchError(null);
      } else {
        setFetchError(res.error || "Erreur de chargement");
      }
      if (alertesRes.success && alertesRes.data) {
        setAlertesSante(
          alertesRes.data.filter((a) =>
            ["medicament_a_signer", "lait_maternel_dlc", "pai_present"].includes(a.type),
          ),
        );
      }
    } catch (e) {
      console.error("[DashboardPage] getDashboardData failed:", e);
      setFetchError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  useRealtimeSubscription("ReleveTemperature", isActif("temperatures") ? structureId : null, { onInsert: () => fetchData() });
  useRealtimeSubscription("Biberon", isActif("biberonnerie") ? structureId : null, { onInsert: () => fetchData() });
  useRealtimeSubscription("ReceptionMarchandise", isActif("tracabilite") ? structureId : null, { onInsert: () => fetchData() });
  useRealtimeSubscription("ValidationNettoyage", isActif("nettoyage") ? structureId : null, { onInsert: () => fetchData() });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rzpanda-primary border-t-transparent" />
      </div>
    );
  }

  if (fetchError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-4">
        <AlertTriangle size={32} className="text-red-500" />
        <p className="text-gray-700 font-medium">Impossible de charger le tableau de bord</p>
        {fetchError && <p className="text-sm text-gray-500 max-w-md">{fetchError}</p>}
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="mt-2 px-4 h-10 rounded-xl bg-rzpanda-primary text-white text-sm font-medium hover:bg-rzpanda-primary/90"
        >
          Réessayer
        </button>
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
        <h1 className="text-2xl font-bold text-gray-800">Bonjour{prenom ? ` ${prenom}` : ""} 👋</h1>
        <p className="text-sm text-gray-500 capitalize mt-1">{dateStr}</p>
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Enfants présents */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Users size={20} className="text-rzpanda-primary" />
            <span className="text-sm font-medium text-gray-600">Enfants inscrits</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">{data.enfantsCount}</span>
          <Link href={`/dashboard/${structureId}/enfants`} className="text-xs text-rzpanda-primary hover:underline block mt-2">
            Voir la liste <ArrowRight size={12} className="inline" />
          </Link>
        </div>

        {/* Nettoyage du jour */}
        {isActif("nettoyage") && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} className="text-rzpanda-secondary" />
              <span className="text-sm font-medium text-gray-600">Nettoyage du jour</span>
            </div>
            {data.nettoyage && data.nettoyage.total > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <PastilleStatut status={data.nettoyage.pct > 80 ? "conforme" : data.nettoyage.pct >= 50 ? "attention" : "alerte"} />
                  <span className="text-sm font-semibold">{data.nettoyage.fait}/{data.nettoyage.total} tâches — {data.nettoyage.pct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${data.nettoyage.pct > 80 ? "bg-rzpanda-primary" : data.nettoyage.pct >= 50 ? "bg-orange-400" : "bg-red-500"}`}
                    style={{ width: `${data.nettoyage.pct}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">Aucune tâche planifiée aujourd&apos;hui.</p>
            )}
            <Link href={`/dashboard/${structureId}/nettoyage`} className="text-xs text-rzpanda-primary hover:underline block mt-2">
              Voir le plan <ArrowRight size={12} className="inline" />
            </Link>
          </div>
        )}

        {/* Prochaines DLC */}
        {(isActif("tracabilite") || isActif("stocks")) && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Package size={20} className="text-rzpanda-accent" />
              <span className="text-sm font-medium text-gray-600">Prochaines DLC</span>
            </div>
            {data.prochainesDlc.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune DLC a surveiller</p>
            ) : (
              <div className="space-y-1.5">
                {data.prochainesDlc.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${p.joursRestants <= 0 ? "bg-red-500" : p.joursRestants <= 3 ? "bg-orange-400" : "bg-rzpanda-primary"}`} />
                    <span className="text-gray-700 truncate">{p.nom_produit}</span>
                    <span className={`ml-auto text-xs font-medium shrink-0 ${p.joursRestants <= 0 ? "text-red-600" : p.joursRestants <= 3 ? "text-orange-600" : "text-gray-400"}`}>
                      {p.joursRestants <= 0 ? "Expirée" : `J-${p.joursRestants}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link href={`/dashboard/${structureId}/stock`} className="text-xs text-rzpanda-primary hover:underline block mt-2">
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
            <Link href={`/dashboard/${structureId}/biberonnerie`} className="text-xs text-rzpanda-primary hover:underline block mt-2">
              Voir les biberons <ArrowRight size={12} className="inline" />
            </Link>
          </div>
        )}

        {/* Alertes DLC lait */}
        {isActif("biberonnerie") && data.alertesLait.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-orange-500" />
              <span className="text-sm font-medium text-gray-600">Alertes lait</span>
            </div>
            <div className="space-y-2">
              {data.alertesLait.map((a, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-sm ${a.niveau === "rouge" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"}`}>
                  <span className={`inline-block h-2 w-2 rounded-full shrink-0 mt-1.5 ${a.niveau === "rouge" ? "bg-red-500" : "bg-orange-400"}`} />
                  <span><strong>{a.enfantPrenom}</strong> — {a.message}</span>
                </div>
              ))}
            </div>
            <Link href={`/dashboard/${structureId}/biberonnerie`} className="text-xs text-rzpanda-primary hover:underline block mt-2">
              Voir la biberonnerie <ArrowRight size={12} className="inline" />
            </Link>
          </div>
        )}

        {/* Températures du jour */}
        {isActif("temperatures") && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer size={20} className="text-rzpanda-primary" />
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
            <Link href={`/dashboard/${structureId}/temperatures`} className="text-xs text-rzpanda-primary hover:underline block mt-2">
              Voir les relevés <ArrowRight size={12} className="inline" />
            </Link>
          </div>
        )}
      </div>

      {/* ═══ ALERTES SANTÉ — médicaments, lait maternel, PAI ═══ */}
      {alertesSante.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <ShieldAlert size={20} className="text-amber-500" />
            Alertes santé & médicaments
            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {alertesSante.length}
            </span>
          </h2>
          <div className="space-y-2">
            {alertesSante.map((a) => {
              const Icon = a.type === "medicament_a_signer" ? Pill : a.type === "lait_maternel_dlc" ? Milk : ShieldAlert;
              return (
                <Link
                  key={a.id}
                  href={a.href}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    a.niveau === "rouge" ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
                  } hover:opacity-80 transition-opacity`}
                >
                  <Icon size={18} className={`shrink-0 mt-0.5 ${a.niveau === "rouge" ? "text-red-600" : "text-orange-600"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${a.niveau === "rouge" ? "text-red-800" : "text-orange-800"}`}>{a.titre}</p>
                    <p className={`text-xs ${a.niveau === "rouge" ? "text-red-700" : "text-orange-700"}`}>{a.detail}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

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
