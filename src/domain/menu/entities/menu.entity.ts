export class MenuCategoryEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _name!: string;
  private _nameVi: string | null = null;
  private _slug!: string;
  private _description: string | null = null;
  private _descriptionVi: string | null = null;
  private _imageUrl: string | null = null;
  private _sortOrder!: number;
  private _isActive!: boolean;
  private _items: MenuItemEntity[] = [];

  static reconstitute(data: {
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
    items?: MenuItemEntity[];
  }): MenuCategoryEntity {
    const entity = new MenuCategoryEntity();
    entity.id = data.id;
    entity._name = data.name;
    entity._nameVi = data.nameVi;
    entity._slug = data.slug;
    entity._description = data.description;
    entity._descriptionVi = data.descriptionVi;
    entity._imageUrl = data.imageUrl;
    entity._sortOrder = data.sortOrder;
    entity._isActive = data.isActive;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    entity._items = data.items || [];
    return entity;
  }

  get name(): string {
    return this._name;
  }

  get nameVi(): string | null {
    return this._nameVi;
  }

  get slug(): string {
    return this._slug;
  }

  get description(): string | null {
    return this._description;
  }

  get descriptionVi(): string | null {
    return this._descriptionVi;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get sortOrder(): number {
    return this._sortOrder;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get items(): MenuItemEntity[] {
    return this._items;
  }
}

export class MenuItemEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _categoryId!: bigint;
  private _name!: string;
  private _nameVi: string | null = null;
  private _slug!: string;
  private _description: string | null = null;
  private _descriptionVi: string | null = null;
  private _imageUrl: string | null = null;
  private _isFeatured!: boolean;
  private _isActive!: boolean;
  private _sortOrder!: number;
  private _deletedAt: Date | null = null;
  private _prices: MenuItemPriceEntity[] = [];

  static reconstitute(data: {
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
    prices?: MenuItemPriceEntity[];
  }): MenuItemEntity {
    const entity = new MenuItemEntity();
    entity.id = data.id;
    entity._categoryId = data.categoryId;
    entity._name = data.name;
    entity._nameVi = data.nameVi;
    entity._slug = data.slug;
    entity._description = data.description;
    entity._descriptionVi = data.descriptionVi;
    entity._imageUrl = data.imageUrl;
    entity._isFeatured = data.isFeatured;
    entity._isActive = data.isActive;
    entity._sortOrder = data.sortOrder;
    entity._deletedAt = data.deletedAt;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    entity._prices = data.prices || [];
    return entity;
  }

  get categoryId(): bigint {
    return this._categoryId;
  }

  get name(): string {
    return this._name;
  }

  get nameVi(): string | null {
    return this._nameVi;
  }

  get slug(): string {
    return this._slug;
  }

  get description(): string | null {
    return this._description;
  }

  get descriptionVi(): string | null {
    return this._descriptionVi;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get isFeatured(): boolean {
    return this._isFeatured;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get sortOrder(): number {
    return this._sortOrder;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get prices(): MenuItemPriceEntity[] {
    return this._prices;
  }

  get isDeleted(): boolean {
    return this._deletedAt !== null;
  }
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

  get menuItemId(): bigint {
    return this._menuItemId;
  }

  get locationId(): bigint {
    return this._locationId;
  }

  get sizeLabel(): string | null {
    return this._sizeLabel;
  }

  get price(): number {
    return this._price;
  }

  get isActive(): boolean {
    return this._isActive;
  }
}
