import { LocationEntity } from '@domain/location/entities/location.entity';
import { LocationHourEntity } from '@domain/location/entities/location-hour.entity';

export class LocationHourResponseDto {
  id!: number;
  dayOfWeek!: number;
  openTime!: string;
  closeTime!: string;
  isOpen!: boolean;

  static from(entity: LocationHourEntity): LocationHourResponseDto {
    const dto = new LocationHourResponseDto();
    dto.id = Number(entity.id);
    dto.dayOfWeek = entity.dayOfWeek;
    dto.openTime = entity.openTime;
    dto.closeTime = entity.closeTime;
    dto.isOpen = entity.isOpen;
    return dto;
  }
}

export class LocationResponseDto {
  id!: number;
  slug!: string;
  name!: string;
  address!: string;
  city!: string;
  state!: string;
  zip!: string;
  phone!: string | null;
  email!: string | null;
  timezone!: string;
  isActive!: boolean;
  hours!: LocationHourResponseDto[];
  createdAt!: string;
  updatedAt!: string;

  static from(entity: LocationEntity): LocationResponseDto {
    const dto = new LocationResponseDto();
    dto.id = Number(entity.id);
    dto.slug = entity.slug;
    dto.name = entity.name;
    dto.address = entity.address;
    dto.city = entity.city;
    dto.state = entity.state;
    dto.zip = entity.zip;
    dto.phone = entity.phone;
    dto.email = entity.email;
    dto.timezone = entity.timezone;
    dto.isActive = entity.isActive;
    dto.hours = entity.hours.map(LocationHourResponseDto.from);
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }

  static toList(entities: LocationEntity[]): LocationResponseDto[] {
    return entities.map((e) => LocationResponseDto.from(e));
  }
}
