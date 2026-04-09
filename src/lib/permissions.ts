import { prisma } from "@/lib/supabase/prisma";

export async function verifierAdmin(profilId: string): Promise<boolean> {
  const profil = await prisma.profil.findUnique({
    where: { id: profilId },
    select: { role: true, actif: true },
  });
  return profil?.actif === true && profil?.role === "ADMINISTRATEUR";
}

export async function verifierProprietaire(profilId: string, ressourceProfilId: string | null): Promise<boolean> {
  if (!ressourceProfilId) return false;
  return profilId === ressourceProfilId;
}

export async function verifierAdminOuProprietaire(profilId: string, ressourceProfilId: string | null): Promise<boolean> {
  if (await verifierAdmin(profilId)) return true;
  return verifierProprietaire(profilId, ressourceProfilId);
}
