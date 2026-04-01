"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface RealtimeHandlers<T> {
  onInsert?: (row: T) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function useRealtimeSubscription<T>(
  table: string,
  structureId: string | null,
  handlers: RealtimeHandlers<T>
) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!structureId) return;
    const channel = supabase
      .channel(`${table}-${structureId}`)
      .on("postgres_changes", { event: "*", schema: "public", table, filter: `structure_id=eq.${structureId}` },
        (payload) => {
          if (payload.eventType === "INSERT") handlers.onInsert?.(payload.new as T);
          if (payload.eventType === "UPDATE") handlers.onUpdate?.(payload.new as T);
          if (payload.eventType === "DELETE") handlers.onDelete?.(payload.old as T);
        })
      .subscribe((status) => setIsConnected(status === "SUBSCRIBED"));
    return () => { supabase.removeChannel(channel); };
  }, [table, structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { isConnected };
}
