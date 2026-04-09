"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useModules } from "@/hooks/use-modules";
import { useProfil } from "@/hooks/use-profil";
import { LayoutDashboard, Thermometer, Baby, Sparkles, Package, Menu, X, ClipboardList, MessageSquare, FileText, FileDown, Settings, LogOut, Moon } from "lucide-react";
import { useState } from "react";
import type { ModuleId } from "@/lib/constants";

interface BottomNavProps {
  structureId: string;
  modulesActifs: string[];
}

export function BottomNav({ structureId, modulesActifs }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { isActif } = useModules(modulesActifs);
  const { isAdmin } = useProfil();
  const [showMore, setShowMore] = useState(false);
  const basePath = `/dashboard/${structureId}`;

  // Build dynamic main items: dashboard + up to 3 active HACCP modules
  const haccpItems: { label: string; icon: typeof LayoutDashboard; href: string; moduleId: ModuleId }[] = [
    { label: "Temp.", icon: Thermometer, href: "/temperatures", moduleId: "temperatures" },
    { label: "Biberon", icon: Baby, href: "/biberonnerie", moduleId: "biberonnerie" },
    { label: "Nettoyage", icon: Sparkles, href: "/nettoyage", moduleId: "nettoyage" },
    { label: "Stock", icon: Package, href: "/stock", moduleId: "tracabilite" },
  ];
  const activeHaccpItems = haccpItems.filter((item) => {
    if (item.moduleId === "tracabilite" && !isAdmin) return false;
    return isActif(item.moduleId);
  }).slice(0, 3);

  const mainItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "" },
    ...activeHaccpItems,
  ];

  const moreItems = [
    { label: "Enfants", icon: Baby, href: "/enfants" },
    ...(isActif("repas") || isActif("changes") || isActif("siestes") ? [{ label: "Suivi", icon: ClipboardList, href: "/suivi" }] : []),
    ...(isActif("transmissions") ? [{ label: "Transmissions", icon: MessageSquare, href: "/transmissions" }] : []),
    ...(isActif("protocoles") ? [{ label: "Protocoles", icon: FileText, href: "/protocoles" }] : []),
    ...(isAdmin ? [{ label: "Exports", icon: FileDown, href: "/exports" }] : []),
    ...(isAdmin ? [{ label: "Paramètres", icon: Settings, href: "/parametres" }] : []),
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-700">Menu</span>
              <button onClick={() => setShowMore(false)} aria-label="Fermer"><X size={20} className="text-gray-400" /></button>
            </div>
            {moreItems.map((item) => (
              <Link key={item.href} href={basePath + item.href} onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                <item.icon size={20} /><span>{item.label}</span>
              </Link>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full">
              <LogOut size={20} /><span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 md:hidden">
        <div className="flex items-center justify-around h-16">
          {mainItems.map((item) => {
            const fullHref = basePath + item.href;
            const isActive = item.href === "" ? (pathname === basePath || pathname === basePath + "/") : pathname.startsWith(fullHref);
            return (
              <Link key={item.href} href={fullHref}
                className={cn("flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1", isActive ? "text-rzpanda-primary" : "text-gray-400")}>
                <item.icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button onClick={() => setShowMore(true)}
            className={cn("flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1", showMore ? "text-rzpanda-primary" : "text-gray-400")} aria-label="Plus d'options">
            <Menu size={22} /><span className="text-[10px] font-medium">Plus</span>
          </button>
        </div>
      </nav>
    </>
  );
}
