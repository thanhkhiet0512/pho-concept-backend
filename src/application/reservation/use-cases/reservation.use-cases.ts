import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReservationRepositoryPort, SlotConfigRepositoryPort } from '@domain/reservation/ports/reservation.repository.port';
import { RESERVATION_REPOSITORY_TOKEN, SLOT_CONFIG_REPOSITORY_TOKEN } from '@domain/reservation/ports/reservation.repository.token';
import { LocationRepositoryPort } from '@domain/location/ports/location.repository.port';
import { LOCATION_REPOSITORY_TOKEN } from '@domain/location/ports/location.repository.token';
import { LocationHourEntity } from '@domain/location/entities/location-hour.entity';
import {
  ReservationEntity,
  ReservationStatus,
  SlotConfigEntity,
  ACTIVE_STATUSES,
  CANCELLABLE_STATUSES,
} from '@domain/reservation/entities/reservation.entity';
import {
  CheckAvailabilityDto,
  CreateReservationDto,
  AdminCreateReservationDto,
  UpdateReservationStatusDto,
  ListReservationsDto,
  GetCalendarDto,
  UpsertSlotConfigDto,
} from '@application/reservation/dtos/reservation.dto';
import { PaginatedResult } from '@domain/reservation/ports/reservation.repository.port';

const VALID_RESERVATION_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  PENDING:   ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['SEATED', 'CANCELLED', 'NO_SHOW'],
  SEATED:    ['COMPLETED', 'NO_SHOW'],
  COMPLETED: [],
  NO_SHOW:   [],
  CANCELLED: [],
};

// ===================== AVAILABILITY ENGINE =====================

export interface TimeSlotResult {
  time: string;
  availableSeats: number;
  isAvailable: boolean;
}

@Injectable()
export class CheckAvailabilityUseCase {
  constructor(
    @Inject(SLOT_CONFIG_REPOSITORY_TOKEN)
    private readonly slotConfigRepository: SlotConfigRepositoryPort,
    @Inject(LOCATION_REPOSITORY_TOKEN)
    private readonly locationRepository: LocationRepositoryPort,
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(dto: CheckAvailabilityDto): Promise<{ slots: TimeSlotResult[]; date: string; locationId: number; partySize: number }> {
    const locationId = BigInt(dto.locationId);
    const requestedDate = new Date(dto.date);
    const partySize = dto.partySize;

    // 1. Load SlotConfig
    const slotConfig = await this.slotConfigRepository.findByLocationId(locationId);
    if (!slotConfig) {
      throw new BadRequestException(`No reservation slot configuration found for this location`);
    }

    // 2. Load Location with hours
    const location = await this.locationRepository.findById(locationId);
    if (!location) {
      throw new NotFoundException(`Location with id ${dto.locationId} not found`);
    }

    // Check if location is active
    if (!location.isActive) {
      throw new BadRequestException(`Location is not currently accepting reservations`);
    }

    // 3. Get hours for requested day
    const dayOfWeek = requestedDate.getDay(); // 0 = Sunday, 6 = Saturday
    const hoursForDay = location.hours.find((h: LocationHourEntity) => h.dayOfWeek === dayOfWeek);

    if (!hoursForDay || !hoursForDay.isOpen) {
      return { slots: [], date: dto.date, locationId: dto.locationId, partySize };
    }

    // 4. Validate advance booking constraints
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + slotConfig.minAdvanceHours * 60 * 60 * 1000);
    const maxBookingDate = new Date(now.getTime() + slotConfig.maxAdvanceDays * 24 * 60 * 60 * 1000);

    if (requestedDate > maxBookingDate) {
      throw new BadRequestException(`Cannot book more than ${slotConfig.maxAdvanceDays} days in advance`);
    }

    // 5. Generate time slots
    const slots = this.generateTimeSlots(
      hoursForDay.openTime,
      hoursForDay.closeTime,
      slotConfig.slotDuration,
      slotConfig.maxGuestsPerSlot,
      partySize,
      minBookingTime,
      requestedDate,
    );

    // 6. Load existing reservations for this date
    const reservations = await this.reservationRepository.findAll({
      locationId,
      date: requestedDate,
      page: 1,
      limit: 1000,
    });

    // Filter to only active reservations (not cancelled, not completed, not no-show)
    const activeReservations = reservations.data.filter((r: ReservationEntity) =>
      ACTIVE_STATUSES.includes(r.status),
    );

    // 7. Calculate availability for each slot
    const slotsWithAvailability = slots.map((slot) => {
      const reservationsInSlot = activeReservations.filter(
        (r: ReservationEntity) => r.reservationTime === slot.time,
      );
      const bookedGuests = reservationsInSlot.reduce(
        (sum: number, r: ReservationEntity) => sum + r.partySize,
        0,
      );
      const availableSeats = Math.max(0, slotConfig.maxGuestsPerSlot - bookedGuests);
      const isAvailable = availableSeats >= partySize;

      return {
        time: slot.time,
        availableSeats,
        isAvailable,
      };
    });

    return {
      slots: slotsWithAvailability,
      date: dto.date,
      locationId: dto.locationId,
      partySize,
    };
  }

