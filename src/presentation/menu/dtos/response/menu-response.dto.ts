import { MenuCategoryEntity, MenuItemEntity, MenuItemPriceEntity } from '@domain/menu/entities/menu.entity';

export class MenuItemPriceResponseDto {
  id!: number;
  sizeLabel!: string | null;
  price!: number;
  isActive!: boolean;

  static from(entity: MenuItemPriceEntity): MenuItemPriceResponseDto {
    const dto = new MenuItemPriceResponseDto();
    dto.id = Number(entity.id);
    dto.sizeLabel = entity.sizeLabel;
    dto.price = entity.price;
    dto.isActive = entity.isActive;
    return dto;
  }

  static fromList(entities: MenuItemPriceEntity[]): MenuItemPriceResponseDto[] {
    return entities.map((e) => MenuItemPriceResponseDto.from(e));
  }
}

export class MenuItemResponseDto {
  id!: number;
  categoryId!: number;
  name!: string;
  nameVi!: string | null;
  slug!: string;
  description!: string | null;
  descriptionVi!: string | null;
  imageUrl!: string | null;
  isFeatured!: boolean;
  isActive!: boolean;
  sortOrder!: number;
  prices!: MenuItemPriceResponseDto[];
  createdAt!: string;
  updatedAt!: string;

  static from(entity: MenuItemEntity): MenuItemResponseDto {
    const dto = new MenuItemResponseDto();
    dto.id = Number(entity.id);
    dto.categoryId = Number(entity.categoryId);
    dto.name = entity.name;
    dto.nameVi = entity.nameVi;
    dto.slug = entity.slug;
    dto.description = entity.description;
    dto.descriptionVi = entity.descriptionVi;
    dto.imageUrl = entity.imageUrl;
    dto.isFeatured = entity.isFeatured;
    dto.isActive = entity.isActive;
    dto.sortOrder = entity.sortOrder;
    dto.prices = MenuItemPriceResponseDto.fromList(entity.prices);
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }

  static fromList(entities: MenuItemEntity[]): MenuItemResponseDto[] {
    return entities.map((e) => MenuItemResponseDto.from(e));
  }
}

export class MenuCategoryResponseDto {
  id!: number;
  name!: string;
  nameVi!: string | null;
  slug!: string;
  description!: string | null;
  descriptionVi!: string | null;
  imageUrl!: string | null;
  sortOrder!: number;
  isActive!: boolean;
  items!: MenuItemResponseDto[];
  createdAt!: string;
  updatedAt!: string;

  static from(entity: MenuCategoryEntity): MenuCategoryResponseDto {
    const dto = new MenuCategoryResponseDto();
    dto.id = Number(entity.id);
    dto.name = entity.name;
    dto.nameVi = entity.nameVi;
    dto.slug = entity.slug;
    dto.description = entity.description;
    dto.descriptionVi = entity.descriptionVi;
    dto.imageUrl = entity.imageUrl;
    dto.sortOrder = entity.sortOrder;
    dto.isActive = entity.isActive;
    dto.items = MenuItemResponseDto.fromList(entity.items);
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }

  static fromList(entities: MenuCategoryEntity[]): MenuCategoryResponseDto[] {
    return entities.map((e) => MenuCategoryResponseDto.from(e));
  }
}
