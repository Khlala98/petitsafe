"use server";

import { prisma } from "@/lib/supabase/prisma";
import { demandeDemoSchema } from "@/lib/schemas/demo";

export async function creerDemandeDemo(formData: {
  nom: string;
  email: string;
  telephone: string;
  type_structure: string;
  nombre_structures: string;
}) {
  try {
    const parsed = demandeDemoSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false as const, error: "Données invalides. Vérifiez le formulaire." };
    }

    const demande = await prisma.demandeDemo.create({
      data: {
        nom: parsed.data.nom,
        email: parsed.data.email,
        telephone: parsed.data.telephone,
        type_structure: parsed.data.type_structure,
        nombre_structures: parsed.data.nombre_structures,
      },
    });

    return { success: true as const, data: { id: demande.id } };
  } catch {
    return { success: false as const, error: "Erreur lors de l'envoi. Réessayez." };
  }
}
