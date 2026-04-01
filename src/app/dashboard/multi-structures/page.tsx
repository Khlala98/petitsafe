"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getMultiStructuresKpi } from "@/app/actions/portail-parents";
import { PastilleStatut } from "@/components/shared/pastille-statut";
import { TYPES_STRUCTURE } from "@/lib/constants";
import { Loader2, Building2, Users, Thermometer, Package, ArrowRight } from "lucide-react";

interface StructureKpi {
  id: string; nom: string; type: string;
  enfantsActifs: number; tempNonConformes: number;
  alertesDlc: number; nettoyagePct: number;
}

export default function MultiStructuresPage() {
  const { user, activeRole } = useAuth();
  const router = useRouter();
  const [structures, setStructures] = useState<StructureKpi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const result = await getMultiStructuresKpi(user.id);
      if (result.success && result.data) {
        setStructures(result.data.structures);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (activeRole !== "GESTIONNAIRE") {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Cette vue est réservée aux gestionnaires.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={32} className="animate-spin text-petitsafe-primary" />
      </div>
    );
  }

  if (structures.length <= 1) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Vous ne gérez qu&apos;une seule structure.</p>
        <p className="text-sm text-gray-400 mt-1">Cette vue sera utile lorsque vous aurez plusieurs structures.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 size={24} className="text-petitsafe-primary" />
          Vue multi-structures
        </h1>
        <p className="text-sm text-gray-500 mt-1">{structures.length} structures gérées</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {structures.map((s) => {
          const hasIssues = s.tempNonConformes > 0 || s.alertesDlc > 0;
          return (
            <button
              key={s.id}
              onClick={() => router.push(`/dashboard/${s.id}`)}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{s.nom}</h3>
                  <p className="text-xs text-gray-400">{TYPES_STRUCTURE[s.type as keyof typeof TYPES_STRUCTURE] ?? s.type}</p>
                </div>
                <ArrowRight size={18} className="text-gray-300 group-hover:text-petitsafe-primary transition-colors mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{s.enfantsActifs} enfant{s.enfantsActifs > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer size={16} className="text-gray-400" />
                  <PastilleStatut status={s.tempNonConformes > 0 ? "alerte" : "conforme"} />
                  <span className="text-sm text-gray-600">{s.tempNonConformes === 0 ? "OK" : `${s.tempNonConformes} alerte${s.tempNonConformes > 1 ? "s" : ""}`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-gray-400" />
                  <PastilleStatut status={s.alertesDlc > 0 ? "attention" : "conforme"} />
                  <span className="text-sm text-gray-600">{s.alertesDlc === 0 ? "OK" : `${s.alertesDlc} DLC`}</span>
                </div>
              </div>

              {hasIssues && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-red-500">Actions requises</p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
