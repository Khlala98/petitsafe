// PetitSafe — Seed script
// Les données réalistes seront ajoutées en Phase 7.
// Ce fichier est un placeholder pour que `prisma db seed` ne plante pas.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed PetitSafe — placeholder Phase 0");
  console.log("Les données réalistes seront injectées en Phase 7.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
