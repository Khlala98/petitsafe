"use client";

import { useProfil } from "@/hooks/use-profil";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function useAdminGuard() {
  const { profil, isAdmin, loading } = useProfil();
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;

  useEffect(() => {
    if (!loading && profil && !isAdmin) {
      router.replace(`/dashboard/${structureId}`);
    }
  }, [loading, profil, isAdmin, router, structureId]);

  return { isAdmin, loading: loading || !profil };
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminGuard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-rzpanda-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return <>{children}</>;
}
