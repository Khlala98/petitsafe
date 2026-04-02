"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEnfant } from "@/app/actions/enfants";
import { EnfantForm } from "@/components/enfants/enfant-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ModifierEnfantPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;
  const enfantId = params.id as string;
  const [enfant, setEnfant] = useState<{
    id: string; prenom: string; nom: string; date_naissance: string; sexe?: string | null; groupe?: string | null;
    allergies: { allergene: string; severite: "LEGERE" | "MODEREE" | "SEVERE"; protocole?: string }[];
    contacts: { nom: string; lien: string; telephone: string; est_autorise_recuperer: boolean; ordre_priorite: number }[];
    regimes?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const result = await getEnfant(enfantId, structureId);
      if (result.success && result.data) {
        setEnfant({
          ...result.data,
          date_naissance: result.data.date_naissance.toISOString(),
          allergies: result.data.allergies.map((a) => ({ allergene: a.allergene, severite: a.severite, protocole: a.protocole ?? undefined })),
          contacts: result.data.contacts.map((c) => ({ nom: c.nom, lien: c.lien, telephone: c.telephone, est_autorise_recuperer: c.est_autorise_recuperer, ordre_priorite: c.ordre_priorite })),
          regimes: result.data.regimes,
        });
      } else {
        toast.error("Enfant non trouvé.");
        router.push(`/dashboard/${structureId}/enfants`);
      }
      setLoading(false);
    };
    fetch();
  }, [enfantId, structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !enfant) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-petitsafe-primary" /></div>;

  return <EnfantForm mode="edit" initial={enfant} />;
}
