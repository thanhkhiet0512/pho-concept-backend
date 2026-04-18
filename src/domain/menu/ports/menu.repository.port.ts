import { MenuCategoryEntity, MenuItemEntity, MenuItemPriceEntity, I18nField } from '../entities/menu.entity';

export interface CreateCategoryData {
  slug: string;
  nameI18n: I18nField;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  nameI18n?: I18nField;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateMenuItemData {
  categoryId: bigint;
  slug: string;
  nameI18n: I18nField;
  descriptionI18n?: I18nField | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface UpdateMenuItemData {
  categoryId?: bigint;
  slug?: string;
  nameI18n?: I18nField;
  descriptionI18n?: I18nField | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface MenuItemPriceData {
  sizeLabel: string | null;
  price: number;
  isActive?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class MenuCategoryRepositoryPort {
  abstract findAll(params?: PaginationParams & { isActive?: boolean }): Promise<PaginatedResult<MenuCategoryEntity>>;
  abstract findById(id: bigint): Promise<MenuCategoryEntity | null>;
  abstract findBySlug(slug: string): Promise<MenuCategoryEntity | null>;
  abstract create(data: CreateCategoryData): Promise<MenuCategoryEntity>;
  abstract update(id: bigint, data: UpdateCategoryData): Promise<MenuCategoryEntity>;
  abstract toggle(id: bigint, isActive: boolean): Promise<MenuCategoryEntity>;
  abstract softDelete(id: bigint): Promise<void>;
}

export abstract class MenuItemRepositoryPort {
  abstract findAll(params?: PaginationParams & { categoryId?: bigint; locationId?: bigint; isActive?: boolean; isFeatured?: boolean }): Promise<PaginatedResult<MenuItemEntity>>;
  abstract findById(id: bigint): Promise<MenuItemEntity | null>;
  abstract findBySlug(slug: string): Promise<MenuItemEntity | null>;
  abstract create(data: CreateMenuItemData): Promise<MenuItemEntity>;
  abstract update(id: bigint, data: UpdateMenuItemData): Promise<MenuItemEntity>;
  abstract softDelete(id: bigint): Promise<void>;
  abstract toggle(id: bigint, isActive: boolean): Promise<MenuItemEntity>;
}

export abstract class MenuItemPriceRepositoryPort {
  abstract findByMenuItemId(menuItemId: bigint): Promise<MenuItemPriceEntity[]>;
  abstract findByMenuItemAndLocation(menuItemId: bigint, locationId: bigint): Promise<MenuItemPriceEntity[]>;
  abstract upsert(menuItemId: bigint, locationId: bigint, prices: MenuItemPriceData[]): Promise<MenuItemPriceEntity[]>;
  abstract toggle(id: bigint, isActive: boolean): Promise<void>;
}
