"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEnfants } from "@/app/actions/enfants";
import { getSuiviDuJour } from "@/app/actions/suivi";
import { useAuth } from "@/hooks/use-auth";
import { useModules } from "@/hooks/use-modules";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";
import { GROUPES_ENFANTS } from "@/lib/constants";
import { Loader2, ArrowLeft, Baby, UtensilsCrossed, Droplets, Moon, MessageSquare } from "lucide-react";
import Link from "next/link";

interface Enfant {
  id: string; prenom: string; nom: string; groupe?: string | null;
  allergies: { id: string; allergene: string; severite: string }[];
}

type Counts = Record<string, { biberons: number; repas: number; changes: number; siestes: number; transmissions: number }>;

const COULEURS_AVATAR = ["#2563eb", "#3b82f6", "#F4A261", "#E53E3E", "#8E44AD", "#F39C12"];

export default function VueGroupePage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;
  const { modulesActifs } = useAuth();
  const { isActif } = useModules(modulesActifs);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [counts, setCounts] = useState<Counts>({});
  const [groupeFiltre, setGroupeFiltre] = useState("Tous");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [enfantsRes, suiviRes] = await Promise.all([
      getEnfants(structureId),
      getSuiviDuJour(structureId),
    ]);
    if (enfantsRes.success && enfantsRes.data) {
      setEnfants(enfantsRes.data.map((e) => ({ ...e, date_naissance: e.date_naissance.toISOString() })));
    }
    if (suiviRes.success && suiviRes.data) setCounts(suiviRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime updates
  useRealtimeSubscription("Change", structureId, { onInsert: () => fetchData() });
  useRealtimeSubscription("Repas", structureId, { onInsert: () => fetchData() });
  useRealtimeSubscription("Sieste", structureId, { onInsert: () => fetchData(), onUpdate: () => fetchData() });
  useRealtimeSubscription("Biberon", structureId, { onInsert: () => fetchData() });
  useRealtimeSubscription("Transmission", structureId, { onInsert: () => fetchData() });

  const filteredEnfants = enfants.filter((e) => groupeFiltre === "Tous" || e.groupe === groupeFiltre);

  // Build columns based on active modules
  const columns: { key: string; icon: typeof Baby; label: string }[] = [];
  if (isActif("biberonnerie")) columns.push({ key: "biberons", icon: Baby, label: "🍼" });
  if (isActif("repas")) columns.push({ key: "repas", icon: UtensilsCrossed, label: "🍽️" });
  if (isActif("changes")) columns.push({ key: "changes", icon: Droplets, label: "🧷" });
  if (isActif("siestes")) columns.push({ key: "siestes", icon: Moon, label: "😴" });
  if (isActif("transmissions")) columns.push({ key: "transmissions", icon: MessageSquare, label: "📝" });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-rzpanda-primary" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/${structureId}/suivi`} className="text-gray-400 hover:text-rzpanda-primary">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Vue groupe</h1>
        </div>
        <span className="text-sm text-gray-500">{filteredEnfants.length} enfant{filteredEnfants.length > 1 ? "s" : ""}</span>
      </div>

      {/* Group filter */}
      <div className="flex gap-1.5">
        {["Tous", ...GROUPES_ENFANTS].map((g) => (
          <button key={g} onClick={() => setGroupeFiltre(g)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${groupeFiltre === g ? "bg-rzpanda-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {g}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Enfant</th>
              {columns.map((col) => (
                <th key={col.key} className="text-center py-3 px-3 text-lg" aria-label={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEnfants.map((enfant) => {
              const c = counts[enfant.id] ?? { biberons: 0, repas: 0, changes: 0, siestes: 0, transmissions: 0 };
              const couleur = COULEURS_AVATAR[enfant.prenom.charCodeAt(0) % COULEURS_AVATAR.length];

              return (
                <tr key={enfant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: couleur }}>
                        {enfant.prenom.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{enfant.prenom}</span>
                      {enfant.allergies.length > 0 && <span className="text-xs text-red-500">⚠️</span>}
                    </div>
                  </td>
                  {columns.map((col) => {
                    const count = (c as Record<string, number>)[col.key] ?? 0;
                    return (
                      <td key={col.key} className="text-center py-3 px-3">
                        <button
                          onClick={() => router.push(`/dashboard/${structureId}/suivi?enfant=${enfant.id}`)}
                          className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium ${count > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                          {count > 0 ? (count > 1 ? `✓ ×${count}` : "✓") : "—"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredEnfants.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">Aucun enfant dans ce groupe.</div>
        )}
      </div>
    </div>
  );
}
