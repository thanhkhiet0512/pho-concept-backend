export interface I18nField {
  en: string;
  vi?: string;
}

export class MenuCategoryEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _slug!: string;
  private _nameI18n!: I18nField;
  private _sortOrder!: number;
  private _isActive!: boolean;
  private _items: MenuItemEntity[] = [];

  static reconstitute(data: {
    id: bigint;
    slug: string;
    nameI18n: I18nField;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    items?: MenuItemEntity[];
  }): MenuCategoryEntity {
    const entity = new MenuCategoryEntity();
    entity.id = data.id;
    entity._slug = data.slug;
    entity._nameI18n = data.nameI18n;
    entity._sortOrder = data.sortOrder;
    entity._isActive = data.isActive;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    entity._items = data.items ?? [];
    return entity;
  }

  get slug(): string { return this._slug; }
  get nameI18n(): I18nField { return this._nameI18n; }
  get sortOrder(): number { return this._sortOrder; }
  get isActive(): boolean { return this._isActive; }
  get items(): MenuItemEntity[] { return this._items; }
}

export class MenuItemEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _categoryId!: bigint;
  private _slug!: string;
  private _nameI18n!: I18nField;
  private _descriptionI18n: I18nField | null = null;
  private _imageUrl: string | null = null;
  private _isFeatured!: boolean;
  private _isActive!: boolean;
  private _sortOrder!: number;
  private _deletedAt: Date | null = null;
  private _prices: MenuItemPriceEntity[] = [];

  static reconstitute(data: {
    id: bigint;
    categoryId: bigint;
    slug: string;
    nameI18n: I18nField;
    descriptionI18n: I18nField | null;
    imageUrl: string | null;
    isFeatured: boolean;
    isActive: boolean;
    sortOrder: number;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    prices?: MenuItemPriceEntity[];
  }): MenuItemEntity {
    const entity = new MenuItemEntity();
    entity.id = data.id;
    entity._categoryId = data.categoryId;
    entity._slug = data.slug;
    entity._nameI18n = data.nameI18n;
    entity._descriptionI18n = data.descriptionI18n;
    entity._imageUrl = data.imageUrl;
    entity._isFeatured = data.isFeatured;
    entity._isActive = data.isActive;
    entity._sortOrder = data.sortOrder;
    entity._deletedAt = data.deletedAt;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    entity._prices = data.prices ?? [];
    return entity;
  }

  get categoryId(): bigint { return this._categoryId; }
  get slug(): string { return this._slug; }
  get nameI18n(): I18nField { return this._nameI18n; }
  get descriptionI18n(): I18nField | null { return this._descriptionI18n; }
  get imageUrl(): string | null { return this._imageUrl; }
  get isFeatured(): boolean { return this._isFeatured; }
  get isActive(): boolean { return this._isActive; }
  get sortOrder(): number { return this._sortOrder; }
  get deletedAt(): Date | null { return this._deletedAt; }
  get prices(): MenuItemPriceEntity[] { return this._prices; }
  get isDeleted(): boolean { return this._deletedAt !== null; }
}

export class MenuItemPriceEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _menuItemId!: bigint;
  private _locationId!: bigint;
  private _sizeLabel: string | null = null;
  private _price!: number;
  private _isActive!: boolean;

  static reconstitute(data: {
    id: bigint;
    menuItemId: bigint;
    locationId: bigint;
    sizeLabel: string | null;
    price: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): MenuItemPriceEntity {
    const entity = new MenuItemPriceEntity();
    entity.id = data.id;
    entity._menuItemId = data.menuItemId;
    entity._locationId = data.locationId;
    entity._sizeLabel = data.sizeLabel;
    entity._price = data.price;
    entity._isActive = data.isActive;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    return entity;
  }

  get menuItemId(): bigint { return this._menuItemId; }
  get locationId(): bigint { return this._locationId; }
  get sizeLabel(): string | null { return this._sizeLabel; }
  get price(): number { return this._price; }
  get isActive(): boolean { return this._isActive; }
}
