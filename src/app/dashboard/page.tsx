"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { activeStructureId, loading, structures } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && activeStructureId) router.replace(`/dashboard/${activeStructureId}`);
  }, [loading, activeStructureId, router]);

  if (!loading && structures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-gray-500">Aucune structure trouvée.</p>
        <p className="text-sm text-gray-400">Contactez votre administrateur ou créez une structure.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={32} className="animate-spin text-petitsafe-primary" />
    </div>
  );
}
