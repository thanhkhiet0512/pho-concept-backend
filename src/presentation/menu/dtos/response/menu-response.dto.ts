import { MenuCategoryEntity, MenuItemEntity, MenuItemPriceEntity, I18nField } from '@domain/menu/entities/menu.entity';

export class I18nFieldResponseDto {
  en!: string;
  vi?: string;

  static from(field: I18nField): I18nFieldResponseDto {
    const dto = new I18nFieldResponseDto();
    dto.en = field.en;
    if (field.vi !== undefined) dto.vi = field.vi;
    return dto;
  }
}

export class MenuItemPriceResponseDto {
  id!: number;
  locationId!: number;
  sizeLabel!: string | null;
  price!: number;
  isActive!: boolean;

  static from(entity: MenuItemPriceEntity): MenuItemPriceResponseDto {
    const dto = new MenuItemPriceResponseDto();
    dto.id = Number(entity.id);
    dto.locationId = Number(entity.locationId);
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
  slug!: string;
  nameI18n!: I18nFieldResponseDto;
  descriptionI18n!: I18nFieldResponseDto | null;
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
    dto.slug = entity.slug;
    dto.nameI18n = I18nFieldResponseDto.from(entity.nameI18n);
    dto.descriptionI18n = entity.descriptionI18n ? I18nFieldResponseDto.from(entity.descriptionI18n) : null;
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
  slug!: string;
  nameI18n!: I18nFieldResponseDto;
  sortOrder!: number;
  isActive!: boolean;
  items!: MenuItemResponseDto[];
  createdAt!: string;
  updatedAt!: string;

  static from(entity: MenuCategoryEntity): MenuCategoryResponseDto {
    const dto = new MenuCategoryResponseDto();
    dto.id = Number(entity.id);
    dto.slug = entity.slug;
    dto.nameI18n = I18nFieldResponseDto.from(entity.nameI18n);
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
