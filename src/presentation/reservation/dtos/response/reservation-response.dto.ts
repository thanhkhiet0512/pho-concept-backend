import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus, ACTIVE_STATUSES } from '@domain/reservation/entities/reservation.entity';

export class SlotConfigResponseDto {
  @ApiProperty()
  id!: bigint;

  @ApiProperty()
  locationId!: bigint;

  @ApiProperty()
  slotDuration!: number;

  @ApiProperty()
  maxGuestsPerSlot!: number;

  @ApiProperty()
  minAdvanceHours!: number;

  @ApiProperty()
  maxAdvanceDays!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static from(entity: {
    id: bigint;
    locationId: bigint;
    slotDuration: number;
    maxGuestsPerSlot: number;
    minAdvanceHours: number;
    maxAdvanceDays: number;
    createdAt: Date;
    updatedAt: Date;
  }): SlotConfigResponseDto {
    const dto = new SlotConfigResponseDto();
    dto.id = entity.id;
    dto.locationId = entity.locationId;
    dto.slotDuration = entity.slotDuration;
    dto.maxGuestsPerSlot = entity.maxGuestsPerSlot;
    dto.minAdvanceHours = entity.minAdvanceHours;
    dto.maxAdvanceDays = entity.maxAdvanceDays;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

export class ReservationResponseDto {
  @ApiProperty()
  id!: bigint;

  @ApiProperty()
  token!: string;

  @ApiProperty()
  locationId!: bigint;

  @ApiProperty()
  guestName!: string;

  @ApiProperty()
  guestEmail!: string;

  @ApiProperty()
  guestPhone!: string;

  @ApiProperty()
  partySize!: number;

  @ApiProperty()
  reservationDate!: Date;

  @ApiProperty()
  reservationTime!: string;

  @ApiProperty({ enum: ACTIVE_STATUSES })
  status!: ReservationStatus;

  @ApiPropertyOptional()
  specialRequest?: string | null;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;

  static from(entity: {
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
    createdAt?: Date;
    updatedAt?: Date;
  }): ReservationResponseDto {
    const dto = new ReservationResponseDto();
    dto.id = entity.id;
    dto.token = entity.token;
    dto.locationId = entity.locationId;
    dto.guestName = entity.guestName;
    dto.guestEmail = entity.guestEmail;
    dto.guestPhone = entity.guestPhone;
    dto.partySize = entity.partySize;
    dto.reservationDate = entity.reservationDate;
    dto.reservationTime = entity.reservationTime;
    dto.status = entity.status;
    dto.specialRequest = entity.specialRequest;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromPublic(entity: {
    id: bigint;
    token: string;
    guestName: string;
    partySize: number;
    reservationDate: Date;
    reservationTime: string;
    status: ReservationStatus;
  }): ReservationResponseDto {
    const dto = new ReservationResponseDto();
    dto.id = entity.id;
    dto.token = entity.token;
    dto.guestName = entity.guestName;
    dto.partySize = entity.partySize;
    dto.reservationDate = entity.reservationDate;
    dto.reservationTime = entity.reservationTime;
    dto.status = entity.status;
    return dto;
  }
}

export class TimeSlotAvailabilityDto {
  @ApiProperty({ example: '18:00' })
  time!: string;

  @ApiProperty({ example: 8 })
  availableSeats!: number;

  @ApiProperty({ example: false })
  isAvailable!: boolean;
}

export class AvailabilityResponseDto {
  @ApiProperty({ type: [TimeSlotAvailabilityDto] })
  slots!: TimeSlotAvailabilityDto[];

  @ApiProperty()
  date!: string;

  @ApiProperty()
  locationId!: bigint;

  @ApiProperty()
  partySize!: number;
}

export class ReservationStatusResponseDto {
  @ApiProperty()
  token!: string;

  @ApiProperty({ enum: ACTIVE_STATUSES })
  status!: ReservationStatus;

  @ApiProperty()
  guestName!: string;

  @ApiProperty()
  partySize!: number;

  @ApiProperty()
  reservationDate!: Date;

  @ApiProperty()
  reservationTime!: string;

  @ApiProperty()
  locationId!: bigint;

  static from(entity: {
    token: string;
    status: ReservationStatus;
    guestName: string;
    partySize: number;
    reservationDate: Date;
    reservationTime: string;
    locationId: bigint;
  }): ReservationStatusResponseDto {
    const dto = new ReservationStatusResponseDto();
    dto.token = entity.token;
    dto.status = entity.status;
    dto.guestName = entity.guestName;
    dto.partySize = entity.partySize;
    dto.reservationDate = entity.reservationDate;
    dto.reservationTime = entity.reservationTime;
    dto.locationId = entity.locationId;
    return dto;
  }
}

export class CalendarDayDto {
  @ApiProperty({ example: '2026-04-25' })
  date!: string;

  @ApiProperty({ example: 12 })
  totalReservations!: number;

  @ApiProperty({ example: 45 })
  totalGuests!: number;

  @ApiProperty({ type: [ReservationResponseDto] })
  reservations!: ReservationResponseDto[];
}

export class CalendarResponseDto {
  @ApiProperty({ example: '2026-04' })
  month!: string;

  @ApiProperty({ type: [CalendarDayDto] })
  days!: CalendarDayDto[];

  @ApiProperty()
  locationId!: bigint;
}
