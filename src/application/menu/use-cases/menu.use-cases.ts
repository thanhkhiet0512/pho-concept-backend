import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import {
  MenuCategoryRepositoryPort,
  MenuItemRepositoryPort,
  MenuItemPriceRepositoryPort,
} from '@domain/menu/ports/menu.repository.port';
import { MENU_CATEGORY_REPOSITORY_TOKEN, MENU_ITEM_REPOSITORY_TOKEN, MENU_ITEM_PRICE_REPOSITORY_TOKEN } from '@domain/menu/ports/menu.repository.token';
import { CreateCategoryDto, UpdateCategoryDto, CreateMenuItemDto, UpdateMenuItemDto, UpdateMenuItemPricesDto } from '../dtos/menu.dto';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { PaginationDto } from '@common/dto/pagination.dto';

// ===================== CATEGORY USE CASES =====================

@Injectable()
export class GetCategoriesUseCase {
  constructor(
    @Inject(MENU_CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: MenuCategoryRepositoryPort,
  ) {}

  async execute(pagination?: PaginationDto, isActive?: boolean) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    return this.categoryRepository.findAll({ page, limit, isActive });
  }
}

@Injectable()
export class GetCategoryByIdUseCase {
  constructor(
    @Inject(MENU_CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: MenuCategoryRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(MENU_CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: MenuCategoryRepositoryPort,
  ) {}

  async execute(dto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException(`Category with slug "${dto.slug}" already exists`);
    }

    return this.categoryRepository.create({
      slug: dto.slug,
      nameI18n: dto.nameI18n,
      sortOrder: dto.sortOrder,
      isActive: true,
    });
  }
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(MENU_CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: MenuCategoryRepositoryPort,
  ) {}

  async execute(id: bigint, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return this.categoryRepository.update(id, {
      nameI18n: dto.nameI18n,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
    });
  }
}

@Injectable()
export class ToggleCategoryUseCase {
  constructor(
    @Inject(MENU_CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: MenuCategoryRepositoryPort,
  ) {}

  async execute(id: bigint, isActive: boolean) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return this.categoryRepository.toggle(id, isActive);
  }
}

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(MENU_CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: MenuCategoryRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    await this.categoryRepository.softDelete(id);
  }
}

// ===================== MENU ITEM USE CASES =====================

@Injectable()
export class GetMenuItemsUseCase {
  constructor(
    @Inject(MENU_ITEM_REPOSITORY_TOKEN)
    private readonly itemRepository: MenuItemRepositoryPort,
  ) {}

  async execute(pagination?: PaginationDto, params?: { categoryId?: bigint; locationId?: bigint; isActive?: boolean; isFeatured?: boolean }) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    return this.itemRepository.findAll({ ...params, page, limit });
  }
}

@Injectable()
export class GetMenuItemByIdUseCase {
  constructor(
    @Inject(MENU_ITEM_REPOSITORY_TOKEN)
    private readonly itemRepository: MenuItemRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Menu item with id ${id} not found`);
    }
    return item;
  }
}

@Injectable()
export class CreateMenuItemUseCase {
  constructor(
    @Inject(MENU_ITEM_REPOSITORY_TOKEN)
    private readonly itemRepository: MenuItemRepositoryPort,
    @Inject(MENU_CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: MenuCategoryRepositoryPort,
  ) {}

  async execute(dto: CreateMenuItemDto) {
    const existing = await this.itemRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException(`Menu item with slug "${dto.slug}" already exists`);
    }

    const category = await this.categoryRepository.findById(BigInt(dto.categoryId));
    if (!category) {
      throw new NotFoundException(`Category with id ${dto.categoryId} not found`);
    }

    return this.itemRepository.create({
      categoryId: BigInt(dto.categoryId),
      slug: dto.slug,
      nameI18n: dto.nameI18n,
      descriptionI18n: dto.descriptionI18n ?? null,
      imageUrl: dto.imageUrl ?? null,
      isFeatured: dto.isFeatured,
      sortOrder: dto.sortOrder,
    });
  }
}

@Injectable()
export class UpdateMenuItemUseCase {
  constructor(
    @Inject(MENU_ITEM_REPOSITORY_TOKEN)
    private readonly itemRepository: MenuItemRepositoryPort,
    @Inject(MENU_CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: MenuCategoryRepositoryPort,
  ) {}

  async execute(id: bigint, dto: UpdateMenuItemDto) {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Menu item with id ${id} not found`);
    }

    if (dto.slug && dto.slug !== item.slug) {
      const existing = await this.itemRepository.findBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Menu item with slug "${dto.slug}" already exists`);
      }
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(BigInt(dto.categoryId));
      if (!category) {
        throw new NotFoundException(`Category with id ${dto.categoryId} not found`);
      }
    }

    return this.itemRepository.update(id, {
      categoryId: dto.categoryId ? BigInt(dto.categoryId) : undefined,
      slug: dto.slug,
      nameI18n: dto.nameI18n,
      descriptionI18n: dto.descriptionI18n,
      imageUrl: dto.imageUrl,
      isFeatured: dto.isFeatured,
      sortOrder: dto.sortOrder,
    });
  }
}

@Injectable()
export class ToggleMenuItemUseCase {
  constructor(
    @Inject(MENU_ITEM_REPOSITORY_TOKEN)
    private readonly itemRepository: MenuItemRepositoryPort,
  ) {}

  async execute(id: bigint, isActive: boolean) {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Menu item with id ${id} not found`);
    }
    return this.itemRepository.toggle(id, isActive);
  }
}

@Injectable()
export class DeleteMenuItemUseCase {
  constructor(
    @Inject(MENU_ITEM_REPOSITORY_TOKEN)
    private readonly itemRepository: MenuItemRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Menu item with id ${id} not found`);
    }
    await this.itemRepository.softDelete(id);
  }
}

// ===================== MENU ITEM PRICE USE CASES =====================

@Injectable()
export class UpdateMenuItemPricesUseCase {
  constructor(
    @Inject(MENU_ITEM_REPOSITORY_TOKEN)
    private readonly itemRepository: MenuItemRepositoryPort,
    @Inject(MENU_ITEM_PRICE_REPOSITORY_TOKEN)
    private readonly priceRepository: MenuItemPriceRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(menuItemId: bigint, dto: UpdateMenuItemPricesDto) {
    const item = await this.itemRepository.findById(menuItemId);
    if (!item) {
      throw new NotFoundException(`Menu item with id ${menuItemId} not found`);
    }

    const locationId = BigInt(dto.locationId);
    const location = await this.prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
      throw new NotFoundException(`Location with id ${dto.locationId} not found`);
    }

    return this.priceRepository.upsert(
      menuItemId,
      locationId,
      dto.prices.map((p) => ({
        sizeLabel: p.sizeLabel ?? null,
        price: p.price,
        isActive: p.isActive,
      })),
    );
  }
}
