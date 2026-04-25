import { prisma } from './seeders/prisma-client.js';
import { hash } from 'bcrypt';
import { AdminRole, BlogPostStatus, EventType } from '@prisma/client';

const hashPassword = async (password: string): Promise<string> => hash(password, 12);

async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. ADMIN USERS ────────────────────────────────────────────────────────────
  const ownerHash = await hashPassword('Demo@123456');
  const managerHash = await hashPassword('Demo@123456');
  const staffHash = await hashPassword('Demo@123456');

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

  const manager = await prisma.adminUser.upsert({
    where: { email: 'manager@phoconcept.com' },
    update: { passwordHash: managerHash },
    create: {
      email: 'manager@phoconcept.com',
      passwordHash: managerHash,
      name: 'Lisa Tran',
      role: AdminRole.manager,
      isActive: true,
    },
  });

  await prisma.adminUser.upsert({
    where: { email: 'staff@phoconcept.com' },
    update: { passwordHash: staffHash },
    create: {
      email: 'staff@phoconcept.com',
      passwordHash: staffHash,
      name: 'Kevin Nguyen',
      role: AdminRole.staff,
      isActive: true,
    },
  });

  console.log(`✅ Admin users: owner, manager, staff (password: Demo@123456)`);

  // ── 2. LOCATION ───────────────────────────────────────────────────────────────
  const location = await prisma.location.upsert({
    where: { slug: 'las-vegas-spring-mountain' },
    update: {},
    create: {
      slug: 'las-vegas-spring-mountain',
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
  console.log(`✅ Location: ${location.name} (id=${location.id})`);

  // ── 3. BUSINESS HOURS ─────────────────────────────────────────────────────────
  const hours = [
    { dayOfWeek: 0, openTime: '10:00', closeTime: '21:00', isOpen: true },  // Sun
    { dayOfWeek: 1, openTime: '10:00', closeTime: '21:00', isOpen: true },  // Mon
    { dayOfWeek: 2, openTime: '10:00', closeTime: '21:00', isOpen: true },  // Tue
    { dayOfWeek: 3, openTime: '10:00', closeTime: '21:00', isOpen: true },  // Wed
    { dayOfWeek: 4, openTime: '10:00', closeTime: '21:00', isOpen: true },  // Thu
    { dayOfWeek: 5, openTime: '10:00', closeTime: '22:00', isOpen: true },  // Fri
    { dayOfWeek: 6, openTime: '10:00', closeTime: '22:00', isOpen: true },  // Sat
  ];
  await prisma.locationHour.createMany({
    data: hours.map((h) => ({ locationId: location.id, ...h })),
    skipDuplicates: true,
  });
  console.log(`✅ Business hours: Mon–Thu 10:00–21:00, Fri–Sat 10:00–22:00`);

  // ── 4. RESERVATION SLOT CONFIG ────────────────────────────────────────────────
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
  console.log(`✅ Reservation slot config: 30min slots, max 20 guests/slot, book 1h–30d ahead`);

  // ── 5. MENU CATEGORIES ────────────────────────────────────────────────────────
  const categories = [
    { slug: 'pho', nameI18n: { en: 'Pho', vi: 'Phở' }, sortOrder: 1 },
    { slug: 'appetizers', nameI18n: { en: 'Appetizers', vi: 'Khai vị' }, sortOrder: 2 },
    { slug: 'rice-dishes', nameI18n: { en: 'Rice Dishes', vi: 'Cơm' }, sortOrder: 3 },
    { slug: 'vermicelli', nameI18n: { en: 'Vermicelli', vi: 'Bún' }, sortOrder: 4 },
    { slug: 'beverages', nameI18n: { en: 'Beverages', vi: 'Đồ uống' }, sortOrder: 5 },
    { slug: 'desserts', nameI18n: { en: 'Desserts', vi: 'Tráng miệng' }, sortOrder: 6 },
  ];

  const categoryMap: Record<string, bigint> = {};
  for (const cat of categories) {
    const c = await prisma.menuCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
    categoryMap[cat.slug] = c.id;
  }
  console.log(`✅ Menu categories: ${categories.length} categories`);

  // ── 6. MENU ITEMS + PRICES ────────────────────────────────────────────────────
  const menuItems = [
    // PHO
    {
      slug: 'pho-bo-dac-biet',
      categorySlug: 'pho',
      nameI18n: { en: 'Pho Bo Dac Biet (House Special Beef Pho)', vi: 'Phở Bò Đặc Biệt' },
      descriptionI18n: { en: 'Our signature beef broth with eye round, brisket, flank, tendon & tripe', vi: 'Nước dùng bò signature với tái, nạm, gầu, gân, sách' },
      isFeatured: true,
      sortOrder: 1,
      prices: [
        { sizeLabel: 'Small', price: 13.95 },
        { sizeLabel: 'Large', price: 16.95 },
      ],
    },
    {
      slug: 'pho-bo-tai',
      categorySlug: 'pho',
      nameI18n: { en: 'Pho Bo Tai (Rare Beef Pho)', vi: 'Phở Bò Tái' },
      descriptionI18n: { en: 'Classic beef broth with eye round steak', vi: 'Nước dùng bò truyền thống với thịt tái' },
      isFeatured: false,
      sortOrder: 2,
      prices: [
        { sizeLabel: 'Small', price: 12.95 },
        { sizeLabel: 'Large', price: 15.95 },
      ],
    },
    {
      slug: 'pho-ga',
      categorySlug: 'pho',
      nameI18n: { en: 'Pho Ga (Chicken Pho)', vi: 'Phở Gà' },
      descriptionI18n: { en: 'Light chicken broth with shredded chicken', vi: 'Nước dùng gà thanh nhẹ với thịt gà xé' },
      isFeatured: false,
      sortOrder: 3,
      prices: [
        { sizeLabel: 'Small', price: 12.95 },
        { sizeLabel: 'Large', price: 15.95 },
      ],
    },
    // APPETIZERS
    {
      slug: 'cha-gio',
      categorySlug: 'appetizers',
      nameI18n: { en: 'Cha Gio (Egg Rolls)', vi: 'Chả Giò' },
      descriptionI18n: { en: 'Crispy fried egg rolls with pork & vegetables, served with fish sauce', vi: 'Chả giò chiên giòn nhân thịt heo & rau, kèm nước mắm' },
      isFeatured: true,
      sortOrder: 1,
      prices: [{ sizeLabel: null, price: 7.95 }],
    },
    {
      slug: 'goi-cuon',
      categorySlug: 'appetizers',
      nameI18n: { en: 'Goi Cuon (Fresh Spring Rolls)', vi: 'Gỏi Cuốn' },
      descriptionI18n: { en: 'Fresh rice paper rolls with shrimp, pork, vermicelli & herbs', vi: 'Gỏi cuốn tôm thịt với bún và rau thơm' },
      isFeatured: false,
      sortOrder: 2,
      prices: [{ sizeLabel: null, price: 8.95 }],
    },
    // RICE DISHES
    {
      slug: 'com-tam-suon-bi-cha',
      categorySlug: 'rice-dishes',
      nameI18n: { en: 'Com Tam Suon Bi Cha (Broken Rice)', vi: 'Cơm Tấm Sườn Bì Chả' },
      descriptionI18n: { en: 'Broken rice with grilled pork chop, shredded pork skin & steamed egg meatloaf', vi: 'Cơm tấm sườn nướng, bì, chả' },
      isFeatured: true,
      sortOrder: 1,
      prices: [{ sizeLabel: null, price: 15.95 }],
    },
    // VERMICELLI
    {
      slug: 'bun-bo-hue',
      categorySlug: 'vermicelli',
      nameI18n: { en: 'Bun Bo Hue (Spicy Beef Noodle Soup)', vi: 'Bún Bò Huế' },
      descriptionI18n: { en: 'Spicy lemongrass beef broth with thick round noodles, beef shank & pork knuckle', vi: 'Nước dùng bò sả cay với bún tròn, bắp bò & giò heo' },
      isFeatured: true,
      sortOrder: 1,
      prices: [
        { sizeLabel: 'Small', price: 13.95 },
        { sizeLabel: 'Large', price: 16.95 },
      ],
    },
    {
      slug: 'bun-thit-nuong',
      categorySlug: 'vermicelli',
      nameI18n: { en: 'Bun Thit Nuong (Grilled Pork Vermicelli)', vi: 'Bún Thịt Nướng' },
      descriptionI18n: { en: 'Vermicelli bowl with grilled pork, fresh herbs, cucumber & fish sauce', vi: 'Bún thịt nướng với rau thơm, dưa leo & nước mắm' },
      isFeatured: false,
      sortOrder: 2,
      prices: [{ sizeLabel: null, price: 14.95 }],
    },
    // BEVERAGES
    {
      slug: 'ca-phe-sua-da',
      categorySlug: 'beverages',
      nameI18n: { en: 'Vietnamese Iced Coffee (Ca Phe Sua Da)', vi: 'Cà Phê Sữa Đá' },
      descriptionI18n: { en: 'Strong drip coffee with sweetened condensed milk over ice', vi: 'Cà phê phin đậm với sữa đặc và đá' },
      isFeatured: true,
      sortOrder: 1,
      prices: [{ sizeLabel: null, price: 5.95 }],
    },
    {
      slug: 'nuoc-mia',
      categorySlug: 'beverages',
      nameI18n: { en: 'Sugarcane Juice (Nuoc Mia)', vi: 'Nước Mía' },
      descriptionI18n: { en: 'Freshly pressed sugarcane juice', vi: 'Nước mía ép tươi' },
      isFeatured: false,
      sortOrder: 2,
      prices: [{ sizeLabel: null, price: 4.95 }],
    },
    // DESSERTS
    {
      slug: 'che-ba-mau',
      categorySlug: 'desserts',
      nameI18n: { en: 'Che Ba Mau (Three Color Dessert)', vi: 'Chè Ba Màu' },
      descriptionI18n: { en: 'Layered dessert with mung bean, red beans & pandan jelly in coconut milk', vi: 'Chè đậu xanh, đậu đỏ, thạch lá dứa với nước cốt dừa' },
      isFeatured: false,
      sortOrder: 1,
      prices: [{ sizeLabel: null, price: 6.95 }],
    },
  ];

  for (const item of menuItems) {
    const { prices, categorySlug, ...itemData } = item;
    const menuItem = await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        ...itemData,
        categoryId: categoryMap[categorySlug]!,
        isActive: true,
      },
    });

    for (const p of prices) {
      await prisma.menuItemPrice.upsert({
        where: {
          menuItemId_locationId_sizeLabel: {
            menuItemId: menuItem.id,
            locationId: location.id,
            sizeLabel: p.sizeLabel ?? '',
          },
        },
        update: {},
        create: {
          menuItemId: menuItem.id,
          locationId: location.id,
          sizeLabel: p.sizeLabel,
          price: p.price,
          isActive: true,
        },
      });
    }
  }
  console.log(`✅ Menu items: ${menuItems.length} items with prices`);

  // ── 7. CMS PAGES ──────────────────────────────────────────────────────────────
  const cmsPages = [
    {
      slug: 'home',
      titleI18n: { en: 'Pho Concept Las Vegas — Authentic Vietnamese Cuisine', vi: 'Pho Concept Las Vegas — Ẩm Thực Việt Nam' },
      metaDescriptionI18n: { en: 'Experience authentic Vietnamese pho and cuisine at Pho Concept Las Vegas on Spring Mountain Rd.', vi: 'Trải nghiệm phở Việt Nam authentic tại Pho Concept Las Vegas.' },
      sections: [
        { type: 'hero', heading: { en: 'Authentic Vietnamese Pho', vi: 'Phở Việt Nam Authentic' }, subheading: { en: "Las Vegas Strip's favorite Vietnamese restaurant", vi: 'Nhà hàng Việt Nam yêu thích tại Las Vegas' } },
        { type: 'featured_menu', title: { en: 'Our Signature Dishes', vi: 'Món Đặc Trưng' } },
        { type: 'cta_reservation', title: { en: 'Reserve a Table', vi: 'Đặt Bàn' } },
      ],
      isPublished: true,
    },
    {
      slug: 'about',
      titleI18n: { en: 'About Pho Concept', vi: 'Về Chúng Tôi' },
      metaDescriptionI18n: { en: 'Learn about Pho Concept\'s story, our chefs, and our commitment to authentic Vietnamese flavors.', vi: 'Câu chuyện về Pho Concept và cam kết mang đến hương vị Việt Nam authentic.' },
      sections: [
        { type: 'text', heading: { en: 'Our Story', vi: 'Câu Chuyện Của Chúng Tôi' }, body: { en: 'Founded in Las Vegas, Pho Concept brings the rich traditions of Vietnamese cuisine to the heart of Nevada.', vi: 'Được thành lập tại Las Vegas, Pho Concept mang truyền thống ẩm thực Việt Nam đến trái tim Nevada.' } },
      ],
      isPublished: true,
    },
    {
      slug: 'catering',
      titleI18n: { en: 'Catering Services', vi: 'Dịch Vụ Tiệc' },
      metaDescriptionI18n: { en: 'Book Pho Concept for your next event. We offer catering for corporate events, weddings, and private parties.', vi: 'Đặt Pho Concept cho sự kiện của bạn.' },
      sections: [
        { type: 'text', heading: { en: 'Let Us Cater Your Event', vi: 'Để Chúng Tôi Phục Vụ Sự Kiện Của Bạn' }, body: { en: 'From intimate gatherings to large celebrations, our catering packages are designed to impress.', vi: 'Từ tiệc nhỏ đến sự kiện lớn, chúng tôi có gói phù hợp cho bạn.' } },
        { type: 'packages' },
      ],
      isPublished: true,
    },
  ];

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log(`✅ CMS pages: ${cmsPages.length} pages (home, about, catering)`);

  // ── 8. BLOG POSTS ─────────────────────────────────────────────────────────────
  const blogPosts = [
    {
      slug: 'welcome-to-pho-concept',
      titleI18n: { en: 'Welcome to Pho Concept Las Vegas', vi: 'Chào Mừng Đến Pho Concept Las Vegas' },
      contentI18n: { en: '<p>We are excited to bring authentic Vietnamese pho and cuisine to Las Vegas. Our chefs use traditional recipes passed down through generations, combined with the finest local ingredients.</p>', vi: '<p>Chúng tôi hân hạnh mang ẩm thực Việt Nam authentic đến Las Vegas.</p>' },
      excerptI18n: { en: 'Discover the authentic taste of Vietnam in the heart of Las Vegas.', vi: 'Khám phá hương vị Việt Nam tại Las Vegas.' },
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date('2026-01-15'),
    },
    {
      slug: 'art-of-pho-broth',
      titleI18n: { en: 'The Art of Pho Broth: 24-Hour Slow Cook', vi: 'Nghệ Thuật Nấu Nước Dùng Phở: Hầm 24 Giờ' },
      contentI18n: { en: '<p>Our pho broth is the result of 24 hours of slow-simmering beef bones, star anise, cinnamon, and other aromatic spices. This patient process extracts the deep, complex flavors that make our pho truly special.</p>', vi: '<p>Nước dùng phở của chúng tôi được hầm 24 giờ từ xương bò với hồi, quế và các gia vị thơm.</p>' },
      excerptI18n: { en: 'Learn the secret behind our 24-hour slow-cooked pho broth.', vi: 'Bí quyết nước dùng phở hầm 24 giờ của chúng tôi.' },
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date('2026-02-10'),
    },
    {
      slug: 'spring-menu-2026',
      titleI18n: { en: 'Spring 2026 Menu Updates', vi: 'Thực Đơn Mùa Xuân 2026' },
      contentI18n: { en: '<p>We are thrilled to announce our Spring 2026 menu additions featuring seasonal Vietnamese dishes with fresh local produce.</p>', vi: '<p>Chúng tôi vui mừng giới thiệu thực đơn mùa xuân 2026 với các món Việt Nam theo mùa.</p>' },
      excerptI18n: { en: 'Exciting new seasonal dishes added to our Spring 2026 menu.', vi: 'Các món mới theo mùa xuân 2026.' },
      status: BlogPostStatus.DRAFT,
      publishedAt: null,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log(`✅ Blog posts: ${blogPosts.length} posts (2 published, 1 draft)`);

  // ── 9. EVENTS ─────────────────────────────────────────────────────────────────
  const events = [
    {
      titleI18n: { en: 'Lunar New Year Celebration', vi: 'Tết Nguyên Đán' },
      descriptionI18n: { en: 'Join us for a special Lunar New Year feast with traditional Vietnamese dishes and live music.', vi: 'Tham gia bữa tiệc Tết đặc biệt với các món ăn truyền thống và âm nhạc sống động.' },
      eventDate: new Date('2027-01-29'),
      eventEndDate: new Date('2027-01-30'),
      eventType: EventType.HOLIDAY,
      isFeatured: true,
      isActive: true,
    },
    {
      titleI18n: { en: 'Happy Hour — Weekdays 2PM–5PM', vi: 'Happy Hour — Ngày Thường 2PM–5PM' },
      descriptionI18n: { en: 'Enjoy 20% off all appetizers and beverages every weekday from 2PM to 5PM.', vi: 'Giảm 20% tất cả khai vị và đồ uống mỗi ngày thường từ 2PM đến 5PM.' },
      eventDate: new Date('2026-05-01'),
      eventEndDate: new Date('2026-12-31'),
      eventType: EventType.PROMOTION,
      isFeatured: true,
      isActive: true,
    },
    {
      titleI18n: { en: '3rd Anniversary Celebration', vi: 'Kỷ Niệm 3 Năm' },
      descriptionI18n: { en: 'Celebrate 3 years of Pho Concept with special menu items and giveaways.', vi: 'Kỷ niệm 3 năm Pho Concept với thực đơn đặc biệt và quà tặng.' },
      eventDate: new Date('2026-08-15'),
      eventEndDate: null,
      eventType: EventType.SPECIAL_EVENT,
      isFeatured: false,
      isActive: true,
    },
  ];

  for (const event of events) {
    await prisma.event.create({ data: event }).catch(() => {});
  }
  console.log(`✅ Events: ${events.length} events`);

  // ── 10. CATERING PACKAGES ─────────────────────────────────────────────────────
  const packages = [
    {
      name: 'Package S — Small Gathering',
      descriptionI18n: { en: 'Perfect for intimate gatherings of 10–30 guests', vi: 'Phù hợp cho buổi tụ họp nhỏ 10–30 khách' },
      minGuests: 10,
      maxGuests: 30,
      basePrice: 45.0,
      includesI18n: {
        en: ['Pho Bar (2 proteins)', 'Spring Rolls', 'Non-alcoholic Beverages', 'Serving Staff (2hrs)'],
        vi: ['Bàn phở (2 loại thịt)', 'Chả giò', 'Đồ uống không cồn', 'Nhân viên phục vụ (2 giờ)'],
      },
      sortOrder: 1,
    },
    {
      name: 'Package M — Medium Event',
      descriptionI18n: { en: 'Ideal for corporate events and parties of 30–60 guests', vi: 'Lý tưởng cho sự kiện công ty 30–60 khách' },
      minGuests: 30,
      maxGuests: 60,
      basePrice: 40.0,
      includesI18n: {
        en: ['Pho Bar (3 proteins)', 'Spring Rolls', 'Banh Mi Station', 'Non-alcoholic Beverages', 'Dessert', 'Serving Staff (3hrs)'],
        vi: ['Bàn phở (3 loại thịt)', 'Chả giò', 'Bàn bánh mì', 'Đồ uống không cồn', 'Tráng miệng', 'Nhân viên phục vụ (3 giờ)'],
      },
      sortOrder: 2,
    },
    {
      name: 'Package L — Large Celebration',
      descriptionI18n: { en: 'Full-service catering for large celebrations of 60–150 guests', vi: 'Dịch vụ đầy đủ cho sự kiện lớn 60–150 khách' },
      minGuests: 60,
      maxGuests: 150,
      basePrice: 35.0,
      includesI18n: {
        en: ['Pho Bar (4 proteins)', 'Spring Rolls', 'Banh Mi Station', 'Com Tam Station', 'Full Beverage Bar', 'Dessert', 'Dedicated Staff (5hrs)'],
        vi: ['Bàn phở (4 loại thịt)', 'Chả giò', 'Bàn bánh mì', 'Bàn cơm tấm', 'Quầy bar đầy đủ', 'Tráng miệng', 'Nhân viên riêng (5 giờ)'],
      },
      sortOrder: 3,
    },
  ];

  for (const pkg of packages) {
    await prisma.cateringPackage.upsert({
      where: { name: pkg.name },
      update: {},
      create: { ...pkg, isActive: true },
    });
  }
  console.log(`✅ Catering packages: ${packages.length} packages (S/M/L)`);

  // ── 11. SAMPLE CUSTOMER ───────────────────────────────────────────────────────
  const customerHash = await hashPassword('Demo@123456');
  const customer = await prisma.customer.upsert({
    where: { email: 'demo@customer.com' },
    update: { passwordHash: customerHash },
    create: {
      email: 'demo@customer.com',
      passwordHash: customerHash,
      name: 'Demo Customer',
      phone: '+17025559999',
      isActive: true,
    },
  });
  console.log(`✅ Sample customer: ${customer.email} (password: Demo@123456)`);

  // ── 12. SAMPLE RESERVATION (CONFIRMED) ───────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  await prisma.reservation.upsert({
    where: { token: 'demo-reservation-token-001' },
    update: {},
    create: {
      token: 'demo-reservation-token-001',
      locationId: location.id,
      guestName: 'John Demo',
      guestEmail: 'john.demo@example.com',
      guestPhone: '+17025551111',
      partySize: 4,
      reservationDate: new Date(`${tomorrowStr}T00:00:00`),
      reservationTime: '18:00',
      specialRequest: 'Birthday celebration — window seat preferred',
      status: 'CONFIRMED',
      createdByAdminId: manager.id,
    },
  });
  console.log(`✅ Sample reservation: CONFIRMED for ${tomorrowStr} at 18:00`);

  // ── 13. SAMPLE CATERING INQUIRY ───────────────────────────────────────────────
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 30);

  await prisma.cateringRequest.upsert({
    where: { token: 'demo-catering-token-001' },
    update: {},
    create: {
      token: 'demo-catering-token-001',
      locationId: location.id,
      contactName: 'Sarah Johnson',
      contactEmail: 'sarah.j@example.com',
      contactPhone: '+17025552222',
      eventDate,
      eventTime: '18:00',
      guestCount: 45,
      venue: 'Summerlin Community Center',
      specialRequest: 'Corporate team dinner, vegetarian options needed',
      status: 'INQUIRY',
    },
  });
  console.log(`✅ Sample catering inquiry: INQUIRY status, 45 guests`);

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin Owner:   owner@phoconcept.com   / Demo@123456');
  console.log('   Admin Manager: manager@phoconcept.com / Demo@123456');
  console.log('   Admin Staff:   staff@phoconcept.com   / Demo@123456');
  console.log('   Customer:      demo@customer.com      / Demo@123456');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
