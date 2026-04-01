"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Baby,
  ClipboardList,
  Thermometer,
  Baby as BottleIcon,
  Package,
  SprayCan,
  MessageSquare,
  FileText,
  FileDown,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  structureId: string;
  structureNom: string;
  prenom: string;
}

const MENU_ITEMS = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "" },
  { label: "Enfants", icon: Baby, href: "/enfants" },
  { label: "Suivi du jour", icon: ClipboardList, href: "/suivi" },
  { label: "Températures", icon: Thermometer, href: "/temperatures" },
  { label: "Biberonnerie", icon: BottleIcon, href: "/biberonnerie" },
  { label: "Réceptions & Stock", icon: Package, href: "/stock" },
  { label: "Nettoyage", icon: SprayCan, href: "/nettoyage" },
  { label: "Transmissions", icon: MessageSquare, href: "/transmissions" },
  { label: "Protocoles", icon: FileText, href: "/protocoles" },
  { label: "Exports PDF", icon: FileDown, href: "/exports" },
  { label: "Paramètres", icon: Settings, href: "/parametres" },
];

export function Sidebar({ structureId, structureNom, prenom }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);
  const basePath = `/dashboard/${structureId}`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-200 shrink-0",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!collapsed && (
          <span className="text-xl font-bold text-petitsafe-primary">PetitSafe</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          aria-label={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
        >
          <ChevronLeft
            size={18}
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Structure name */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Structure</p>
          <p className="text-sm font-medium text-gray-700 truncate">{structureNom}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {MENU_ITEMS.map((item) => {
          const fullHref = basePath + item.href;
          const isActive =
            item.href === ""
              ? pathname === basePath || pathname === basePath + "/"
              : pathname.startsWith(fullHref);

          return (
            <Link
              key={item.href}
              href={fullHref}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5",
                isActive
                  ? "bg-petitsafe-primary/10 text-petitsafe-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-gray-100 p-3">
        {!collapsed && (
          <p className="text-sm font-medium text-gray-700 mb-2 truncate px-1">{prenom}</p>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          aria-label="Se déconnecter"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
