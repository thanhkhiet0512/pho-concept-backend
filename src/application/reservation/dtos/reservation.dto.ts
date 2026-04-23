import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min, Max, MaxLength, IsEmail, IsDateString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus, CANCELLABLE_STATUSES, ALL_STATUSES } from '@domain/reservation/entities/reservation.entity';

// ===================== PUBLIC DTOs =====================

export class CheckAvailabilityDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  locationId!: number;

  @ApiProperty({ example: '2026-04-25' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Max(50)
  partySize!: number;
}

export class CreateReservationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  locationId!: number;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(255)
  guestName!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @MaxLength(255)
  guestEmail!: string;

  @ApiProperty({ example: '+1-702-555-1234' })
  @IsString()
  @MaxLength(20)
  guestPhone!: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Max(50)
  partySize!: number;

  @ApiProperty({ example: '2026-04-25' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: '18:30' })
  @IsString()
  @MaxLength(5)
  time!: string;

  @ApiPropertyOptional({ example: 'Birthday celebration, need a window seat' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specialRequest?: string;
}

// ===================== ADMIN DTOs =====================

export class AdminCreateReservationDto extends CreateReservationDto {
  @ApiPropertyOptional({ example: 'Customer requested quiet table' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNote?: string;
}

export class UpdateReservationStatusDto {
  @ApiProperty({ enum: ALL_STATUSES, example: 'CONFIRMED' })
  @IsEnum(ALL_STATUSES as unknown as [string, ...string[]])
  status!: ReservationStatus;

  @ApiPropertyOptional({ example: 'Called to confirm, guest confirmed' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNote?: string;
}

export class ListReservationsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  locationId?: number;

  @ApiPropertyOptional({ example: '2026-04-25' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ enum: ALL_STATUSES, example: 'CONFIRMED' })
  @IsOptional()
  @IsEnum(ALL_STATUSES as unknown as [string, ...string[]])
  status?: ReservationStatus;
}

export class GetCalendarDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  locationId?: number;

  @ApiProperty({ example: '2026-04' })
  @IsString()
  month!: string; // YYYY-MM format
}

export class UpsertSlotConfigDto {
  @ApiPropertyOptional({ example: 30, description: 'Slot duration in minutes' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(120)
  slotDuration?: number;

  @ApiPropertyOptional({ example: 20, description: 'Max guests per slot' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  maxGuestsPerSlot?: number;

  @ApiPropertyOptional({ example: 1, description: 'Minimum hours in advance to book' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(24)
  minAdvanceHours?: number;

  @ApiPropertyOptional({ example: 30, description: 'Maximum days in advance to book' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  maxAdvanceDays?: number;
}
