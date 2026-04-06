"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NotificationsBell } from "./notifications-bell";

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
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${s.structure_id === activeStructureId ? "text-petitsafe-primary font-medium" : "text-gray-600"}`}>
                  {s.structure.nom}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <span className="text-sm font-medium text-gray-700">{active?.structure.nom ?? "PetitSafe"}</span>
      )}
      <div className="flex items-center gap-2">
        {activeStructureId && <NotificationsBell structureId={activeStructureId} />}
        <div className="h-8 w-8 rounded-full bg-petitsafe-primary/10 flex items-center justify-center text-sm font-semibold text-petitsafe-primary">
          {prenom.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-gray-600 hidden sm:block">{prenom}</span>
      </div>
    </header>
  );
}
