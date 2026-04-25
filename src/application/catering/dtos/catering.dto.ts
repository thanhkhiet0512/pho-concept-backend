import {
  IsString, IsOptional, IsInt, IsNumber, IsEmail, IsDateString,
  IsEnum, IsArray, ValidateNested, MaxLength, Min, Max, Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CateringStatus } from '@prisma/client';

export const ALL_STATUSES: CateringStatus[] = [
  'INQUIRY', 'QUOTED', 'DEPOSIT_PAID', 'CONFIRMED', 'COMPLETED', 'CANCELLED',
];

// ─── Public ──────────────────────────────────────────────────────────

export class SubmitCateringInquiryDto {
  @ApiProperty({ example: 1 })
  @IsInt() @Min(1)
  locationId!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsInt() @Min(1)
  packageId?: number;

  @ApiProperty({ example: 'John Doe' })
  @IsString() @MaxLength(255)
  contactName!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail() @MaxLength(255)
  contactEmail!: string;

  @ApiProperty({ example: '+17025551234' })
  @IsString() @MaxLength(20)
  contactPhone!: string;

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  eventDate!: string;

  @ApiProperty({ example: '18:00' })
  @IsString() @Matches(/^\d{2}:\d{2}$/)
  eventTime!: string;

  @ApiProperty({ example: 50 })
  @IsInt() @Min(5) @Max(500)
  guestCount!: number;

  @ApiPropertyOptional({ example: 'Their backyard in Summerlin' })
  @IsOptional() @IsString() @MaxLength(500)
  venue?: string;

  @ApiPropertyOptional({ example: 'No pork, please' })
  @IsOptional() @IsString() @MaxLength(2000)
  specialRequest?: string;
}

// ─── Admin — Quote ────────────────────────────────────────────────────

export class QuoteLineItemDto {
  @ApiPropertyOptional({ example: 3 })
  @IsOptional() @IsInt() @Min(1)
  menuItemId?: number;

  @ApiPropertyOptional({ example: 'Custom Dessert Platter' })
  @IsOptional() @IsString() @MaxLength(255)
  customName?: string;

  @ApiProperty({ example: 50 })
  @IsInt() @Min(1)
  quantity!: number;

  @ApiProperty({ example: 18.5 })
  @IsNumber() @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ example: 'Large portions' })
  @IsOptional() @IsString() @MaxLength(500)
  note?: string;
}

export class QuoteCateringRequestDto {
  @ApiProperty({ example: 950 })
  @IsNumber() @Min(0)
  quotedAmount!: number;

  @ApiProperty({ example: 200 })
  @IsNumber() @Min(0)
  depositAmount!: number;

  @ApiProperty({ example: 7, description: 'Days until quote expires' })
  @IsInt() @Min(1) @Max(30)
  quotationDeadlineDays!: number;

  @ApiProperty({ type: [QuoteLineItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => QuoteLineItemDto)
  items!: QuoteLineItemDto[];

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(2000)
  internalNote?: string;
}

// ─── Admin — Status ───────────────────────────────────────────────────

export class UpdateCateringStatusDto {
  @ApiProperty({ enum: ALL_STATUSES })
  @IsEnum(ALL_STATUSES as unknown as [string, ...string[]])
  status!: CateringStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(2000)
  internalNote?: string;
}

// ─── Admin — List ─────────────────────────────────────────────────────

export class ListCateringRequestsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ALL_STATUSES })
  @IsOptional() @IsEnum(ALL_STATUSES as unknown as [string, ...string[]])
  status?: CateringStatus;

  @ApiPropertyOptional({ example: '2026-06-15' })
  @IsOptional() @IsDateString()
  eventDate?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  locationId?: number;
}
