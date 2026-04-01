"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signalementAbsenceSchema, type SignalementAbsenceData,
  signalementApportSchema, type SignalementApportData,
} from "@/lib/schemas/signalement";
import {
  getEnfantsParent, creerSignalementAbsence, creerSignalementApport,
  type EnfantPortail,
} from "@/app/actions/portail-parents";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CalendarOff, Package } from "lucide-react";
import Link from "next/link";

type TabType = "absence" | "apport";

export default function SignalementsPage() {
  const supabase = createClient();
  const [enfants, setEnfants] = useState<EnfantPortail[]>([]);
  const [structureId, setStructureId] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("absence");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Parent");

  const absenceForm = useForm<SignalementAbsenceData>({
    resolver: zodResolver(signalementAbsenceSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0], motif: "maladie" },
  });

  const apportForm = useForm<SignalementApportData>({
    resolver: zodResolver(signalementApportSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0] },
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserName(user.user_metadata?.prenom ?? "Parent");
      const result = await getEnfantsParent(user.id);
      if (result.success && result.data) {
        setEnfants(result.data.enfants);
        setStructureId(result.data.structureId);
        if (result.data.enfants.length > 0) {
          absenceForm.setValue("enfant_id", result.data.enfants[0].id);
          apportForm.setValue("enfant_id", result.data.enfants[0].id);
        }
      }
      setLoading(false);
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmitAbsence = async (data: SignalementAbsenceData) => {
    const result = await creerSignalementAbsence({
      structure_id: structureId,
      enfant_id: data.enfant_id,
      date: data.date,
      motif: data.motif,
      commentaire: data.commentaire,
      auteur: userName,
    });
    if (result.success) {
      toast.success("Absence signalée !");
      absenceForm.reset({ enfant_id: data.enfant_id, date: new Date().toISOString().split("T")[0], motif: "maladie" });
    } else {
      toast.error(result.error);
    }
  };

  const onSubmitApport = async (data: SignalementApportData) => {
    const result = await creerSignalementApport({
      structure_id: structureId,
      enfant_id: data.enfant_id,
      date: data.date,
      description: data.description,
      auteur: userName,
    });
    if (result.success) {
      toast.success("Apport signalé !");
      apportForm.reset({ enfant_id: data.enfant_id, date: new Date().toISOString().split("T")[0], description: "" });
    } else {
      toast.error(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={32} className="animate-spin text-petitsafe-primary" />
      </div>
    );
  }

  const inputClass = "w-full h-12 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-petitsafe-primary/30 focus:border-petitsafe-primary";

  return (
    <div className="space-y-4">
      <Link href="/portail-parents" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-petitsafe-primary transition-colors">
        <ArrowLeft size={16} />
        Retour à la journée
      </Link>

      <h1 className="text-xl font-bold text-gray-800">Signalements</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("absence")}
          className={`flex-1 h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "absence"
              ? "bg-petitsafe-primary text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <CalendarOff size={18} />
          Signaler une absence
        </button>
        <button
          onClick={() => setActiveTab("apport")}
          className={`flex-1 h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "apport"
              ? "bg-petitsafe-primary text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Package size={18} />
          Signaler un apport
        </button>
      </div>

      {/* Formulaire absence */}
      {activeTab === "absence" && (
        <form onSubmit={absenceForm.handleSubmit(onSubmitAbsence)} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label htmlFor="absence-enfant" className="block text-sm font-medium text-gray-700 mb-1">Enfant</label>
            <select id="absence-enfant" {...absenceForm.register("enfant_id")} className={inputClass}>
              {enfants.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
            </select>
            {absenceForm.formState.errors.enfant_id && <p className="text-sm text-red-500 mt-1">{absenceForm.formState.errors.enfant_id.message}</p>}
          </div>

          <div>
            <label htmlFor="absence-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input id="absence-date" type="date" {...absenceForm.register("date")} className={inputClass} />
            {absenceForm.formState.errors.date && <p className="text-sm text-red-500 mt-1">{absenceForm.formState.errors.date.message}</p>}
          </div>

          <div>
            <label htmlFor="absence-motif" className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
            <select id="absence-motif" {...absenceForm.register("motif")} className={inputClass}>
              <option value="maladie">Maladie</option>
              <option value="vacances">Vacances</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label htmlFor="absence-commentaire" className="block text-sm font-medium text-gray-700 mb-1">Commentaire (optionnel)</label>
            <textarea
              id="absence-commentaire"
              {...absenceForm.register("commentaire")}
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-petitsafe-primary/30 focus:border-petitsafe-primary resize-none"
              placeholder="Précisions..."
            />
          </div>

          <button
            type="submit"
            disabled={absenceForm.formState.isSubmitting}
            className="w-full h-12 rounded-xl bg-petitsafe-primary text-white font-medium hover:bg-petitsafe-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {absenceForm.formState.isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CalendarOff size={20} />}
            Signaler l&apos;absence
          </button>
        </form>
      )}

      {/* Formulaire apport */}
      {activeTab === "apport" && (
        <form onSubmit={apportForm.handleSubmit(onSubmitApport)} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label htmlFor="apport-enfant" className="block text-sm font-medium text-gray-700 mb-1">Enfant</label>
            <select id="apport-enfant" {...apportForm.register("enfant_id")} className={inputClass}>
              {enfants.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
            </select>
            {apportForm.formState.errors.enfant_id && <p className="text-sm text-red-500 mt-1">{apportForm.formState.errors.enfant_id.message}</p>}
          </div>

          <div>
            <label htmlFor="apport-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input id="apport-date" type="date" {...apportForm.register("date")} className={inputClass} />
            {apportForm.formState.errors.date && <p className="text-sm text-red-500 mt-1">{apportForm.formState.errors.date.message}</p>}
          </div>

          <div>
            <label htmlFor="apport-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="apport-description"
              {...apportForm.register("description")}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-petitsafe-primary/30 focus:border-petitsafe-primary resize-none"
              placeholder="Ex : lait maternel 3 biberons, gâteau anniversaire..."
            />
            {apportForm.formState.errors.description && <p className="text-sm text-red-500 mt-1">{apportForm.formState.errors.description.message}</p>}
          </div>

          <button
            type="submit"
            disabled={apportForm.formState.isSubmitting}
            className="w-full h-12 rounded-xl bg-petitsafe-primary text-white font-medium hover:bg-petitsafe-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {apportForm.formState.isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Package size={20} />}
            Signaler l&apos;apport
          </button>
        </form>
      )}
    </div>
  );
}
