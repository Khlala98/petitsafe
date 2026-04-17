/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Charge .env manuellement (tsx ne le fait pas)
const envContent = readFileSync(join(process.cwd(), ".env"), "utf-8");
envContent.split("\n").forEach((line) => {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
});

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const USER_ID = "28dbce0a-d101-4d4b-979a-7817440d3dc0";

async function main() {
  console.log("\n═══ 1. État Prisma direct (postgres role, bypass RLS) ═══");
  const structures = await prisma.structure.findMany({
    select: { id: true, nom: true, type: true },
  });
  const userStructures = await prisma.userStructure.findMany();
  console.log(`Structures : ${structures.length}`, structures);
  console.log(`UserStructures : ${userStructures.length}`, userStructures);

  console.log("\n═══ 2. Match strict du user_id (text=text) ═══");
  const matchByUid: any = await prisma.$queryRawUnsafe(
    `SELECT us.*, s.nom as structure_nom
     FROM "UserStructure" us
     JOIN "Structure" s ON s.id = us.structure_id
     WHERE us.user_id = $1;`,
    USER_ID,
  );
  console.log(`Match user_id=${USER_ID} :`, matchByUid);

  console.log("\n═══ 3. Vérifie type de la colonne user_id ═══");
  const col: any = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='UserStructure';
  `);
  console.log(JSON.stringify(col, null, 2));

  console.log("\n═══ 4. Permissions sur Structure / UserStructure pour anon/authenticated ═══");
  const grants: any = await prisma.$queryRawUnsafe(`
    SELECT grantee, table_name, privilege_type
    FROM information_schema.role_table_grants
    WHERE table_schema='public'
      AND table_name IN ('Structure','UserStructure','Profil','Enfant','BoiteLait','LaitMaternel','AdministrationMedicament','PAI','Biberon')
      AND grantee IN ('anon','authenticated','postgres','service_role')
    ORDER BY table_name, grantee, privilege_type;
  `);
  const map: Record<string, Record<string, string[]>> = {};
  grants.forEach((g: any) => {
    map[g.table_name] = map[g.table_name] || {};
    map[g.table_name][g.grantee] = map[g.table_name][g.grantee] || [];
    map[g.table_name][g.grantee].push(g.privilege_type);
  });
  Object.entries(map).forEach(([t, roles]) => {
    console.log(`\n  ${t}:`);
    Object.entries(roles).forEach(([r, privs]) => console.log(`    ${r.padEnd(15)} → ${privs.join(", ")}`));
  });

  console.log("\n═══ 5. Test via Supabase REST avec anon (comme le browser) ═══");
  const sb = createClient(SUPABASE_URL, ANON_KEY);
  // simule comme si non-loggé d'abord
  const { data: anonData, error: anonErr } = await sb
    .from("UserStructure")
    .select("id, structure_id, role, structure:Structure(id, nom, type, modules_actifs)")
    .eq("user_id", USER_ID);
  console.log(`Anon query : data=${anonData?.length ?? 0}, error=`, anonErr);

  console.log("\n═══ 6. Test via Supabase REST avec service_role ═══");
  const sbAdmin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: svcData, error: svcErr } = await sbAdmin
    .from("UserStructure")
    .select("id, structure_id, role, structure:Structure(id, nom, type, modules_actifs)")
    .eq("user_id", USER_ID);
  console.log(`Service role query : data=${svcData?.length ?? 0}, error=`, svcErr);
  if (svcData && svcData.length > 0) console.log(JSON.stringify(svcData, null, 2));

  console.log("\n═══ 7. Simulation requête authenticated (JWT signé localement) ═══");
  // Génère un token de test (impersonation via service_role)
  const sbImpersonate = createClient(SUPABASE_URL, SERVICE_KEY, {
    global: {
      headers: {
        // PostgREST acceptera ce header avec service_role mais on veut tester authenticated
      },
    },
  });
  const { data: authData, error: authErr } = await sbImpersonate
    .from("UserStructure")
    .select("id, structure_id, role, structure:Structure(id, nom, type, modules_actifs)")
    .eq("user_id", USER_ID);
  console.log(`Test query : data=${authData?.length ?? 0}, error=`, authErr);
  if (authData && authData.length > 0) console.log(JSON.stringify(authData, null, 2));
}

main()
  .catch((e) => {
    console.error("ERREUR :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
