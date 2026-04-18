import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
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
import { MenuCategoryEntity, MenuItemEntity, MenuItemPriceEntity } from '@domain/menu/entities/menu.entity';

@Injectable()
export class MenuCategoryAdapter implements MenuCategoryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: {
    id: bigint;
    name: string;
    nameVi: string | null;
    slug: string;
    description: string | null;
    descriptionVi: string | null;
    imageUrl: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    items?: Array<{
      id: bigint;
      categoryId: bigint;
      name: string;
      nameVi: string | null;
      slug: string;
      description: string | null;
      descriptionVi: string | null;
      imageUrl: string | null;
      isFeatured: boolean;
      isActive: boolean;
      sortOrder: number;
      deletedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      prices?: Array<{
        id: bigint;
        menuItemId: bigint;
        locationId: bigint;
        sizeLabel: string | null;
        price: unknown;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      }>;
    }>;
  }): MenuCategoryEntity {
    return MenuCategoryEntity.reconstitute({
      id: data.id,
      name: data.name,
      nameVi: data.nameVi,
      slug: data.slug,
      description: data.description,
      descriptionVi: data.descriptionVi,
      imageUrl: data.imageUrl,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      items: data.items?.map((item) =>
        MenuItemEntity.reconstitute({
          id: item.id,
          categoryId: item.categoryId,
          name: item.name,
          nameVi: item.nameVi,
          slug: item.slug,
          description: item.description,
          descriptionVi: item.descriptionVi,
          imageUrl: item.imageUrl,
          isFeatured: item.isFeatured,
          isActive: item.isActive,
          sortOrder: item.sortOrder,
          deletedAt: item.deletedAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          prices: item.prices?.map((p) =>
            MenuItemPriceEntity.reconstitute({
              id: p.id,
              menuItemId: p.menuItemId,
              locationId: p.locationId,
              sizeLabel: p.sizeLabel,
              price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price),
              isActive: p.isActive,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
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
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [categories, total] = await Promise.all([
      this.prisma.menuCategory.findMany({
        where,
        include: {
          items: {
            where: { deletedAt: null },
            include: {
              prices: { where: { isActive: true } },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.menuCategory.count({ where }),
    ]);

    return {
      data: categories.map((c) => this.mapToEntity(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: bigint): Promise<MenuCategoryEntity | null> {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id },
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            prices: { where: { isActive: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!category) return null;
    return this.mapToEntity(category);
  }

  async findBySlug(slug: string): Promise<MenuCategoryEntity | null> {
    const category = await this.prisma.menuCategory.findUnique({
      where: { slug },
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            prices: { where: { isActive: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!category) return null;
    return this.mapToEntity(category);
  }

  async create(data: CreateCategoryData): Promise<MenuCategoryEntity> {
    const category = await this.prisma.menuCategory.create({
      data: {
        name: data.name,
        nameVi: data.nameVi,
        slug: data.slug,
        description: data.description,
        descriptionVi: data.descriptionVi,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    return MenuCategoryEntity.reconstitute({
      id: category.id,
      name: category.name,
      nameVi: category.nameVi,
      slug: category.slug,
      description: category.description,
      descriptionVi: category.descriptionVi,
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }

  async update(id: bigint, data: UpdateCategoryData): Promise<MenuCategoryEntity> {
    const category = await this.prisma.menuCategory.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.nameVi !== undefined && { nameVi: data.nameVi }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.descriptionVi !== undefined && { descriptionVi: data.descriptionVi }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return MenuCategoryEntity.reconstitute({
      id: category.id,
      name: category.name,
      nameVi: category.nameVi,
      slug: category.slug,
      description: category.description,
      descriptionVi: category.descriptionVi,
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }

  async toggle(id: bigint, isActive: boolean): Promise<MenuCategoryEntity> {
    const category = await this.prisma.menuCategory.update({
      where: { id },
      data: { isActive },
    });
    return MenuCategoryEntity.reconstitute({
      id: category.id,
      name: category.name,
      nameVi: category.nameVi,
      slug: category.slug,
      description: category.description,
      descriptionVi: category.descriptionVi,
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }

  async softDelete(id: bigint): Promise<void> {
    // Soft delete category and all its items for consistency
    await this.prisma.$transaction([
      this.prisma.menuItem.updateMany({
        where: { categoryId: id },
        data: { deletedAt: new Date() },
      }),
      this.prisma.menuCategory.update({
        where: { id },
        data: { isActive: false },
      }),
    ]);
  }
}

@Injectable()
export class MenuItemAdapter implements MenuItemRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: {
    id: bigint;
    categoryId: bigint;
    name: string;
    nameVi: string | null;
    slug: string;
    description: string | null;
    descriptionVi: string | null;
    imageUrl: string | null;
    isFeatured: boolean;
    isActive: boolean;
    sortOrder: number;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    prices?: Array<{
      id: bigint;
      menuItemId: bigint;
      locationId: bigint;
      sizeLabel: string | null;
      price: unknown;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }): MenuItemEntity {
    return MenuItemEntity.reconstitute({
      id: data.id,
      categoryId: data.categoryId,
      name: data.name,
      nameVi: data.nameVi,
      slug: data.slug,
      description: data.description,
      descriptionVi: data.descriptionVi,
      imageUrl: data.imageUrl,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      deletedAt: data.deletedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      prices: data.prices?.map((p) =>
        MenuItemPriceEntity.reconstitute({
          id: p.id,
          menuItemId: p.menuItemId,
          locationId: p.locationId,
          sizeLabel: p.sizeLabel,
          price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price),
          isActive: p.isActive,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }),
      ),
    });
  }

  async findAll(params?: PaginationParams & { categoryId?: bigint; locationId?: bigint; isActive?: boolean }): Promise<PaginatedResult<MenuItemEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (params?.categoryId) where.categoryId = params.categoryId;
    if (params?.isActive !== undefined) where.isActive = params.isActive;

    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        include: {
          prices: params?.locationId ? { where: { locationId: params.locationId, isActive: true } } : { where: { isActive: true } },
        },
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    return {
      data: items.map((item) => this.mapToEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: bigint): Promise<MenuItemEntity | null> {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        prices: { where: { isActive: true } },
      },
    });
    if (!item || item.deletedAt) return null;
    return this.mapToEntity(item);
  }

  async findBySlug(slug: string): Promise<MenuItemEntity | null> {
    const item = await this.prisma.menuItem.findUnique({
      where: { slug },
      include: {
        prices: { where: { isActive: true } },
      },
    });
    if (!item || item.deletedAt) return null;
    return this.mapToEntity(item);
  }

  async create(data: CreateMenuItemData): Promise<MenuItemEntity> {
    const item = await this.prisma.menuItem.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        nameVi: data.nameVi,
        slug: data.slug,
        description: data.description,
        descriptionVi: data.descriptionVi,
        imageUrl: data.imageUrl,
        isFeatured: data.isFeatured ?? false,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return MenuItemEntity.reconstitute({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      nameVi: item.nameVi,
      slug: item.slug,
      description: item.description,
      descriptionVi: item.descriptionVi,
      imageUrl: item.imageUrl,
      isFeatured: item.isFeatured,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      deletedAt: item.deletedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  async update(id: bigint, data: UpdateMenuItemData): Promise<MenuItemEntity> {
    const item = await this.prisma.menuItem.update({
      where: { id },
      data: {
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.nameVi !== undefined && { nameVi: data.nameVi }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.descriptionVi !== undefined && { descriptionVi: data.descriptionVi }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      include: { prices: { where: { isActive: true } } },
    });
    return this.mapToEntity(item);
  }

  async softDelete(id: bigint): Promise<void> {
    await this.prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggle(id: bigint, isActive: boolean): Promise<MenuItemEntity> {
    const item = await this.prisma.menuItem.update({
      where: { id },
      data: { isActive },
      include: { prices: { where: { isActive: true } } },
    });
    return this.mapToEntity(item);
  }
}

@Injectable()
export class MenuItemPriceAdapter implements MenuItemPriceRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: {
    id: bigint;
    menuItemId: bigint;
    locationId: bigint;
    sizeLabel: string | null;
    price: unknown;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): MenuItemPriceEntity {
    return MenuItemPriceEntity.reconstitute({
      id: data.id,
      menuItemId: data.menuItemId,
      locationId: data.locationId,
      sizeLabel: data.sizeLabel,
      price: typeof data.price === 'string' ? parseFloat(data.price) : Number(data.price),
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findByMenuItemId(menuItemId: bigint): Promise<MenuItemPriceEntity[]> {
    const prices = await this.prisma.menuItemPrice.findMany({
      where: { menuItemId },
    });
    return prices.map((p) => this.mapToEntity(p));
  }

  async findByMenuItemAndLocation(menuItemId: bigint, locationId: bigint): Promise<MenuItemPriceEntity[]> {
    const prices = await this.prisma.menuItemPrice.findMany({
      where: { menuItemId, locationId },
    });
    return prices.map((p) => this.mapToEntity(p));
  }

  async upsert(menuItemId: bigint, locationId: bigint, prices: MenuItemPriceData[]): Promise<MenuItemPriceEntity[]> {
    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.menuItemPrice.deleteMany({
        where: { menuItemId, locationId },
      });

      if (prices.length === 0) {
        return [];
      }

      await tx.menuItemPrice.createMany({
        data: prices.map((p) => ({
          menuItemId,
          locationId,
          sizeLabel: p.sizeLabel,
          price: p.price,
          isActive: p.isActive ?? true,
        })),
      });

      return tx.menuItemPrice.findMany({
        where: { menuItemId, locationId },
      });
    });

    return result.map((p) => this.mapToEntity(p));
  }

  async toggle(id: bigint, isActive: boolean): Promise<void> {
    await this.prisma.menuItemPrice.update({
      where: { id },
      data: { isActive },
    });
  }
}
