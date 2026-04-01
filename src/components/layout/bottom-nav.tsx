"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Thermometer,
  Baby,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Package,
  SprayCan,
  MessageSquare,
  FileText,
  FileDown,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface BottomNavProps {
  structureId: string;
}

export function BottomNav({ structureId }: BottomNavProps) {
  const pathname = usePathname();
  const basePath = `/dashboard/${structureId}`;
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const mainItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "" },
    { label: "Suivi", icon: ClipboardList, href: "/suivi" },
    { label: "Temp.", icon: Thermometer, href: "/temperatures" },
    { label: "Biberon", icon: Baby, href: "/biberonnerie" },
  ];

  const moreItems = [
    { label: "Enfants", icon: Baby, href: "/enfants" },
    { label: "Stock", icon: Package, href: "/stock" },
    { label: "Nettoyage", icon: SprayCan, href: "/nettoyage" },
    { label: "Transmissions", icon: MessageSquare, href: "/transmissions" },
    { label: "Protocoles", icon: FileText, href: "/protocoles" },
    { label: "Exports", icon: FileDown, href: "/exports" },
    { label: "Paramètres", icon: Settings, href: "/parametres" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-700">Menu</span>
              <button onClick={() => setShowMore(false)} aria-label="Fermer">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            {moreItems.map((item) => (
              <Link
                key={item.href}
                href={basePath + item.href}
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 md:hidden">
        <div className="flex items-center justify-around h-16">
          {mainItems.map((item) => {
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
                  "flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1",
                  isActive ? "text-petitsafe-primary" : "text-gray-400"
                )}
              >
                <item.icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1",
              showMore ? "text-petitsafe-primary" : "text-gray-400"
            )}
            aria-label="Plus d'options"
          >
            <Menu size={22} />
            <span className="text-[10px] font-medium">Plus</span>
          </button>
        </div>
      </nav>
    </>
  );
}
