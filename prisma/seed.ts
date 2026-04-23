import { prisma } from './seeders/prisma-client.js';
import { hash } from 'bcrypt';
import { AdminRole } from '@prisma/client';

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
      role: AdminRole.owner,
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

  // ── Reservation slot config ───────────────────────────────────────────────────
  await prisma.reservationSlotConfig.upsert({
    where: { locationId: location.id },
    update: {},
    create: {
      locationId: location.id,
      slotDuration: 30,
      maxGuestsPerSlot: 20,
      minAdvanceHours: 1,
      maxAdvanceDays: 30,
    },
  });
  console.log(`✅ Reservation slot config: 30min slots, max 20 guests`);

  // ── Catering packages ─────────────────────────────────────────────────────────
  const packages = [
    {
      name: 'Package S — Small Gathering',
      descriptionI18n: { en: 'Perfect for intimate gatherings', vi: 'Phù hợp cho buổi tụ họp nhỏ' },
      minGuests: 10, maxGuests: 30, basePrice: 45.00,
      includesI18n: {
        en: ['Pho Bar', 'Spring Rolls', 'Beverages'],
        vi: ['Bàn phở tự phục vụ', 'Chả giò', 'Đồ uống'],
      },
      sortOrder: 1,
    },
    {
      name: 'Package M — Medium Event',
      descriptionI18n: { en: 'Ideal for corporate events and parties', vi: 'Lý tưởng cho sự kiện công ty' },
      minGuests: 30, maxGuests: 60, basePrice: 40.00,
      includesI18n: {
        en: ['Pho Bar', 'Spring Rolls', 'Banh Mi Station', 'Beverages', 'Dessert'],
        vi: ['Bàn phở', 'Chả giò', 'Bánh mì', 'Đồ uống', 'Tráng miệng'],
      },
      sortOrder: 2,
    },
    {
      name: 'Package L — Large Celebration',
      descriptionI18n: { en: 'Full-service for large celebrations', vi: 'Dịch vụ đầy đủ cho sự kiện lớn' },
      minGuests: 60, maxGuests: 150, basePrice: 35.00,
      includesI18n: {
        en: ['Pho Bar', 'Spring Rolls', 'Banh Mi Station', 'Com Tam Station', 'Full Bar', 'Dessert', 'Staff Service'],
        vi: ['Bàn phở', 'Chả giò', 'Bánh mì', 'Bàn cơm tấm', 'Quầy bar', 'Tráng miệng', 'Nhân viên phục vụ'],
      },
      sortOrder: 3,
    },
  ];

  for (const pkg of packages) {
    await prisma.cateringPackage.upsert({
      where: { name: pkg.name },
      update: {},
      create: {
        ...pkg,
        isActive: true,
      },
    });
  }
  console.log(`✅ Catering packages: ${packages.length} packages seeded`);

  console.log('🎉 Seed complete!');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(() => {
  void prisma.$disconnect();
});
