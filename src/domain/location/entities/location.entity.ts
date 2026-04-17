import { LocationHourEntity } from './location-hour.entity';

export class LocationEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _slug!: string;
  private _name!: string;
  private _address!: string;
  private _city!: string;
  private _state!: string;
  private _zip!: string;
  private _phone: string | null = null;
  private _email: string | null = null;
  private _timezone!: string;
  private _isActive!: boolean;
  private _hours: LocationHourEntity[] = [];

  static create(data: {
    slug: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    timezone?: string;
    phone?: string | null;
    email?: string | null;
    isActive?: boolean;
  }): LocationEntity {
    const entity = new LocationEntity();
    entity._slug = data.slug;
    entity._name = data.name;
    entity._address = data.address;
    entity._city = data.city;
    entity._state = data.state;
    entity._zip = data.zip;
    entity._phone = data.phone ?? null;
    entity._email = data.email ?? null;
    entity._timezone = data.timezone ?? 'Asia/Ho_Chi_Minh';
    entity._isActive = data.isActive ?? true;
    return entity;
  }

  static reconstitute(data: {
    id: bigint;
    slug: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string | null;
    email: string | null;
    timezone: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    hours?: Array<{
      id: bigint;
      locationId: bigint;
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isOpen: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }): LocationEntity {
    const entity = new LocationEntity();
    entity.id = data.id;
    entity._slug = data.slug;
    entity._name = data.name;
    entity._address = data.address;
    entity._city = data.city;
    entity._state = data.state;
    entity._zip = data.zip;
    entity._phone = data.phone;
    entity._email = data.email;
    entity._timezone = data.timezone;
    entity._isActive = data.isActive;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    entity._hours = (data.hours || []).map(LocationHourEntity.reconstitute);
    return entity;
  }

  get slug(): string {
    return this._slug;
  }

  get name(): string {
    return this._name;
  }

  get address(): string {
    return this._address;
  }

  get city(): string {
    return this._city;
  }

  get state(): string {
    return this._state;
  }

  get zip(): string {
    return this._zip;
  }

  get phone(): string | null {
    return this._phone;
  }

  get email(): string | null {
    return this._email;
  }

  get timezone(): string {
    return this._timezone;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get hours(): LocationHourEntity[] {
    return this._hours;
  }
}
