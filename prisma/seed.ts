import { prisma } from './seeders/prisma-client.js';
import { hash } from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> =>
  await hash(password, 12);

async function main() {
  console.log('🌱 Seeding database...');

  // ── OWNER account ────────────────────────────────────────────────────────────
  const ownerHash = await hashPassword('Demo@123456');
  const owner = await prisma.adminUser.upsert({
    where: { email: 'owner@phoconcept.com' },
    update: { passwordHash: ownerHash },
    create: {
      email: 'owner@phoconcept.com',
      passwordHash: ownerHash,
      name: 'Chris Hong',
      role: 'owner',
      isActive: true,
    },
  });
  console.log(`✅ Admin user: ${owner.email} (${owner.role})`);

  // ── Las Vegas location ────────────────────────────────────────────────────────
  const location = await prisma.location.upsert({
    where: { slug: 'las-vegas-001' },
    update: {},
    create: {
      slug: 'las-vegas-001',
      name: 'Pho Concept Las Vegas',
      address: '4745 Spring Mountain Rd',
      city: 'Las Vegas',
      state: 'NV',
      zip: '89102',
      phone: '+17025551234',
      email: 'lasvegas@phoconcept.com',
      timezone: 'America/Los_Angeles',
      isActive: true,
    },
  });
  console.log(`✅ Location: ${location.name}`);

  // ── Business hours (Mon–Sun) ──────────────────────────────────────────────────
  const hours = [
    { dayOfWeek: 0, openTime: '10:00', closeTime: '21:00', isOpen: true }, // Sun
    { dayOfWeek: 1, openTime: '10:00', closeTime: '21:00', isOpen: true }, // Mon
    { dayOfWeek: 2, openTime: '10:00', closeTime: '21:00', isOpen: true }, // Tue
    { dayOfWeek: 3, openTime: '10:00', closeTime: '21:00', isOpen: true }, // Wed
    { dayOfWeek: 4, openTime: '10:00', closeTime: '21:00', isOpen: true }, // Thu
    { dayOfWeek: 5, openTime: '10:00', closeTime: '22:00', isOpen: true }, // Fri
    { dayOfWeek: 6, openTime: '10:00', closeTime: '22:00', isOpen: true }, // Sat
  ];

  await prisma.locationHour.createMany({
    data: hours.map(h => ({ locationId: location.id, ...h })),
    skipDuplicates: true,
  });
  console.log(`✅ Location hours: 7 days`);

  console.log('🎉 Seed complete!');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(() => {
  void prisma.$disconnect();
});
