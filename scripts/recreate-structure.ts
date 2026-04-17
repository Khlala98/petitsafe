/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const USER_ID = "28dbce0a-d101-4d4b-979a-7817440d3dc0"; // khalil.toumi03@gmail.com
const USER_EMAIL = "khalil.toumi03@gmail.com";
const STRUCTURE_NOM = "ezzzzee";
const STRUCTURE_TYPE = "MICRO_CRECHE" as const;
const ADMIN_PIN = "1234"; // PIN admin par défaut, à changer dans Paramètres

async function main() {
  console.log(`\n→ Vérification user auth ${USER_EMAIL}...`);
  const userCheck: any = await prisma.$queryRawUnsafe(
    `SELECT id, email FROM auth.users WHERE id = $1::uuid;`,
    USER_ID,
  );
  if (userCheck.length === 0) {
    throw new Error(`User ${USER_ID} introuvable dans auth.users`);
  }
  console.log(`  ✓ User trouvé : ${userCheck[0].email}`);

  console.log(`\n→ Vérification qu'aucune structure n'existe pour ce user...`);
  const existingLinks = await prisma.userStructure.findMany({ where: { user_id: USER_ID } });
  if (existingLinks.length > 0) {
    console.log(`  ⚠ ${existingLinks.length} lien(s) existant(s) trouvé(s), abandon :`);
    existingLinks.forEach((l) => console.log(`    - structure ${l.structure_id} role ${l.role}`));
    throw new Error("Le user a déjà des structures liées — rien fait.");
  }
  console.log("  ✓ Aucun lien existant");

  console.log(`\n→ Création de la structure "${STRUCTURE_NOM}" (${STRUCTURE_TYPE})...`);
  const structure = await prisma.structure.create({
    data: {
      nom: STRUCTURE_NOM,
      type: STRUCTURE_TYPE,
    },
  });
  console.log(`  ✓ Structure créée, id = ${structure.id}`);
  console.log(`    Modules par défaut : ${structure.modules_actifs.join(", ")}`);

  console.log(`\n→ Création du lien UserStructure (rôle GESTIONNAIRE)...`);
  const link = await prisma.userStructure.create({
    data: {
      user_id: USER_ID,
      structure_id: structure.id,
      role: "GESTIONNAIRE",
    },
  });
  console.log(`  ✓ Lien créé, id = ${link.id}`);

  console.log(`\n→ Création d'un Profil Administrateur par défaut (PIN ${ADMIN_PIN})...`);
  const pinHash = await hash(ADMIN_PIN, 10);
  const profil = await prisma.profil.create({
    data: {
      structure_id: structure.id,
      prenom: "Khalil",
      nom: "Toumi",
      poste: "Directrice",
      role: "ADMINISTRATEUR",
      email: USER_EMAIL,
      pin: pinHash,
      actif: true,
    },
  });
  console.log(`  ✓ Profil créé, id = ${profil.id}`);

  console.log("\n═══ TERMINÉ ═══");
  console.log(`Structure  : ${structure.nom} (${structure.id})`);
  console.log(`Liée à     : ${USER_EMAIL}`);
  console.log(`Profil     : ${profil.prenom} ${profil.nom} — PIN par défaut "${ADMIN_PIN}" (à changer dans Paramètres)`);
  console.log("\nReconnecte-toi sur l'app — tu devrais arriver sur le dashboard de la structure.");
}

main()
  .catch((e) => {
    console.error("\nERREUR :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
