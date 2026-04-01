"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { exportFormSchema, type ExportFormData } from "@/lib/schemas/exports";
import {
  getExportDDPPData, getExportPMIData, sauvegarderExport, getHistoriqueExports,
  type ExportDDPPData, type ExportPMIData,
} from "@/app/actions/exports";
import { pdf } from "@react-pdf/renderer";
import { PdfDDPP } from "@/components/pdf/pdf-ddpp";
import { PdfPMI } from "@/components/pdf/pdf-pmi";
import { toast } from "sonner";
import { FileDown, Loader2, Download, Calendar, FileText } from "lucide-react";

interface ExportHistorique {
  id: string; type_export: string; periode_debut: string;
  periode_fin: string; genere_par: string; created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const TYPE_LABELS: Record<string, string> = {
  DDPP: "DDPP (Sanitaire)",
  PMI: "PMI (Petite enfance)",
  INTERNE: "Interne",
};

export default function ExportsPage() {
  const params = useParams();
  const structureId = params.structureId as string;
  const { prenom, user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [historique, setHistorique] = useState<ExportHistorique[]>([]);
  const [loadingHist, setLoadingHist] = useState(true);

  const { register, handleSubmit, formState: { errors } } = useForm<ExportFormData>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      type_export: "DDPP",
      periode_debut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      periode_fin: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    const load = async () => {
      const res = await getHistoriqueExports(structureId);
      if (res.success && res.data) setHistorique(res.data);
      setLoadingHist(false);
    };
    load();
  }, [structureId]);

  const onSubmit = async (data: ExportFormData) => {
    setGenerating(true);
    try {
      let blob: Blob;

      if (data.type_export === "DDPP" || data.type_export === "INTERNE") {
        const result = await getExportDDPPData(structureId, data.periode_debut, data.periode_fin);
        if (!result.success) {
          toast.error(result.error);
          setGenerating(false);
          return;
        }
        if (!result.data) {
          toast.error("Aucune donnée disponible.");
          setGenerating(false);
          return;
        }
        blob = await pdf(<PdfDDPP data={result.data} />).toBlob();
      } else {
        const result = await getExportPMIData(structureId, data.periode_debut, data.periode_fin);
        if (!result.success) {
          toast.error(result.error);
          setGenerating(false);
          return;
        }
        if (!result.data) {
          toast.error("Aucune donnée disponible.");
          setGenerating(false);
          return;
        }
        blob = await pdf(<PdfPMI data={result.data} />).toBlob();
      }

      // Téléchargement direct
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `petitsafe-${data.type_export.toLowerCase()}-${data.periode_debut}-${data.periode_fin}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Sauvegarder dans l'historique
      await sauvegarderExport({
        structure_id: structureId,
        type_export: data.type_export,
        periode_debut: data.periode_debut,
        periode_fin: data.periode_fin,
        genere_par: prenom,
        url: `local-${Date.now()}`,
      });

      // Rafraîchir l'historique
      const hist = await getHistoriqueExports(structureId);
      if (hist.success && hist.data) setHistorique(hist.data);

      toast.success("PDF généré et téléchargé !");
    } catch {
      toast.error("Erreur lors de la génération du PDF.");
    }
    setGenerating(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <FileDown size={24} className="text-petitsafe-primary" />
        Exports PDF
      </h1>

      {/* Formulaire de génération */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h2 className="text-lg font-semibold text-gray-800">Générer un export</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="type_export" className="block text-sm font-medium text-gray-700 mb-1">
              Type d&apos;export
            </label>
            <select
              id="type_export"
              {...register("type_export")}
              className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-petitsafe-primary/30 focus:border-petitsafe-primary"
            >
              <option value="DDPP">DDPP — Contrôle sanitaire (HACCP)</option>
              <option value="PMI">PMI — Petite enfance (suivi enfants)</option>
              <option value="INTERNE">Interne — Rapport complet</option>
            </select>
            {errors.type_export && <p className="text-sm text-red-500 mt-1">{errors.type_export.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="periode_debut" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                Date de début
              </label>
              <input
                id="periode_debut"
                type="date"
                {...register("periode_debut")}
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-petitsafe-primary/30 focus:border-petitsafe-primary"
              />
              {errors.periode_debut && <p className="text-sm text-red-500 mt-1">{errors.periode_debut.message}</p>}
            </div>
            <div>
              <label htmlFor="periode_fin" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                Date de fin
              </label>
              <input
                id="periode_fin"
                type="date"
                {...register("periode_fin")}
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-petitsafe-primary/30 focus:border-petitsafe-primary"
              />
              {errors.periode_fin && <p className="text-sm text-red-500 mt-1">{errors.periode_fin.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full h-12 rounded-xl bg-petitsafe-primary text-white font-medium hover:bg-petitsafe-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <FileDown size={20} />
                Générer le PDF
              </>
            )}
          </button>
        </form>
      </div>

      {/* Historique */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Historique des exports</h2>

        {loadingHist ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : historique.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">Aucun export généré pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {historique.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-petitsafe-primary/10 text-petitsafe-primary">
                      {exp.type_export}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatDate(exp.periode_debut)} → {formatDate(exp.periode_fin)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Par {exp.genere_par} le {formatDate(exp.created_at)}
                  </p>
                </div>
                <Download size={18} className="text-gray-400 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
