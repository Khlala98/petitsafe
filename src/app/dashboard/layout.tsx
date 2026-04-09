"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from "@/hooks/use-auth";
import { ProfilProvider } from "@/hooks/use-profil";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";
import { SelectProfil } from "@/components/layout/select-profil";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, prenom, structures, activeStructureId, activeStructure, modulesActifs, switchStructure, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const handleSwitchStructure = (id: string) => {
    switchStructure(id);
    router.push(`/dashboard/${id}`);
  };

  // Auth en cours de chargement → spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rzpanda-fond">
        <Loader2 size={32} className="animate-spin text-rzpanda-primary" />
      </div>
    );
  }

  // Pas d'utilisateur → l'effet ci-dessus redirige vers /login, on n'affiche rien
  if (!user) return null;

  // Utilisateur connecté mais aucune structure (ou activeStructure introuvable) :
  if (!activeStructureId || !activeStructure) {
    return (
      <div className="min-h-screen bg-rzpanda-fond">
        <main className="px-4 md:px-6 py-4">{children}</main>
      </div>
    );
  }

  const nom = user?.user_metadata?.nom || user?.user_metadata?.full_name?.split(/\s+/).slice(1).join(" ") || "";

  return (
    <ProfilProvider structureId={activeStructureId}>
      <SelectProfil structureId={activeStructureId} userPrenom={prenom} userNom={nom}>
        <div className="flex h-screen bg-rzpanda-fond overflow-hidden">
          <Sidebar structureId={activeStructureId} structureNom={activeStructure.structure.nom} prenom={prenom} modulesActifs={modulesActifs} />
          <div className="flex flex-col flex-1 min-w-0">
            <Topbar structures={structures} activeStructureId={activeStructureId} onSwitchStructure={handleSwitchStructure} prenom={prenom} />
            <main className="flex-1 overflow-y-auto pb-20 md:pb-4 px-4 md:px-6 py-4">{children}</main>
          </div>
          <BottomNav structureId={activeStructureId} modulesActifs={modulesActifs} />
        </div>
      </SelectProfil>
    </ProfilProvider>
  );
}
