import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  ReservationRepositoryPort,
  SlotConfigRepositoryPort,
  CreateReservationData,
  UpdateReservationStatusData,
  ReservationListParams,
  UpsertSlotConfigData,
  PaginatedResult,
} from '@domain/reservation/ports/reservation.repository.port';
import { ReservationEntity, SlotConfigEntity, ReservationStatus } from '@domain/reservation/entities/reservation.entity';

// Use string literals for Prisma compatibility
const PENDING: ReservationStatus = 'PENDING';
const CONFIRMED: ReservationStatus = 'CONFIRMED';
const SEATED: ReservationStatus = 'SEATED';

@Injectable()
export class ReservationAdapter implements ReservationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(data: {
    id: bigint;
    token: string;
    locationId: bigint;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    partySize: number;
    reservationDate: Date;
    reservationTime: string;
    status: ReservationStatus;
    specialRequest: string | null;
    internalNote: string | null;
    createdByAdminId: bigint | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): ReservationEntity {
    return ReservationEntity.reconstitute(data);
  }

  async findById(id: bigint): Promise<ReservationEntity | null> {
    const reservation = await this.prisma.reservation.findFirst({ where: { id, deletedAt: null } });
    return reservation ? this.map(reservation) : null;
  }

  async findByToken(token: string): Promise<ReservationEntity | null> {
    const reservation = await this.prisma.reservation.findFirst({ where: { token, deletedAt: null } });
    return reservation ? this.map(reservation) : null;
  }

  async findAll(params: ReservationListParams): Promise<PaginatedResult<ReservationEntity>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ReservationWhereInput = {
      deletedAt: null,
    };

    if (params.locationId) {
      where.locationId = params.locationId;
    }

    if (params.date) {
      const startOfDay = new Date(params.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(params.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.reservationDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (params.status) {
      where.status = params.status;
    }

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        orderBy: [{ reservationDate: 'asc' }, { reservationTime: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      data: reservations.map((r) => this.map(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateReservationData): Promise<ReservationEntity> {
    const reservation = await this.prisma.reservation.create({
      data: {
        locationId: data.locationId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        partySize: data.partySize,
        reservationDate: data.reservationDate,
        reservationTime: data.reservationTime,
        specialRequest: data.specialRequest ?? null,
        createdByAdminId: data.createdByAdminId ?? null,
        status: PENDING,
      },
    });
    return this.map(reservation);
  }

  async updateStatus(id: bigint, data: UpdateReservationStatusData): Promise<ReservationEntity> {
    const updateData: Prisma.ReservationUncheckedUpdateInput = {
      status: data.status,
    };
    if (data.internalNote !== undefined) {
      updateData.internalNote = data.internalNote;
    }

    const reservation = await this.prisma.reservation.update({
      where: { id },
      data: updateData,
    });
    return this.map(reservation);
  }

  async softDelete(id: bigint): Promise<void> {
    await this.prisma.reservation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countBySlot(locationId: bigint, date: Date, time: string): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.prisma.reservation.aggregate({
      where: {
        locationId,
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        reservationTime: time,
        status: {
          in: [PENDING, CONFIRMED, SEATED],
        },
        deletedAt: null,
      },
      _sum: { partySize: true },
    });

    return result._sum.partySize ?? 0;
  }
}

@Injectable()
export class SlotConfigAdapter implements SlotConfigRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(data: {
    id: bigint;
    locationId: bigint;
    slotDuration: number;
    maxGuestsPerSlot: number;
    minAdvanceHours: number;
    maxAdvanceDays: number;
    createdAt: Date;
    updatedAt: Date;
  }): SlotConfigEntity {
    return SlotConfigEntity.reconstitute({
      id: data.id,
      locationId: data.locationId,
      slotDuration: data.slotDuration,
      maxGuestsPerSlot: data.maxGuestsPerSlot,
      minAdvanceHours: data.minAdvanceHours,
      maxAdvanceDays: data.maxAdvanceDays,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findByLocationId(locationId: bigint): Promise<SlotConfigEntity | null> {
    const config = await this.prisma.reservationSlotConfig.findUnique({
      where: { locationId },
    });
    return config ? this.map(config) : null;
  }

  async upsert(locationId: bigint, data: UpsertSlotConfigData): Promise<SlotConfigEntity> {
    const config = await this.prisma.reservationSlotConfig.upsert({
      where: { locationId },
      create: {
        locationId,
        slotDuration: data.slotDuration ?? 30,
        maxGuestsPerSlot: data.maxGuestsPerSlot ?? 20,
        minAdvanceHours: data.minAdvanceHours ?? 1,
        maxAdvanceDays: data.maxAdvanceDays ?? 30,
      },
      update: {
        ...(data.slotDuration !== undefined && { slotDuration: data.slotDuration }),
        ...(data.maxGuestsPerSlot !== undefined && { maxGuestsPerSlot: data.maxGuestsPerSlot }),
        ...(data.minAdvanceHours !== undefined && { minAdvanceHours: data.minAdvanceHours }),
        ...(data.maxAdvanceDays !== undefined && { maxAdvanceDays: data.maxAdvanceDays }),
      },
    });
    return this.map(config);
  }
}
