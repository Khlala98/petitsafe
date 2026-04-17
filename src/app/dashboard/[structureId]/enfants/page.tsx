"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEnfants } from "@/app/actions/enfants";
import { getSeuilsAge } from "@/app/actions/structure";
import { listerEnfantsAvecPAI } from "@/app/actions/pai";
import { calculerAge, calculerGroupeAuto, joursAvantBascule } from "@/lib/business-logic";
import { BadgeAllergie } from "@/components/shared/badge-allergie";
import { BadgeRegime } from "@/components/shared/badge-regime";
import { BoutonAction } from "@/components/shared/bouton-action";
import { GROUPES_ENFANTS } from "@/lib/constants";
import { Plus, Search, Upload, Loader2, AlertTriangle, ShieldAlert } from "lucide-react";
import { ImportCSVModal } from "@/components/enfants/import-csv-modal";
import { useProfil } from "@/hooks/use-profil";

interface Enfant {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: string;
  sexe?: string | null;
  groupe?: string | null;
  groupe_force?: boolean;
  photo_url?: string | null;
  allergies: { id: string; allergene: string; severite: "LEGERE" | "MODEREE" | "SEVERE" }[];
  regimes: string[];
}

const COULEURS_AVATAR = ["#2563eb", "#3b82f6", "#F4A261", "#E53E3E", "#8E44AD", "#F39C12"];

export default function EnfantsPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;
  const { isAdmin } = useProfil();
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [enfantsAvecPai, setEnfantsAvecPai] = useState<Set<string>>(new Set());
  const [seuils, setSeuils] = useState({ seuil_bebes_max: 18, seuil_moyens_max: 30 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupeFiltre, setGroupeFiltre] = useState<string>("Tous");
  const [showImport, setShowImport] = useState(false);

  const fetchEnfants = async () => {
    const [result, seuilsRes, paiRes] = await Promise.all([
      getEnfants(structureId),
      getSeuilsAge(structureId),
      listerEnfantsAvecPAI(structureId),
    ]);
    if (result.success && result.data) {
      setEnfants(result.data.map((e) => ({ ...e, date_naissance: e.date_naissance.toISOString(), groupe_force: (e as unknown as { groupe_force: boolean }).groupe_force })));
    }
    if (seuilsRes.success && seuilsRes.data) {
      setSeuils(seuilsRes.data);
    }
    if (paiRes.success && paiRes.data) {
      setEnfantsAvecPai(new Set(paiRes.data));
    }
    setLoading(false);
  };

  useEffect(() => { fetchEnfants(); }, [structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  const maintenant = new Date();

  // Calculer le groupe effectif de chaque enfant
  const getGroupeEffectif = (e: Enfant): string => {
    if (e.groupe_force && e.groupe) return e.groupe;
    return calculerGroupeAuto(new Date(e.date_naissance), seuils.seuil_bebes_max, seuils.seuil_moyens_max, maintenant);
  };

  const filtres = enfants
    .filter((e) => groupeFiltre === "Tous" || getGroupeEffectif(e) === groupeFiltre)
    .filter((e) => e.prenom.toLowerCase().includes(search.toLowerCase()) || e.nom.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-rzpanda-primary" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Enfants</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowImport(true)}
              className="h-10 px-4 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              <Upload size={16} /> Importer un CSV
            </button>
            <BoutonAction label="Ajouter un enfant" icon={Plus} size="md"
              onClick={() => router.push(`/dashboard/${structureId}/enfants/nouveau`)} />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher un enfant..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none text-sm" />
        </div>
        <div className="flex gap-1.5">
          {["Tous", ...GROUPES_ENFANTS].map((g) => (
            <button key={g} onClick={() => setGroupeFiltre(g)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${groupeFiltre === g ? "bg-rzpanda-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtres.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">{enfants.length === 0 ? "Aucun enfant" : "Aucun résultat"}</p>
          <p className="text-gray-300 text-sm">
            {enfants.length === 0 ? "Ajoutez votre premier enfant ou importez un CSV depuis votre logiciel existant." : "Essayez un autre filtre ou une autre recherche."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtres.map((enfant) => {
            const age = calculerAge(new Date(enfant.date_naissance), maintenant);
            const couleur = COULEURS_AVATAR[enfant.prenom.charCodeAt(0) % COULEURS_AVATAR.length];
            const initiale = enfant.prenom.charAt(0).toUpperCase();
            const groupeEffectif = getGroupeEffectif(enfant);
            const bascule = !enfant.groupe_force ? joursAvantBascule(new Date(enfant.date_naissance), seuils.seuil_bebes_max, seuils.seuil_moyens_max, maintenant) : null;

            return (
              <button key={enfant.id} onClick={() => router.push(`/dashboard/${structureId}/enfants/${enfant.id}`)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left w-full">
                <div className="flex items-start gap-3">
                  {enfant.photo_url ? (
                    <img src={enfant.photo_url} alt={enfant.prenom} className="h-12 w-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ backgroundColor: couleur }}>
                      {initiale}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 truncate">{enfant.prenom} {enfant.nom}</p>
                    <p className="text-sm text-gray-500">
                      {age} · {groupeEffectif}
                      {enfant.groupe_force && <span className="ml-1 text-[10px] text-amber-600">(forcé)</span>}
                    </p>
                    {bascule && bascule.jours <= 30 && (
                      <p className="text-[10px] text-blue-600 mt-0.5">
                        Bascule {bascule.prochainGroupe} dans {bascule.jours} jour{bascule.jours > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 mt-1">
                    {enfantsAvecPai.has(enfant.id) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full" aria-label="PAI">
                        <ShieldAlert size={10} /> PAI
                      </span>
                    )}
                    {enfant.allergies.length > 0 && (
                      <AlertTriangle size={18} className="text-red-500" aria-label="Allergies" />
                    )}
                  </div>
                </div>
                {(enfant.allergies.length > 0 || enfant.regimes.length > 0) && (
                  <div className="mt-3 space-y-2">
                    {enfant.allergies.length > 0 && <BadgeAllergie enfant={enfant} />}
                    {enfant.regimes.length > 0 && <BadgeRegime enfant={enfant} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {showImport && <ImportCSVModal structureId={structureId} onClose={() => setShowImport(false)} onImported={fetchEnfants} />}
    </div>
  );
}
