"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getEnfantByToken, getTimelineEnfant } from "@/app/actions/portail-parents";
import type { TimelineEntry, EnfantPortail } from "@/app/actions/portail-parents";
import { Loader2, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { calculerAge } from "@/lib/business-logic";

const COULEURS_AVATAR = ["#2563eb", "#3b82f6", "#F4A261", "#E53E3E", "#8E44AD", "#F39C12"];

const TYPE_COLORS: Record<string, string> = {
  biberon: "bg-pink-100 text-pink-700 border-pink-200",
  repas: "bg-orange-100 text-orange-700 border-orange-200",
  change: "bg-green-100 text-green-700 border-green-200",
  sieste: "bg-purple-100 text-purple-700 border-purple-200",
  transmission: "bg-blue-100 text-blue-700 border-blue-200",
  incident: "bg-red-100 text-red-700 border-red-200",
};

const TYPE_DOT_COLORS: Record<string, string> = {
  biberon: "bg-pink-400",
  repas: "bg-orange-400",
  change: "bg-rzpanda-primary",
  sieste: "bg-purple-400",
  transmission: "bg-blue-400",
  incident: "bg-red-500",
};

function formatDateFR(date: Date): string {
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function PortailTokenPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enfant, setEnfant] = useState<EnfantPortail | null>(null);
  const [structureNom, setStructureNom] = useState("");
  const [structureId, setStructureId] = useState("");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    const fetchEnfant = async () => {
      const res = await getEnfantByToken(token);
      if (!res.success) {
        setError(res.error);
      } else if (res.data) {
        setEnfant(res.data.enfant);
        setStructureNom(res.data.structureNom);
        setStructureId(res.data.structureId);
      }
      setLoading(false);
    };
    fetchEnfant();
  }, [token]);

  const fetchTimeline = useCallback(async () => {
    if (!structureId || !enfant) return;
    setLoadingTimeline(true);
    const res = await getTimelineEnfant(structureId, enfant.id, date);
    if (res.success && res.data) setTimeline(res.data);
    else setTimeline([]);
    setLoadingTimeline(false);
  }, [structureId, enfant, date]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const goDay = (offset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().slice(0, 10));
  };

  const isToday = date === new Date().toISOString().slice(0, 10);
  const isFuture = new Date(date) > new Date();

  // ═══ LOADING ═══
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-rzpanda-primary" />
      </div>
    );
  }

  // ═══ ERROR ═══
  if (error || !enfant) {
    return (
      <div className="text-center py-20">
        <ShieldAlert size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-700 mb-2">Lien invalide</h1>
        <p className="text-gray-400 text-sm">{error ?? "Ce lien de portail parents n'existe pas ou a expiré."}</p>
      </div>
    );
  }

  const couleur = COULEURS_AVATAR[enfant.prenom.charCodeAt(0) % COULEURS_AVATAR.length];
  const age = calculerAge(new Date(enfant.date_naissance), new Date());

  return (
    <div className="space-y-5">
      {/* Structure name */}
      <p className="text-xs text-gray-400 uppercase tracking-wider text-center">{structureNom}</p>

      {/* Child header */}
      <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        {enfant.photo_url ? (
          <img src={enfant.photo_url} alt={enfant.prenom} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0" style={{ backgroundColor: couleur }}>
            {enfant.prenom.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-800">{enfant.prenom} {enfant.nom}</h1>
          <p className="text-sm text-gray-500">{age}{enfant.groupe ? ` · ${enfant.groupe}` : ""}</p>
        </div>
      </div>

      {/* Allergies warning */}
      {enfant.allergies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-red-700 uppercase mb-1">Allergies</p>
          <div className="flex flex-wrap gap-1.5">
            {enfant.allergies.map((a, i) => (
              <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                a.severite === "SEVERE" ? "bg-red-200 text-red-800" :
                a.severite === "MODEREE" ? "bg-orange-200 text-orange-800" :
                "bg-yellow-200 text-yellow-800"
              }`}>
                {a.allergene}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Date navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <button onClick={() => goDay(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Jour précédent">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800 capitalize">{formatDateFR(new Date(date + "T12:00:00"))}</p>
          {isToday && <p className="text-xs text-rzpanda-primary font-medium">Aujourd&apos;hui</p>}
        </div>
        <button onClick={() => goDay(1)} disabled={isToday || isFuture}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Jour suivant">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Timeline */}
      {loadingTimeline ? (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin text-rzpanda-primary" />
        </div>
      ) : timeline.length === 0 ? (
        <div className="bg-white rounded-xl p-10 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-gray-400 text-sm">Aucune activité enregistrée pour cette journée.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Activités du jour
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100" />

            <div className="space-y-4">
              {timeline.map((entry, i) => (
                <div key={i} className="flex gap-3 relative">
                  {/* Dot */}
                  <div className={`relative z-10 mt-1 h-[10px] w-[10px] rounded-full shrink-0 ml-[14px] ${TYPE_DOT_COLORS[entry.type] ?? "bg-gray-400"}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-gray-400">{entry.heure}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${TYPE_COLORS[entry.type] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {entry.icone} {entry.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-300 pb-4">
        Données fournies par {structureNom} via {"RZPan'Da"}
      </p>
    </div>
  );
}
