import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min, IsArray, ValidateNested, IsDefined, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class I18nFieldDto {
  @ApiProperty({ example: 'Pho' })
  @IsString()
  @MaxLength(255)
  en!: string;

  @ApiPropertyOptional({ example: 'Phở' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  vi?: string;
}

export class MenuItemPriceDto {
  @ApiPropertyOptional({ example: 'S' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sizeLabel?: string;

  @ApiProperty({ example: 12.99 })
  @IsDefined()
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'pho-noodles' })
  @IsString()
  @MaxLength(100)
  slug!: string;

  @ApiProperty({ type: I18nFieldDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  nameI18n!: I18nFieldDto;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  nameI18n?: I18nFieldDto;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateMenuItemDto {
  @ApiProperty({ example: 1 })
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiProperty({ example: 'pho-bo' })
  @IsString()
  @MaxLength(100)
  slug!: string;

  @ApiProperty({ type: I18nFieldDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  nameI18n!: I18nFieldDto;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  descriptionI18n?: I18nFieldDto;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/pho-bo.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiPropertyOptional({ example: 'pho-bo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  nameI18n?: I18nFieldDto;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  descriptionI18n?: I18nFieldDto;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/pho-bo.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateMenuItemPricesDto {
  @ApiProperty({ example: 1 })
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  locationId!: number;

  @ApiProperty({ type: [MenuItemPriceDto] })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemPriceDto)
  prices!: MenuItemPriceDto[];
}
