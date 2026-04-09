"use client";

import { useProfil } from "@/hooks/use-profil";
import type { ReactNode } from "react";

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin } = useProfil();
  if (!isAdmin) return <>{fallback}</>;
  return <>{children}</>;
}

interface OwnerOrAdminProps {
  children: ReactNode;
  profilId?: string | null;
  fallback?: ReactNode;
}

export function OwnerOrAdmin({ children, profilId, fallback = null }: OwnerOrAdminProps) {
  const { profil, isAdmin } = useProfil();
  if (isAdmin) return <>{children}</>;
  if (profil && profilId && profil.id === profilId) return <>{children}</>;
  return <>{fallback}</>;
}
