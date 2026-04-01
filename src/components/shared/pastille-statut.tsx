"use client";

import { cn } from "@/lib/utils";

type Statut = "conforme" | "attention" | "alerte";

const COULEURS: Record<Statut, string> = {
  conforme: "bg-green-500",
  attention: "bg-orange-400",
  alerte: "bg-red-500",
};

const LABELS: Record<Statut, string> = {
  conforme: "Conforme",
  attention: "Attention",
  alerte: "Non conforme",
};

export function PastilleStatut({ status }: { status: Statut }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn("inline-block h-3 w-3 rounded-full shrink-0", COULEURS[status])}
        aria-hidden="true"
      />
      <span className="sr-only">{LABELS[status]}</span>
    </span>
  );
}
