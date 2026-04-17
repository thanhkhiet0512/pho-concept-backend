export class LocationHourEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _locationId!: bigint;
  private _dayOfWeek!: number;
  private _openTime!: string;
  private _closeTime!: string;
  private _isOpen!: boolean;

  static reconstitute(data: {
    id: bigint;
    locationId: bigint;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): LocationHourEntity {
    const entity = new LocationHourEntity();
    entity.id = data.id;
    entity._locationId = data.locationId;
    entity._dayOfWeek = data.dayOfWeek;
    entity._openTime = data.openTime;
    entity._closeTime = data.closeTime;
    entity._isOpen = data.isOpen;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    return entity;
  }

  get locationId(): bigint {
    return this._locationId;
  }

  get dayOfWeek(): number {
    return this._dayOfWeek;
  }

  get openTime(): string {
    return this._openTime;
  }

  get closeTime(): string {
    return this._closeTime;
  }

  get isOpen(): boolean {
    return this._isOpen;
  }
}
