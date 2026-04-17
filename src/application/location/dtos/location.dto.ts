import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber, Min, Max, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationHourDto {
  @ApiProperty({ example: 1, description: 'Day of week (0=Sunday, 6=Saturday)' })
  @IsDefined()
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: '08:00' })
  @IsDefined()
  @IsString()
  openTime!: string;

  @ApiProperty({ example: '18:00' })
  @IsDefined()
  @IsString()
  closeTime!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class CreateLocationDto {
  @ApiProperty({ example: 'ho-chi-minh-city' })
  @IsDefined()
  @IsString()
  slug!: string;

  @ApiProperty({ example: 'Pho Concept Ho Chi Minh' })
  @IsDefined()
  @IsString()
  name!: string;

  @ApiProperty({ example: '123 Nguyen Trai Street' })
  @IsDefined()
  @IsString()
  address!: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  @IsDefined()
  @IsString()
  city!: string;

  @ApiProperty({ example: 'District 1' })
  @IsDefined()
  @IsString()
  state!: string;

  @ApiProperty({ example: '700000' })
  @IsDefined()
  @IsString()
  zip!: string;

  @ApiPropertyOptional({ example: '+84 28 1234 5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@phoconcept.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ default: 'Asia/Ho_Chi_Minh' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [LocationHourDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationHourDto)
  hours?: LocationHourDto[];
}

export class UpdateLocationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;
}
