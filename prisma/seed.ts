import { prisma } from './seeders/prisma-client';

async function main() {
  console.log('🌱 Seeding database...\n');
  console.log('  → No seed data configured yet for Sprint 0 scaffold');
  console.log('\n✅ Seed completed!\n');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
