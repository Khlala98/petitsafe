"use client";

import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, prenom, structures, activeStructureId, activeStructure, switchStructure, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleSwitchStructure = (id: string) => {
    switchStructure(id);
    router.push(`/dashboard/${id}`);
  };

  if (loading || !user || !activeStructureId || !activeStructure) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petitsafe-fond">
        <Loader2 size={32} className="animate-spin text-petitsafe-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-petitsafe-fond overflow-hidden">
      <Sidebar
        structureId={activeStructureId}
        structureNom={activeStructure.structure.nom}
        prenom={prenom}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          structures={structures}
          activeStructureId={activeStructureId}
          onSwitchStructure={handleSwitchStructure}
          prenom={prenom}
        />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-4 px-4 md:px-6 py-4">
          {children}
        </main>
      </div>
      <BottomNav structureId={activeStructureId} />
    </div>
  );
}
