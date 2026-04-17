/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n→ Restauration des GRANTS pour authenticated + service_role uniquement...");
  console.log("   (anon n'a PAS d'accès — l'app utilise des Server Actions côté serveur)");

  // USAGE sur le schema — sans ça rien ne fonctionne
  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO authenticated, service_role;`);
  console.log("  ✓ GRANT USAGE ON SCHEMA public");

  // Privilèges DML (lecture/écriture) sur toutes les tables existantes
  await prisma.$executeRawUnsafe(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;`,
  );
  console.log("  ✓ GRANT SELECT/INSERT/UPDATE/DELETE ON ALL TABLES");

  await prisma.$executeRawUnsafe(
    `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;`,
  );
  console.log("  ✓ GRANT USAGE/SELECT ON ALL SEQUENCES");

  // Defaults pour les futures tables (créées par ex. par Prisma)
  await prisma.$executeRawUnsafe(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;`,
  );
  console.log("  ✓ ALTER DEFAULT PRIVILEGES (futures tables)");

  // Demande à PostgREST de reload son cache de schema
  await prisma.$executeRawUnsafe(`NOTIFY pgrst, 'reload schema';`);
  console.log("  ✓ NOTIFY pgrst reload schema");

  console.log("\n→ Vérification des grants après restauration...");
  const grants: any = await prisma.$queryRawUnsafe(`
    SELECT grantee, table_name, count(*)::text as nb_privs
    FROM information_schema.role_table_grants
    WHERE table_schema='public'
      AND table_name IN ('Structure','UserStructure','Profil','Enfant','BoiteLait','PAI')
      AND grantee IN ('authenticated','service_role')
    GROUP BY grantee, table_name
    ORDER BY table_name, grantee;
  `);
  grants.forEach((g: any) => console.log(`  ${g.table_name.padEnd(20)} ${g.grantee.padEnd(15)} ${g.nb_privs} privilèges`));

  console.log("\n═══ TERMINÉ ═══");
  console.log("Reconnecte-toi sur la prod : la structure ezzzzee devrait s'afficher.");
}

main()
  .catch((e) => {
    console.error("ERREUR :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