  private generateTimeSlots(
    openTime: string,
    closeTime: string,
    slotDuration: number,
    maxGuests: number,
    partySize: number,
    minBookingTime: Date,
    requestedDate: Date,
  ): { time: string; canBook: boolean }[] {
    const slots: { time: string; canBook: boolean }[] = [];

    const [openHourStr = '0', openMinStr = '0'] = openTime.split(':');
    const [closeHourStr = '23', closeMinStr = '59'] = closeTime.split(':');
    const openHour = parseInt(openHourStr, 10);
    const openMin = parseInt(openMinStr, 10);
    const closeHour = parseInt(closeHourStr, 10);
    const closeMin = parseInt(closeMinStr, 10);

    const openDate = new Date(requestedDate);
    openDate.setHours(openHour, openMin, 0, 0);

    const closeDate = new Date(requestedDate);
    closeDate.setHours(closeHour, closeMin, 0, 0);

    let current = new Date(openDate);

    while (current < closeDate) {
      const hours = current.getHours().toString().padStart(2, '0');
      const minutes = current.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      // Check if slot meets min advance hours requirement
      const isPastMinimum = current >= minBookingTime;

      slots.push({
        time: timeStr,
        canBook: isPastMinimum,
      });

      current = new Date(current.getTime() + slotDuration * 60 * 1000);
    }

    return slots;
  }
}

// ===================== CREATE RESERVATION =====================

@Injectable()
export class CreateReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepository: ReservationRepositoryPort,
    @Inject(SLOT_CONFIG_REPOSITORY_TOKEN)
    private readonly slotConfigRepository: SlotConfigRepositoryPort,
    @Inject(LOCATION_REPOSITORY_TOKEN)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async execute(dto: CreateReservationDto): Promise<ReservationEntity> {
    const locationId = BigInt(dto.locationId);
    const requestedDate = new Date(dto.date);
    requestedDate.setHours(0, 0, 0, 0);

    // 1. Validate location exists and is active
    const location = await this.locationRepository.findById(locationId);
    if (!location) {
      throw new NotFoundException(`Location with id ${dto.locationId} not found`);
    }
    if (!location.isActive) {
      throw new BadRequestException(`Location is not accepting reservations`);
    }

    // 2. Load slot config
    const slotConfig = await this.slotConfigRepository.findByLocationId(locationId);
    if (!slotConfig) {
      throw new BadRequestException(`No reservation slot configuration found`);
    }

    // 3. Validate advance booking constraints
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + slotConfig.minAdvanceHours * 60 * 60 * 1000);
    const maxBookingDate = new Date(now.getTime() + slotConfig.maxAdvanceDays * 24 * 60 * 60 * 1000);

    if (requestedDate > maxBookingDate) {
      throw new BadRequestException(`Cannot book more than ${slotConfig.maxAdvanceDays} days in advance`);
    }

    const reservationDateTime = new Date(`${dto.date}T${dto.time}`);
    if (reservationDateTime < minBookingTime) {
      throw new BadRequestException(`Must book at least ${slotConfig.minAdvanceHours} hours in advance`);
    }

    // 4. Check slot availability
    const bookedCount = await this.reservationRepository.countBySlot(locationId, requestedDate, dto.time);
    const availableSeats = slotConfig.maxGuestsPerSlot - bookedCount;

    if (availableSeats < dto.partySize) {
      throw new BadRequestException(
        `Not enough seats available. Only ${availableSeats} seats left for this time slot`,
      );
    }

    // 5. Create reservation
    const reservation = await this.reservationRepository.create({
      locationId,
      guestName: dto.guestName,
      guestEmail: dto.guestEmail,
      guestPhone: dto.guestPhone,
      partySize: dto.partySize,
      reservationDate: requestedDate,
      reservationTime: dto.time,
      specialRequest: dto.specialRequest ?? null,
    });

    return reservation;
  }
}

// ===================== GET BY TOKEN (PUBLIC) =====================

@Injectable()
export class GetReservationByTokenUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(token: string): Promise<ReservationEntity> {
    const reservation = await this.reservationRepository.findByToken(token);
    if (!reservation) {
      throw new NotFoundException(`Reservation not found`);
    }
    return reservation;
  }
}

// ===================== CANCEL BY TOKEN (PUBLIC) =====================

@Injectable()
export class CancelReservationByTokenUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(token: string): Promise<ReservationEntity> {
    const reservation = await this.reservationRepository.findByToken(token);
    if (!reservation) {
      throw new NotFoundException(`Reservation not found`);
    }

    if (!reservation.isCancellable()) {
      throw new BadRequestException(
        `Cannot cancel reservation with status "${reservation.status}"`,
      );
    }

    return this.reservationRepository.updateStatus(reservation.id, {
      status: 'CANCELLED' as ReservationStatus,
    });
  }
}

// ===================== LIST RESERVATIONS (ADMIN) =====================

