import { LocationEntity } from '../entities/location.entity';

export interface LocationHourData {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen?: boolean;
}

export interface CreateLocationData {
  slug: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  timezone?: string;
  phone?: string | null;
  email?: string | null;
  hours?: LocationHourData[] | undefined;
}

export interface UpdateLocationData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string | null;
  email?: string | null;
  timezone?: string;
}

export abstract class LocationRepositoryPort {
  abstract findAll(params?: { includeInactive?: boolean }): Promise<LocationEntity[]>;
  abstract findById(id: bigint): Promise<LocationEntity | null>;
  abstract findBySlug(slug: string): Promise<LocationEntity | null>;
  abstract create(data: CreateLocationData): Promise<LocationEntity>;
  abstract update(id: bigint, data: UpdateLocationData): Promise<LocationEntity>;
  abstract updateHours(id: bigint, hours: LocationHourData[]): Promise<void>;
  abstract toggle(id: bigint, isActive: boolean): Promise<void>;
}
