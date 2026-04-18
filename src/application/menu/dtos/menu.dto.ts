import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min, Max, IsArray, ValidateNested, IsDefined, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({ example: 'Pho' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Phở' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameVi?: string;

  @ApiProperty({ example: 'pho-noodles' })
  @IsString()
  @MaxLength(100)
  slug!: string;

  @ApiPropertyOptional({ example: 'Traditional Vietnamese noodle soup' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'Món súp mì ý truyền thống Việt Nam' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionVi?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/category-pho.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Pho' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Phở' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameVi?: string;

  @ApiPropertyOptional({ example: 'Traditional Vietnamese noodle soup' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'Món súp mì ý truyền thống Việt Nam' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionVi?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/category-pho.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

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

  @ApiProperty({ example: 'Pho Bo' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Phở Bò' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameVi?: string;

  @ApiProperty({ example: 'pho-bo' })
  @IsString()
  @MaxLength(100)
  slug!: string;

  @ApiPropertyOptional({ example: 'Beef noodle soup with herbs' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'Món súp bò với mì và rau thơm' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionVi?: string;

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

  @ApiPropertyOptional({ example: 'Pho Bo' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Phở Bò' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameVi?: string;

  @ApiPropertyOptional({ example: 'pho-bo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ example: 'Beef noodle soup with herbs' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'Món súp bò với mì và rau thơm' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionVi?: string;

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
