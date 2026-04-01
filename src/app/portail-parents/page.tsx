"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getEnfantsParent, getTimelineEnfant, type TimelineEntry, type EnfantPortail } from "@/app/actions/portail-parents";
import { BadgeAllergie } from "@/components/shared/badge-allergie";
import { Loader2, ChevronLeft, ChevronRight, CalendarDays, Baby } from "lucide-react";
import Link from "next/link";

function formatDateFr(date: Date) {
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatDateISO(date: Date) {
  return date.toISOString().split("T")[0];
}

const ICONE_COLORS: Record<string, string> = {
  biberon: "bg-purple-100 text-purple-600",
  repas: "bg-orange-100 text-orange-600",
  change: "bg-blue-100 text-blue-600",
  sieste: "bg-indigo-100 text-indigo-600",
  transmission: "bg-green-100 text-green-600",
};

export default function PortailParentsPage() {
  const supabase = createClient();
  const [enfants, setEnfants] = useState<EnfantPortail[]>([]);
  const [structureNom, setStructureNom] = useState("");
  const [structureId, setStructureId] = useState("");
  const [selectedEnfant, setSelectedEnfant] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const result = await getEnfantsParent(user.id);
      if (result.success && result.data) {
        setEnfants(result.data.enfants);
        setStructureNom(result.data.structureNom);
        setStructureId(result.data.structureId);
        if (result.data.enfants.length > 0) {
          setSelectedEnfant(result.data.enfants[0].id);
        }
      }
      setLoading(false);
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedEnfant || !structureId) return;
    const loadTimeline = async () => {
      setLoadingTimeline(true);
      const result = await getTimelineEnfant(structureId, selectedEnfant, formatDateISO(date));
      if (result.success && result.data) setTimeline(result.data);
      setLoadingTimeline(false);
    };
    loadTimeline();
  }, [selectedEnfant, date, structureId]);

  const enfantActif = enfants.find((e) => e.id === selectedEnfant);

  const changeDate = (delta: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + delta);
    if (newDate <= new Date()) setDate(newDate);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={32} className="animate-spin text-petitsafe-primary" />
      </div>
    );
  }

  if (enfants.length === 0) {
    return (
      <div className="text-center py-16">
        <Baby size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Aucun enfant associé à votre compte.</p>
        <p className="text-sm text-gray-400 mt-1">Contactez la structure pour recevoir un lien d&apos;invitation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{structureNom}</p>
        <h1 className="text-xl font-bold text-gray-800 mt-1">Journée de mon enfant</h1>
      </div>

      {/* Sélecteur d'enfant */}
      {enfants.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {enfants.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedEnfant(e.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedEnfant === e.id
                  ? "bg-petitsafe-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {e.prenom}
            </button>
          ))}
        </div>
      )}

      {/* Badge allergie */}
      {enfantActif && enfantActif.allergies.length > 0 && (
        <BadgeAllergie
          enfant={{
            prenom: enfantActif.prenom,
            allergies: enfantActif.allergies.map((a) => ({
              allergene: a.allergene,
              severite: a.severite as "LEGERE" | "MODEREE" | "SEVERE",
            })),
          }}
        />
      )}

      {/* Navigation date */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Jour précédent"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <CalendarDays size={16} className="text-gray-400" />
          <span className="capitalize">{formatDateFr(date)}</span>
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={formatDateISO(date) >= formatDateISO(new Date())}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Jour suivant"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Timeline */}
      {loadingTimeline ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : timeline.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <CalendarDays size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Aucune activité enregistrée ce jour.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {timeline.map((entry, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <span className="text-xs font-mono text-gray-400 mb-1">{entry.heure}</span>
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${ICONE_COLORS[entry.type] ?? "bg-gray-100 text-gray-500"}`}
                  role="img"
                  aria-label={entry.type}
                >
                  {entry.icone}
                </span>
              </div>
              <p className="text-sm text-gray-700 pt-0.5">{entry.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lien signalements */}
      <Link
        href="/portail-parents/signalements"
        className="block w-full h-12 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
      >
        Signaler une absence ou un apport
      </Link>
    </div>
  );
}
