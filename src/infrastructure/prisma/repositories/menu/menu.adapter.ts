import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  MenuCategoryRepositoryPort,
  MenuItemRepositoryPort,
  MenuItemPriceRepositoryPort,
  CreateCategoryData,
  UpdateCategoryData,
  CreateMenuItemData,
  UpdateMenuItemData,
  MenuItemPriceData,
  PaginatedResult,
  PaginationParams,
} from '@domain/menu/ports/menu.repository.port';
import { MenuCategoryEntity, MenuItemEntity, MenuItemPriceEntity, I18nField } from '@domain/menu/entities/menu.entity';

function toI18n(raw: unknown): I18nField {
  if (raw && typeof raw === 'object' && 'en' in raw) {
    const obj = raw as Record<string, unknown>;
    return { en: String(obj.en ?? ''), vi: obj.vi ? String(obj.vi) : undefined };
  }
  return { en: '' };
}

function toI18nOrNull(raw: unknown): I18nField | null {
  if (!raw) return null;
  return toI18n(raw);
}

function toPrice(raw: unknown): number {
  return typeof raw === 'string' ? parseFloat(raw) : Number(raw);
}

@Injectable()
export class MenuCategoryAdapter implements MenuCategoryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(data: {
    id: bigint; slug: string; nameI18n: unknown; sortOrder: number;
    isActive: boolean; createdAt: Date; updatedAt: Date;
    items?: Array<{
      id: bigint; categoryId: bigint; slug: string; nameI18n: unknown;
      descriptionI18n: unknown; imageUrl: string | null; isFeatured: boolean;
      isActive: boolean; sortOrder: number; deletedAt: Date | null;
      createdAt: Date; updatedAt: Date;
      prices?: Array<{ id: bigint; menuItemId: bigint; locationId: bigint; sizeLabel: string | null; price: unknown; isActive: boolean; createdAt: Date; updatedAt: Date }>;
    }>;
  }): MenuCategoryEntity {
    return MenuCategoryEntity.reconstitute({
      id: data.id,
      slug: data.slug,
      nameI18n: toI18n(data.nameI18n),
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      items: data.items?.map((item) =>
        MenuItemEntity.reconstitute({
          id: item.id,
          categoryId: item.categoryId,
          slug: item.slug,
          nameI18n: toI18n(item.nameI18n),
          descriptionI18n: toI18nOrNull(item.descriptionI18n),
          imageUrl: item.imageUrl,
          isFeatured: item.isFeatured,
          isActive: item.isActive,
          sortOrder: item.sortOrder,
          deletedAt: item.deletedAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          prices: item.prices?.map((p) =>
            MenuItemPriceEntity.reconstitute({
              id: p.id, menuItemId: p.menuItemId, locationId: p.locationId,
              sizeLabel: p.sizeLabel, price: toPrice(p.price),
              isActive: p.isActive, createdAt: p.createdAt, updatedAt: p.updatedAt,
            }),
          ),
        }),
      ),
    });
  }

  async findAll(params?: PaginationParams & { isActive?: boolean }): Promise<PaginatedResult<MenuCategoryEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (params?.isActive !== undefined) where.isActive = params.isActive;

    const [categories, total] = await Promise.all([
      this.prisma.menuCategory.findMany({
        where,
        include: {
          items: {
            where: { deletedAt: null },
            include: { prices: { where: { isActive: true } } },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.menuCategory.count({ where }),
    ]);

    return { data: categories.map((c) => this.map(c)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: bigint): Promise<MenuCategoryEntity | null> {
    const c = await this.prisma.menuCategory.findUnique({
      where: { id },
      include: {
        items: { where: { deletedAt: null }, include: { prices: { where: { isActive: true } } }, orderBy: { sortOrder: 'asc' } },
      },
    });
    return c ? this.map(c) : null;
  }

  async findBySlug(slug: string): Promise<MenuCategoryEntity | null> {
    const c = await this.prisma.menuCategory.findUnique({
      where: { slug },
      include: {
        items: { where: { deletedAt: null }, include: { prices: { where: { isActive: true } } }, orderBy: { sortOrder: 'asc' } },
      },
    });
    return c ? this.map(c) : null;
  }

  async create(data: CreateCategoryData): Promise<MenuCategoryEntity> {
    const c = await this.prisma.menuCategory.create({
      data: {
        slug: data.slug,
        nameI18n: data.nameI18n as unknown as Prisma.InputJsonValue,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    return this.map(c);
  }

  async update(id: bigint, data: UpdateCategoryData): Promise<MenuCategoryEntity> {
    const updateData: Prisma.MenuCategoryUncheckedUpdateInput = {};
    if (data.nameI18n !== undefined) updateData.nameI18n = data.nameI18n as unknown as Prisma.InputJsonValue;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    const c = await this.prisma.menuCategory.update({ where: { id }, data: updateData });
    return this.map(c);
  }

  async toggle(id: bigint, isActive: boolean): Promise<MenuCategoryEntity> {
    const c = await this.prisma.menuCategory.update({ where: { id }, data: { isActive } });
    return this.map(c);
  }

  async softDelete(id: bigint): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.menuItem.updateMany({ where: { categoryId: id }, data: { deletedAt: new Date() } }),
      this.prisma.menuCategory.update({ where: { id }, data: { isActive: false } }),
    ]);
  }
}

@Injectable()
export class MenuItemAdapter implements MenuItemRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(data: {
    id: bigint; categoryId: bigint; slug: string; nameI18n: unknown;
    descriptionI18n: unknown; imageUrl: string | null; isFeatured: boolean;
    isActive: boolean; sortOrder: number; deletedAt: Date | null;
    createdAt: Date; updatedAt: Date;
    prices?: Array<{ id: bigint; menuItemId: bigint; locationId: bigint; sizeLabel: string | null; price: unknown; isActive: boolean; createdAt: Date; updatedAt: Date }>;
  }): MenuItemEntity {
    return MenuItemEntity.reconstitute({
      id: data.id,
      categoryId: data.categoryId,
      slug: data.slug,
      nameI18n: toI18n(data.nameI18n),
      descriptionI18n: toI18nOrNull(data.descriptionI18n),
      imageUrl: data.imageUrl,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      deletedAt: data.deletedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      prices: data.prices?.map((p) =>
        MenuItemPriceEntity.reconstitute({
          id: p.id, menuItemId: p.menuItemId, locationId: p.locationId,
          sizeLabel: p.sizeLabel, price: toPrice(p.price),
          isActive: p.isActive, createdAt: p.createdAt, updatedAt: p.updatedAt,
        }),
      ),
    });
  }

  async findAll(params?: PaginationParams & { categoryId?: bigint; locationId?: bigint; isActive?: boolean; isFeatured?: boolean }): Promise<PaginatedResult<MenuItemEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (params?.categoryId) where.categoryId = params.categoryId;
    if (params?.isActive !== undefined) where.isActive = params.isActive;
    if (params?.isFeatured !== undefined) where.isFeatured = params.isFeatured;

    const priceWhere = params?.locationId
      ? { locationId: params.locationId, isActive: true }
      : { isActive: true };

    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        include: { prices: { where: priceWhere } },
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    return { data: items.map((i) => this.map(i)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: bigint): Promise<MenuItemEntity | null> {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { prices: { where: { isActive: true } } },
    });
    if (!item || item.deletedAt) return null;
    return this.map(item);
  }

  async findBySlug(slug: string): Promise<MenuItemEntity | null> {
    const item = await this.prisma.menuItem.findUnique({
      where: { slug },
      include: { prices: { where: { isActive: true } } },
    });
    if (!item || item.deletedAt) return null;
    return this.map(item);
  }

  async create(data: CreateMenuItemData): Promise<MenuItemEntity> {
    const item = await this.prisma.menuItem.create({
      data: {
        categoryId: data.categoryId,
        slug: data.slug,
        nameI18n: data.nameI18n as unknown as Prisma.InputJsonValue,
        descriptionI18n: data.descriptionI18n != null ? (data.descriptionI18n as unknown as Prisma.InputJsonValue) : undefined,
        imageUrl: data.imageUrl,
        isFeatured: data.isFeatured ?? false,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { prices: { where: { isActive: true } } },
    });
    return this.map(item);
  }

  async update(id: bigint, data: UpdateMenuItemData): Promise<MenuItemEntity> {
    const updateData: Prisma.MenuItemUncheckedUpdateInput = {};
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.nameI18n !== undefined) updateData.nameI18n = data.nameI18n as unknown as Prisma.InputJsonValue;
    if (data.descriptionI18n !== undefined) updateData.descriptionI18n = data.descriptionI18n != null ? (data.descriptionI18n as unknown as Prisma.InputJsonValue) : Prisma.DbNull;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    const item = await this.prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: { prices: { where: { isActive: true } } },
    });
    return this.map(item);
  }

  async softDelete(id: bigint): Promise<void> {
    await this.prisma.menuItem.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async toggle(id: bigint, isActive: boolean): Promise<MenuItemEntity> {
    const item = await this.prisma.menuItem.update({
      where: { id },
      data: { isActive },
      include: { prices: { where: { isActive: true } } },
    });
    return this.map(item);
  }
}

@Injectable()
export class MenuItemPriceAdapter implements MenuItemPriceRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(data: { id: bigint; menuItemId: bigint; locationId: bigint; sizeLabel: string | null; price: unknown; isActive: boolean; createdAt: Date; updatedAt: Date }): MenuItemPriceEntity {
    return MenuItemPriceEntity.reconstitute({
      id: data.id, menuItemId: data.menuItemId, locationId: data.locationId,
      sizeLabel: data.sizeLabel, price: toPrice(data.price),
      isActive: data.isActive, createdAt: data.createdAt, updatedAt: data.updatedAt,
    });
  }

  async findByMenuItemId(menuItemId: bigint): Promise<MenuItemPriceEntity[]> {
    const prices = await this.prisma.menuItemPrice.findMany({ where: { menuItemId } });
    return prices.map((p) => this.map(p));
  }

  async findByMenuItemAndLocation(menuItemId: bigint, locationId: bigint): Promise<MenuItemPriceEntity[]> {
    const prices = await this.prisma.menuItemPrice.findMany({ where: { menuItemId, locationId } });
    return prices.map((p) => this.map(p));
  }

  async upsert(menuItemId: bigint, locationId: bigint, prices: MenuItemPriceData[]): Promise<MenuItemPriceEntity[]> {
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.menuItemPrice.deleteMany({ where: { menuItemId, locationId } });
      if (prices.length === 0) return [];
      await tx.menuItemPrice.createMany({
        data: prices.map((p) => ({ menuItemId, locationId, sizeLabel: p.sizeLabel, price: p.price, isActive: p.isActive ?? true })),
      });
      return tx.menuItemPrice.findMany({ where: { menuItemId, locationId } });
    });
    return result.map((p) => this.map(p));
  }

  async toggle(id: bigint, isActive: boolean): Promise<void> {
    await this.prisma.menuItemPrice.update({ where: { id }, data: { isActive } });
  }
}
