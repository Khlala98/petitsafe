/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n═══ STRUCTURES ═══");
  const structures = await prisma.structure.findMany({
    select: { id: true, nom: true, type: true, created_at: true },
    orderBy: { created_at: "asc" },
  });
  console.log(`Total : ${structures.length}`);
  structures.forEach((s) => console.log(`  - ${s.id} | ${s.nom} | ${s.type} | ${s.created_at.toISOString()}`));

  console.log("\n═══ USER_STRUCTURES ═══");
  const userStructures = await prisma.userStructure.findMany({
    select: { id: true, user_id: true, structure_id: true, role: true },
  });
  console.log(`Total : ${userStructures.length}`);
  userStructures.forEach((us) =>
    console.log(`  - user=${us.user_id} | structure=${us.structure_id} | role=${us.role}`),
  );

  console.log("\n═══ PROFILS ═══");
  const profils = await prisma.profil.findMany({
    select: { id: true, structure_id: true, prenom: true, nom: true, role: true, actif: true },
  });
  console.log(`Total : ${profils.length}`);
  profils.forEach((p) =>
    console.log(`  - ${p.prenom} ${p.nom} (${p.role}) | structure=${p.structure_id} | actif=${p.actif}`),
  );

  console.log("\n═══ ENFANTS ═══");
  const enfants = await prisma.enfant.count();
  console.log(`Total : ${enfants}`);

  console.log("\n═══ NOUVELLES TABLES ═══");
  const counts = await Promise.all([
    prisma.boiteLait.count(),
    prisma.laitMaternel.count(),
    prisma.administrationMedicament.count(),
    prisma.pAI.count(),
  ]);
  console.log(`BoiteLait : ${counts[0]}`);
  console.log(`LaitMaternel : ${counts[1]}`);
  console.log(`AdministrationMedicament : ${counts[2]}`);
  console.log(`PAI : ${counts[3]}`);

  console.log("\n═══ CHECK RLS sur nouvelles tables ═══");
  const rls: any = await prisma.$queryRawUnsafe(`
    SELECT n.nspname, c.relname, c.relrowsecurity AS rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('Structure', 'UserStructure', 'Profil', 'Enfant', 'BoiteLait', 'LaitMaternel', 'AdministrationMedicament', 'PAI', 'Biberon')
    ORDER BY c.relname;
  `);
  rls.forEach((r: any) => console.log(`  ${r.relname.padEnd(30)} | RLS=${r.rls_enabled}`));

  console.log("\n═══ POLICIES sur Structure & UserStructure ═══");
  const policies: any = await prisma.$queryRawUnsafe(`
    SELECT schemaname, tablename, policyname, cmd, qual
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('Structure', 'UserStructure')
    ORDER BY tablename, policyname;
  `);
  if (policies.length === 0) console.log("  (aucune policy)");
  policies.forEach((p: any) => console.log(`  ${p.tablename}.${p.policyname} (${p.cmd}) :: ${p.qual}`));

  console.log("\n═══ ÉCHANTILLON Structure (raw SQL) ═══");
  const raw: any = await prisma.$queryRawUnsafe(
    `SELECT id, nom, type, capacite_accueil, modules_actifs FROM "Structure" LIMIT 5;`,
  );
  console.log(JSON.stringify(raw, null, 2));
}

main()
  .catch((e) => {
    console.error("ERREUR :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
