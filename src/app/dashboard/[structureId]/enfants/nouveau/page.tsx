"use client";

export const dynamic = 'force-dynamic';

import { EnfantForm } from "@/components/enfants/enfant-form";

export default function NouveauEnfantPage() {
  return <EnfantForm mode="create" />;
}
