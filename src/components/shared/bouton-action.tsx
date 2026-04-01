"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface BoutonActionProps {
  label: string;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  "aria-label"?: string;
}

const TAILLES = {
  sm: "h-10 px-3 text-sm gap-1.5",
  md: "h-12 px-4 text-base gap-2",
  lg: "h-14 px-6 text-lg gap-2.5",
} as const;

const VARIANTES = {
  primary:
    "bg-petitsafe-primary text-white hover:bg-petitsafe-primary/90 active:bg-petitsafe-primary/80",
  secondary:
    "bg-petitsafe-secondary text-white hover:bg-petitsafe-secondary/90 active:bg-petitsafe-secondary/80",
  danger:
    "bg-petitsafe-danger text-white hover:bg-petitsafe-danger/90 active:bg-petitsafe-danger/80",
  ghost:
    "bg-transparent text-petitsafe-texte hover:bg-gray-100 active:bg-gray-200",
} as const;

/**
 * Bouton touch-friendly, 48px hauteur minimum, coins arrondis, icône + label.
 * Conçu pour une utilisation tablette/mobile avec les doigts.
 */
export function BoutonAction({
  label,
  icon: Icon,
  size = "lg",
  variant = "primary",
  onClick,
  disabled = false,
  type = "button",
  className,
  "aria-label": ariaLabel,
}: BoutonActionProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petitsafe-primary focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "min-h-[48px]", // accessibilité tactile
        TAILLES[size],
        VARIANTES[variant],
        className
      )}
    >
      {Icon && <Icon className="shrink-0" size={size === "lg" ? 22 : size === "md" ? 20 : 18} aria-hidden="true" />}
      {label}
    </button>
  );
}
