import { prisma } from './seeders/prisma-client.js';

async function main() {
  console.log('🌱 Seeding database...');
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
