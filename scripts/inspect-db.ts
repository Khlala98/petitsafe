/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n═══ DATABASE_URL ═══");
  console.log(process.env.DATABASE_URL?.replace(/:[^@:]+@/, ":***@"));
  console.log("DIRECT_URL:", process.env.DIRECT_URL?.replace(/:[^@:]+@/, ":***@"));

  console.log("\n═══ Connection info ═══");
  const conn: any = await prisma.$queryRawUnsafe(`
    SELECT current_database() as db, current_user as usr, current_schema() as schema, version() as version;
  `);
  console.log(JSON.stringify(conn, null, 2));

  console.log("\n═══ All schemas ═══");
  const schemas: any = await prisma.$queryRawUnsafe(
    `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');`,
  );
  console.log(JSON.stringify(schemas, null, 2));

  console.log("\n═══ Tables in public ═══");
  const tables: any = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`,
  );
  console.log(JSON.stringify(tables, null, 2));

  console.log("\n═══ Auth users count (if accessible) ═══");
  try {
    const users: any = await prisma.$queryRawUnsafe(
      `SELECT count(*) as count FROM auth.users;`,
    );
    console.log("auth.users count:", users[0]?.count);
    const sample: any = await prisma.$queryRawUnsafe(
      `SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;`,
    );
    console.log("Recent users:", JSON.stringify(sample, null, 2));
  } catch (e: any) {
    console.log("Cannot read auth.users:", e?.message);
  }

  console.log("\n═══ All Structure rows (raw) ═══");
  const allStr: any = await prisma.$queryRawUnsafe(`SELECT * FROM "Structure";`);
  console.log(`Found ${allStr.length} structure(s)`);
  console.log(JSON.stringify(allStr, null, 2));

  console.log("\n═══ All UserStructure rows ═══");
  const allUs: any = await prisma.$queryRawUnsafe(`SELECT * FROM "UserStructure";`);
  console.log(`Found ${allUs.length} user-structure(s)`);
  console.log(JSON.stringify(allUs, null, 2));

  console.log("\n═══ pg_stat (insertions/deletions historiques) ═══");
  const stats: any = await prisma.$queryRawUnsafe(`
    SELECT relname,
           n_tup_ins::text as inserts,
           n_tup_upd::text as updates,
           n_tup_del::text as deletes,
           n_live_tup::text as live_rows,
           n_dead_tup::text as dead_rows
    FROM pg_stat_user_tables
    WHERE relname IN ('Structure', 'UserStructure', 'Profil', 'Enfant', 'Biberon', 'Repas', 'Equipement')
    ORDER BY relname;
  `);
  console.log(JSON.stringify(stats, null, 2));
}

main()
  .catch((e) => {
    console.error("ERREUR :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
