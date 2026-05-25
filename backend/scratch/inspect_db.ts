import { prisma } from "../src/config/prisma.js";

async function main() {
  console.log("=== USERS ===");
  const users = await prisma.user.findMany();
  console.dir(users, { depth: null });

  console.log("\n=== ACCOUNTS ===");
  const accounts = await prisma.account.findMany();
  console.dir(accounts, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
