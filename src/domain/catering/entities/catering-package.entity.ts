export class CateringPackageEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;

  private _name!: string;
  private _descriptionI18n!: Record<string, string>;
  private _minGuests!: number;
  private _maxGuests!: number;
  private _basePrice!: number;
  private _includesI18n!: Record<string, string[]>;
  private _isActive!: boolean;
  private _sortOrder!: number;

  static reconstitute(data: {
    id: bigint; name: string; descriptionI18n: Record<string, string>;
    minGuests: number; maxGuests: number; basePrice: number;
    includesI18n: Record<string, string[]>; isActive: boolean;
    sortOrder: number; createdAt: Date; updatedAt: Date;
  }): CateringPackageEntity {
    const e = new CateringPackageEntity();
    e.id = data.id; e.createdAt = data.createdAt; e.updatedAt = data.updatedAt;
    e._name = data.name; e._descriptionI18n = data.descriptionI18n;
    e._minGuests = data.minGuests; e._maxGuests = data.maxGuests;
    e._basePrice = data.basePrice; e._includesI18n = data.includesI18n;
    e._isActive = data.isActive; e._sortOrder = data.sortOrder;
    return e;
  }

  get name(): string                                   { return this._name; }
  get descriptionI18n(): Record<string, string>        { return this._descriptionI18n; }
  get minGuests(): number                              { return this._minGuests; }
  get maxGuests(): number                              { return this._maxGuests; }
  get basePrice(): number                              { return this._basePrice; }
  get includesI18n(): Record<string, string[]>         { return this._includesI18n; }
  get isActive(): boolean                              { return this._isActive; }
  get sortOrder(): number                              { return this._sortOrder; }
}
