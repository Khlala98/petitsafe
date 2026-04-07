"use client";

import { PandaIcon } from "@/components/shared/panda-icon";
import { LogoText } from "@/components/shared/logo-text";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useModules } from "@/hooks/use-modules";
import {
  LayoutDashboard, Baby, ClipboardList, Thermometer, Package, Sparkles,
  MessageSquare, FileText, FileDown, Settings, LogOut, ChevronLeft, Moon,
} from "lucide-react";
import { useState } from "react";
import type { ModuleId } from "@/lib/constants";

interface SidebarProps {
  structureId: string;
  structureNom: string;
  prenom: string;
  modulesActifs: string[];
}

const ICONS: Record<string, typeof LayoutDashboard> = {
  Thermometer, Baby, Package, Sparkles, ClipboardList,
  MessageSquare, FileText, FileDown, Moon,
};

interface MenuItem {
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
  moduleId?: ModuleId;
  alwaysVisible?: boolean;
  condition?: (isActif: (m: ModuleId) => boolean) => boolean;
}

const SECTIONS: { title: string; category?: string; items: MenuItem[] }[] = [
  {
    title: "",
    items: [
      { label: "Tableau de bord", icon: LayoutDashboard, href: "", alwaysVisible: true },
    ],
  },
  {
    title: "HACCP & Traçabilité",
    category: "haccp",
    items: [
      { label: "Températures", icon: Thermometer, href: "/temperatures", moduleId: "temperatures" },
      { label: "Biberonnerie", icon: Baby, href: "/biberonnerie", moduleId: "biberonnerie" },
      { label: "Réceptions & Stock", icon: Package, href: "/stock", condition: (isActif) => isActif("tracabilite") || isActif("stocks") },
      { label: "Nettoyage", icon: Sparkles, href: "/nettoyage", moduleId: "nettoyage" },
    ],
  },
  {
    title: "Suivi Enfants",
    category: "suivi",
    items: [
      { label: "Enfants", icon: Baby, href: "/enfants", alwaysVisible: true },
      { label: "Suivi du jour", icon: ClipboardList, href: "/suivi", condition: (isActif) => isActif("repas") || isActif("changes") || isActif("siestes") },
      { label: "Transmissions", icon: MessageSquare, href: "/transmissions", moduleId: "transmissions" },
    ],
  },
  {
    title: "Gestion",
    items: [
      { label: "Protocoles", icon: FileText, href: "/protocoles", moduleId: "protocoles" },
      { label: "Exports PDF", icon: FileDown, href: "/exports", alwaysVisible: true },
      { label: "Paramètres", icon: Settings, href: "/parametres", alwaysVisible: true },
    ],
  },
];

export function Sidebar({ structureId, structureNom, prenom, modulesActifs }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);
  const { isActif, modulesParCategorie } = useModules(modulesActifs);
  const basePath = `/dashboard/${structureId}`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isItemVisible = (item: MenuItem): boolean => {
    if (item.alwaysVisible) return true;
    if (item.condition) return item.condition(isActif);
    if (item.moduleId) return isActif(item.moduleId);
    return true;
  };

  const isSectionVisible = (section: typeof SECTIONS[number]): boolean => {
    if (!section.title) return true; // always show the dashboard section
    return section.items.some(isItemVisible);
  };

  return (
    <aside className={cn("hidden md:flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-200 shrink-0", collapsed ? "w-[72px]" : "w-[240px]")}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <PandaIcon size={32} />
          {!collapsed && <LogoText className="text-xl font-bold" />}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" aria-label={collapsed ? "Ouvrir le menu" : "Réduire le menu"}>
          <ChevronLeft size={18} className={cn("transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Structure</p>
          <p className="text-sm font-medium text-gray-700 truncate">{structureNom}</p>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {SECTIONS.map((section) => {
          if (!isSectionVisible(section)) return null;
          const visibleItems = section.items.filter(isItemVisible);
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.title || "main"} className="mb-2">
              {section.title && !collapsed && (
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mt-3 mb-1">{section.title}</p>
              )}
              {visibleItems.map((item) => {
                const fullHref = basePath + item.href;
                const isActive = item.href === "" ? (pathname === basePath || pathname === basePath + "/") : pathname.startsWith(fullHref);
                return (
                  <Link key={item.href} href={fullHref}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5",
                      isActive ? "bg-rzpanda-primary/10 text-rzpanda-primary" : "text-gray-600 hover:bg-gray-50")}>
                    <item.icon size={20} className="shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-gray-100 p-3">
        {!collapsed && <p className="text-sm font-medium text-gray-700 mb-2 truncate px-1">{prenom}</p>}
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full" aria-label="Se déconnecter">
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
