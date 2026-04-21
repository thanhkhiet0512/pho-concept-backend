import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { LocationRepositoryPort, CreateLocationData, UpdateLocationData, LocationHourData } from '@domain/location/ports/location.repository.port';
import { LocationEntity } from '@domain/location/entities/location.entity';

@Injectable()
export class LocationAdapter implements LocationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(loc: {
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
    return LocationEntity.reconstitute({
      id: loc.id,
      slug: loc.slug,
      name: loc.name,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      zip: loc.zip,
      phone: loc.phone,
      email: loc.email,
      timezone: loc.timezone,
      isActive: loc.isActive,
      createdAt: loc.createdAt,
      updatedAt: loc.updatedAt,
      hours: loc.hours?.map((h) => ({
        id: h.id,
        locationId: h.locationId,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isOpen: h.isOpen,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      })),
    });
  }

  async findAll(params?: { includeInactive?: boolean }): Promise<LocationEntity[]> {
    const locations = await this.prisma.location.findMany({
      where: params?.includeInactive ? undefined : { isActive: true },
      include: { hours: true },
      orderBy: { id: 'asc' },
    });
    return locations.map((loc) => this.mapToEntity(loc));
  }

  async findById(id: bigint): Promise<LocationEntity | null> {
    const loc = await this.prisma.location.findUnique({
      where: { id },
      include: { hours: true },
    });
    if (!loc) return null;
    return this.mapToEntity(loc);
  }

  async findBySlug(slug: string): Promise<LocationEntity | null> {
    const loc = await this.prisma.location.findUnique({
      where: { slug },
      include: { hours: true },
    });
    if (!loc) return null;
    return this.mapToEntity(loc);
  }

  async create(data: CreateLocationData): Promise<LocationEntity> {
    const { hours, ...locationData } = data;

    const loc = await this.prisma.location.create({
      data: {
        ...locationData,
        ...(hours && hours.length > 0
          ? {
              hours: {
                create: hours.map((h) => ({
                  dayOfWeek: h.dayOfWeek,
                  openTime: h.openTime,
                  closeTime: h.closeTime,
                  isOpen: h.isOpen ?? true,
                })),
              },
            }
          : {}),
      },
      include: { hours: true },
    });

    return this.mapToEntity(loc);
  }

  async update(id: bigint, data: UpdateLocationData): Promise<LocationEntity> {
    const loc = await this.prisma.location.update({
      where: { id },
      data,
      include: { hours: true },
    });
    return this.mapToEntity(loc);
  }

  async updateHours(id: bigint, hours: LocationHourData[]): Promise<void> {
    await this.prisma.locationHour.deleteMany({ where: { locationId: id } });

    if (hours.length > 0) {
      await this.prisma.locationHour.createMany({
        data: hours.map((h) => ({
          locationId: id,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isOpen: h.isOpen ?? true,
        })),
      });
    }
  }

  async toggle(id: bigint, isActive: boolean): Promise<void> {
    await this.prisma.location.update({
      where: { id },
      data: { isActive },
    });
  }
}
