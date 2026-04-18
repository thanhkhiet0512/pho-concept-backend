import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { LocationRepositoryPort } from '@domain/location/ports/location.repository.port';
import { LocationEntity } from '@domain/location/entities/location.entity';
import { CreateLocationDto, UpdateLocationDto, LocationHourDto } from '@application/location/dtos/location.dto';
import { LOCATION_REPOSITORY_TOKEN } from '@domain/location/ports/location.repository.token';

@Injectable()
export class LocationService {
  constructor(
    @Inject(LOCATION_REPOSITORY_TOKEN)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async findAll(): Promise<LocationEntity[]> {
    return this.locationRepository.findAll();
  }

  async findById(id: bigint): Promise<LocationEntity> {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }
    return location;
  }

  async create(dto: CreateLocationDto): Promise<LocationEntity> {
    const existing = await this.locationRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException(`Location with slug ${dto.slug} already exists`);
    }

    return this.locationRepository.create({
      ...dto,
      hours: dto.hours
        ? dto.hours.map((h: LocationHourDto) => ({
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isOpen: h.isClosed ? false : true,
          }))
        : undefined,
    });
  }

  async update(id: bigint, dto: UpdateLocationDto): Promise<LocationEntity> {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }

    return this.locationRepository.update(id, dto);
  }

  async updateHours(id: bigint, hours: LocationHourDto[]): Promise<void> {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }

    await this.locationRepository.updateHours(id, hours);
  }

  async toggle(id: bigint, isActive: boolean): Promise<void> {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }

    await this.locationRepository.toggle(id, isActive);
  }
}
