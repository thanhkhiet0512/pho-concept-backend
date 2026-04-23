export class CateringItemEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;

  private _cateringRequestId!: bigint;
  private _menuItemId: bigint | null = null;
  private _customName: string | null = null;
  private _quantity!: number;
  private _unitPrice!: number;
  private _note: string | null = null;

  static reconstitute(data: {
    id: bigint; cateringRequestId: bigint; menuItemId: bigint | null;
    customName: string | null; quantity: number; unitPrice: number;
    note: string | null; createdAt: Date; updatedAt: Date;
  }): CateringItemEntity {
    const e = new CateringItemEntity();
    e.id = data.id; e.createdAt = data.createdAt; e.updatedAt = data.updatedAt;
    e._cateringRequestId = data.cateringRequestId; e._menuItemId = data.menuItemId;
    e._customName = data.customName; e._quantity = data.quantity;
    e._unitPrice = data.unitPrice; e._note = data.note;
    return e;
  }

  get cateringRequestId(): bigint      { return this._cateringRequestId; }
  get menuItemId(): bigint | null      { return this._menuItemId; }
  get customName(): string | null      { return this._customName; }
  get quantity(): number               { return this._quantity; }
  get unitPrice(): number              { return this._unitPrice; }
  get note(): string | null            { return this._note; }
  get lineTotal(): number              { return this._quantity * this._unitPrice; }

  displayName(): string {
    return this._customName ?? `Menu Item #${this._menuItemId}`;
  }
}
