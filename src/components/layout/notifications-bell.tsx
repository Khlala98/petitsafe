"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, AlertOctagon, Clock, AlertTriangle, Pill, Milk, ShieldAlert } from "lucide-react";
import { getAlertes, type AlerteItem } from "@/app/actions/alertes";

interface NotificationsBellProps {
  structureId: string;
}

export function NotificationsBell({ structureId }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const [alertes, setAlertes] = useState<AlerteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const fetchAlertes = useCallback(async () => {
    const res = await getAlertes(structureId);
    if (res.success && res.data) setAlertes(res.data);
    setLoading(false);
  }, [structureId]);

  useEffect(() => {
    fetchAlertes();
    // Refresh every 60 seconds
    const interval = setInterval(fetchAlertes, 60000);
    return () => clearInterval(interval);
  }, [fetchAlertes]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const count = alertes.length;
  const grouped = {
    rouge: alertes.filter((a) => a.niveau === "rouge"),
    orange: alertes.filter((a) => a.niveau === "orange"),
  };

  const renderAlertIcon = (type: AlerteItem["type"]) => {
    if (type === "dlc_depassee") return <AlertOctagon size={16} className="text-red-600 shrink-0" />;
    if (type === "dlc_proche") return <AlertTriangle size={16} className="text-orange-500 shrink-0" />;
    if (type === "medicament_a_signer") return <Pill size={16} className="text-blue-600 shrink-0" />;
    if (type === "lait_maternel_dlc") return <Milk size={16} className="text-pink-500 shrink-0" />;
    if (type === "pai_present") return <ShieldAlert size={16} className="text-amber-600 shrink-0" />;
    return <Clock size={16} className="text-orange-500 shrink-0" />;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label={`Notifications (${count} alerte${count !== 1 ? "s" : ""})`}
      >
        <Bell size={20} />
        {count > 0 && (
          <span className={`absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${grouped.rouge.length > 0 ? "bg-red-600" : "bg-orange-500"}`}>
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[340px] max-w-[340px] max-h-[480px] bg-white rounded-xl shadow-lg border border-gray-200 z-50 flex flex-col">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Alertes</h3>
            {count > 0 && (
              <span className="text-xs text-gray-400">{count} active{count > 1 ? "s" : ""}</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-center text-xs text-gray-400 py-8">Chargement…</p>
            ) : count === 0 ? (
              <div className="text-center py-10 px-4">
                <Bell size={28} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Aucune alerte active</p>
                <p className="text-xs text-gray-300 mt-1">Tout est sous contrôle 👍</p>
              </div>
            ) : (
              <>
                {grouped.rouge.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 bg-red-50 text-[10px] font-bold text-red-700 uppercase tracking-wider">
                      Critique ({grouped.rouge.length})
                    </div>
                    {grouped.rouge.map((a) => (
                      <Link
                        key={a.id}
                        href={a.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        {renderAlertIcon(a.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{a.titre}</p>
                          <p className="text-xs text-gray-500 truncate">{a.detail}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {grouped.orange.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 bg-orange-50 text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                      À surveiller ({grouped.orange.length})
                    </div>
                    {grouped.orange.map((a) => (
                      <Link
                        key={a.id}
                        href={a.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        {renderAlertIcon(a.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{a.titre}</p>
                          <p className="text-xs text-gray-500 truncate">{a.detail}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
