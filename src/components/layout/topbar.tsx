"use client";

import { ChevronDown, RefreshCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NotificationsBell } from "./notifications-bell";
import { useProfil } from "@/hooks/use-profil";

interface Structure {
  structure_id: string;
  structure: { id: string; nom: string; type: string; modules_actifs: string[] };
}

interface TopbarProps {
  structures: Structure[];
  activeStructureId: string | null;
  onSwitchStructure: (id: string) => void;
  prenom: string;
}

export function Topbar({ structures, activeStructureId, onSwitchStructure, prenom }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = structures.find((s) => s.structure_id === activeStructureId);
  const { profil, clearProfil, profils } = useProfil();

  const displayPrenom = profil?.prenom || prenom;
  const displayInitiale = displayPrenom.charAt(0).toUpperCase();
  const displayPoste = profil?.poste || null;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      {structures.length > 1 ? (
        <div className="relative" ref={ref}>
          <button onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700" aria-label="Changer de structure">
            {active?.structure.nom ?? "Structure"}
            <ChevronDown size={16} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          {open && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[200px] z-50">
              {structures.map((s) => (
                <button key={s.structure_id} onClick={() => { onSwitchStructure(s.structure_id); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${s.structure_id === activeStructureId ? "text-rzpanda-primary font-medium" : "text-gray-600"}`}>
                  {s.structure.nom}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <span className="text-sm font-medium text-gray-700">{active?.structure.nom ?? "RZPan'Da"}</span>
      )}
      <div className="flex items-center gap-3">
        {activeStructureId && <NotificationsBell structureId={activeStructureId} />}
        {profils.length > 1 && (
          <button
            onClick={clearProfil}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 text-xs text-gray-500 transition-colors"
            title="Changer de profil"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Changer</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-rzpanda-primary/10 flex items-center justify-center text-sm font-semibold text-rzpanda-primary">
            {displayInitiale}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-medium text-gray-700 leading-tight">{displayPrenom}</span>
            {displayPoste && (
              <span className="text-[10px] text-gray-400 leading-tight">{displayPoste}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
