import { prisma } from "@/lib/supabase/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, typeStructure, nomStructure } = await request.json();

    if (!userId || !typeStructure || !nomStructure) {
      return NextResponse.json(
        { error: "Données manquantes." },
        { status: 400 }
      );
    }

    const structure = await prisma.structure.create({
      data: {
        nom: nomStructure,
        type: typeStructure,
      },
    });

    await prisma.userStructure.create({
      data: {
        user_id: userId,
        structure_id: structure.id,
        role: "GESTIONNAIRE",
      },
    });

    return NextResponse.json({ success: true, structureId: structure.id });
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la structure." },
      { status: 500 }
    );
  }
}
