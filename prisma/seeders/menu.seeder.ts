import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface PriceData {
  sizeLabel: string | null;
  price: number;
  isActive: boolean;
}

interface MenuItemData {
  slug: string;
  nameI18n: Record<string, string>;
  descriptionI18n: Record<string, string> | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  prices: PriceData[];
}

interface CategoryData {
  slug: string;
  nameI18n: Record<string, string>;
  sortOrder: number;
  isActive: boolean;
  items: MenuItemData[];
}

interface MenuJson {
  data: CategoryData[];
}

export async function seedMenu(prisma: PrismaClient, locationId: bigint): Promise<void> {
  console.log('🍜 Seeding menu...');

  // ── Wipe existing menu data (order matters due to FK constraints) ──────────
  await prisma.menuItemPrice.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.menuCategory.deleteMany({});
  console.log('   🗑️  Cleared existing menu data');

  // ── Load menu.json ─────────────────────────────────────────────────────────
  const jsonPath = path.resolve(process.cwd(), 'prisma/seeders/menu.json');
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const menu: MenuJson = JSON.parse(raw);

  let totalItems = 0;
  let totalPrices = 0;

  for (const category of menu.data) {
    // Insert category
    const cat = await prisma.menuCategory.create({
      data: {
        slug: category.slug,
        nameI18n: category.nameI18n,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      },
    });

    // Insert items for this category
    for (const item of category.items) {
      const menuItem = await prisma.menuItem.create({
        data: {
          categoryId: cat.id,
          slug: item.slug,
          nameI18n: item.nameI18n,
          descriptionI18n: item.descriptionI18n ?? undefined,
          imageUrl: item.imageUrl,
          isFeatured: item.isFeatured,
          isActive: item.isActive,
          sortOrder: item.sortOrder,
        },
      });

      // Insert prices — map locationId from JSON to real DB locationId
      for (const price of item.prices) {
        await prisma.menuItemPrice.create({
          data: {
            menuItemId: menuItem.id,
            locationId,
            sizeLabel: price.sizeLabel,
            price: price.price,
            isActive: price.isActive,
          },
        });
        totalPrices++;
      }

      totalItems++;
    }

    console.log(`   ✅ ${category.nameI18n['en']}: ${category.items.length} items`);
  }

  console.log(`🍜 Menu seed complete: ${menu.data.length} categories, ${totalItems} items, ${totalPrices} prices`);
}