@Injectable()
export class ListReservationsUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(dto: ListReservationsDto): Promise<PaginatedResult<ReservationEntity>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    return this.reservationRepository.findAll({
      locationId: dto.locationId ? BigInt(dto.locationId) : undefined,
      date: dto.date ? new Date(dto.date) : undefined,
      status: dto.status,
      page,
      limit,
    });
  }
}

// ===================== CALENDAR VIEW (ADMIN) =====================

@Injectable()
export class GetCalendarViewUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(dto: GetCalendarDto): Promise<{
    month: string;
    locationId: number | undefined;
    days: Array<{
      date: string;
      totalReservations: number;
      totalGuests: number;
      reservations: ReservationEntity[];
    }>;
  }> {
    const parts = dto.month.split('-');
    const year = parseInt(parts[0] ?? '1', 10);
    const month = parseInt(parts[1] ?? '1', 10);
    const locationId = dto.locationId ? BigInt(dto.locationId) : undefined;

    // Calculate all days in the month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const days: Array<{
      date: string;
      totalReservations: number;
      totalGuests: number;
      reservations: ReservationEntity[];
    }> = [];

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0] ?? '';
      const result = await this.reservationRepository.findAll({
        locationId,
        date: new Date(d),
        page: 1,
        limit: 1000,
      });

      days.push({
        date: dateStr,
        totalReservations: result.total,
        totalGuests: result.data.reduce((sum: number, r: ReservationEntity) => sum + r.partySize, 0),
        reservations: result.data,
      });
    }

    return {
      month: dto.month,
      locationId: dto.locationId,
      days,
    };
  }
}

// ===================== ADMIN CREATE (WALK-IN) =====================

@Injectable()
export class AdminCreateReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepository: ReservationRepositoryPort,
    @Inject(SLOT_CONFIG_REPOSITORY_TOKEN)
    private readonly slotConfigRepository: SlotConfigRepositoryPort,
    @Inject(LOCATION_REPOSITORY_TOKEN)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async execute(dto: AdminCreateReservationDto, adminId: bigint): Promise<ReservationEntity> {
    const locationId = BigInt(dto.locationId);
    const requestedDate = new Date(dto.date);
    requestedDate.setHours(0, 0, 0, 0);

    // Validate location
    const location = await this.locationRepository.findById(locationId);
    if (!location) {
      throw new NotFoundException(`Location with id ${dto.locationId} not found`);
    }

    // Check slot availability
    const slotConfig = await this.slotConfigRepository.findByLocationId(locationId);
    if (slotConfig) {
      const bookedCount = await this.reservationRepository.countBySlot(locationId, requestedDate, dto.time);
      const availableSeats = slotConfig.maxGuestsPerSlot - bookedCount;
      if (availableSeats < dto.partySize) {
        throw new BadRequestException(`Not enough seats. Only ${availableSeats} available`);
      }
    }

    return this.reservationRepository.create({
      locationId,
      guestName: dto.guestName,
      guestEmail: dto.guestEmail,
      guestPhone: dto.guestPhone,
      partySize: dto.partySize,
      reservationDate: requestedDate,
      reservationTime: dto.time,
      specialRequest: dto.specialRequest ?? null,
      createdByAdminId: adminId,
    });
  }
}

// ===================== UPDATE STATUS (ADMIN) =====================

@Injectable()
export class UpdateReservationStatusUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(id: bigint, dto: UpdateReservationStatusDto): Promise<ReservationEntity> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }

    const validTransitions = VALID_RESERVATION_TRANSITIONS[reservation.status];
    if (!validTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition reservation from "${reservation.status}" to "${dto.status}"`,
      );
    }

    return this.reservationRepository.updateStatus(id, {
      status: dto.status,
      internalNote: dto.internalNote ?? null,
    });
  }
}

// ===================== SLOT CONFIG (ADMIN) =====================

@Injectable()
export class GetSlotConfigUseCase {
  constructor(
    @Inject(SLOT_CONFIG_REPOSITORY_TOKEN)
    private readonly slotConfigRepository: SlotConfigRepositoryPort,
  ) {}

  async execute(locationId: bigint): Promise<SlotConfigEntity | null> {
    return this.slotConfigRepository.findByLocationId(locationId);
  }
}

@Injectable()
export class UpsertSlotConfigUseCase {
  constructor(
    @Inject(SLOT_CONFIG_REPOSITORY_TOKEN)
    private readonly slotConfigRepository: SlotConfigRepositoryPort,
    @Inject(LOCATION_REPOSITORY_TOKEN)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async execute(locationId: bigint, dto: UpsertSlotConfigDto): Promise<SlotConfigEntity> {
    const location = await this.locationRepository.findById(locationId);
    if (!location) {
      throw new NotFoundException(`Location with id ${locationId} not found`);
    }

    return this.slotConfigRepository.upsert(locationId, {
      slotDuration: dto.slotDuration,
      maxGuestsPerSlot: dto.maxGuestsPerSlot,
      minAdvanceHours: dto.minAdvanceHours,
      maxAdvanceDays: dto.maxAdvanceDays,
    });
  }
}
