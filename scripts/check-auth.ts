/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n═══ Tous les users auth + metadata ═══");
  const users: any = await prisma.$queryRawUnsafe(`
    SELECT id, email, raw_user_meta_data, raw_app_meta_data, created_at, last_sign_in_at
    FROM auth.users ORDER BY created_at DESC;
  `);
  users.forEach((u: any) => {
    console.log(`\n→ ${u.email} (${u.id})`);
    console.log(`  Créé : ${u.created_at}, dernière connexion : ${u.last_sign_in_at}`);
    console.log(`  user_meta : ${JSON.stringify(u.raw_user_meta_data)}`);
    console.log(`  app_meta  : ${JSON.stringify(u.raw_app_meta_data)}`);
  });

  console.log("\n═══ Anciennes migrations Prisma appliquées ═══");
  try {
    const migs: any = await prisma.$queryRawUnsafe(
      `SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY finished_at;`,
    );
    migs.forEach((m: any) => console.log(`  ${m.migration_name} | ${m.finished_at}`));
  } catch (e: any) {
    console.log("  (pas de table _prisma_migrations)", e?.message);
  }
}

main()
  .catch((e) => {
    console.error("ERREUR :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
