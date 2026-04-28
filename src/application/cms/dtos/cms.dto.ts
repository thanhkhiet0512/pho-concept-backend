import {
  IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min, Max, IsArray, IsObject, ValidateNested,
  IsDefined, MaxLength, IsEnum, IsIn, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { I18nFieldDto } from '@application/menu/dtos/menu.dto';

// ===================== POST CATEGORY DTOs =====================

export class CreatePostCategoryDto {
  @ApiProperty({ example: 'news' })
  @IsString()
  @MaxLength(255)
  slug!: string;

  @ApiProperty({ type: I18nFieldDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  nameI18n!: I18nFieldDto;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePostCategoryDto {
  @ApiPropertyOptional({ example: 'news' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  nameI18n?: I18nFieldDto;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TogglePostCategoryDto {
  @ApiProperty()
  @IsDefined()
  @IsBoolean()
  isActive!: boolean;
}

export class CmsPageSectionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  sections?: Record<string, unknown>[];
}

// ===================== CMS PAGE DTOs =====================

export class CreateCmsPageDto {
  @ApiProperty({ example: 'about-us' })
  @IsString()
  @MaxLength(255)
  slug!: string;

  @ApiProperty({ type: I18nFieldDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  titleI18n!: I18nFieldDto;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  metaDescriptionI18n?: I18nFieldDto;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/og.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImageUrl?: string;

  @ApiPropertyOptional({ type: [Object], description: 'Homepage Builder section blocks' })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  sections?: Record<string, unknown>[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateCmsPageDto {
  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  titleI18n?: I18nFieldDto;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  metaDescriptionI18n?: I18nFieldDto;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/og.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImageUrl?: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  sections?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class PublishCmsPageDto {
  @ApiProperty({ default: true })
  @IsDefined()
  @IsBoolean()
  isPublished!: boolean;
}

// ===================== BLOG POST DTOs =====================

export class CreateBlogPostDto {
  @ApiProperty({ example: 'celebrating-vietnamese-new-year' })
  @IsString()
  @MaxLength(255)
  slug!: string;

  @ApiProperty({ type: I18nFieldDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  titleI18n!: I18nFieldDto;

  @ApiProperty({ type: I18nFieldDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  contentI18n!: I18nFieldDto;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  excerptI18n?: I18nFieldDto;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  metaDescriptionI18n?: I18nFieldDto;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/blog-cover.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string;

  @ApiPropertyOptional({ type: [String], description: 'Array of media IDs or URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImageIds?: string[];

  @ApiPropertyOptional({ example: 'Ngoc Vu' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  author?: string;

  @ApiPropertyOptional({ example: 'https://example.com/article' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  externalLink?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=xxx' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  videoUrl?: string;

  @ApiPropertyOptional({ example: '5 min' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readTime?: string;

  @ApiPropertyOptional({ example: '12.4k' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  views?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 23, description: 'Day of month (1-31) to set as publishedAt' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  publishDay?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;
}

export class UpdateBlogPostDto {
  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  titleI18n?: I18nFieldDto;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  contentI18n?: I18nFieldDto;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  excerptI18n?: I18nFieldDto;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  metaDescriptionI18n?: I18nFieldDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImageIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  author?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  externalLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  views?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 23 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  publishDay?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  categoryId?: number | null;
}

export class UpdateBlogPostStatusDto {
  @ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'] })
  @IsDefined()
  @IsIn(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'])
  status!: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

  @ApiPropertyOptional({ example: 23, description: 'Required when status=SCHEDULED' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  publishDay?: number;
}

export class ToggleBlogPostFeaturedDto {
  @ApiProperty()
  @IsDefined()
  @IsBoolean()
  isFeatured!: boolean;
}

// ===================== EVENT DTOs =====================

export class CreateEventDto {
  @ApiProperty({ type: I18nFieldDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  titleI18n!: I18nFieldDto;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  descriptionI18n?: I18nFieldDto;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/event-cover.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string;

  @ApiProperty({ example: '2026-05-01' })
  @IsDefined()
  @IsDateString()
  eventDate!: string;

  @ApiPropertyOptional({ example: '2026-05-03' })
  @IsOptional()
  @IsDateString()
  eventEndDate?: string;

  @ApiProperty({ enum: ['PROMOTION', 'HOLIDAY', 'SPECIAL_EVENT'] })
  @IsDefined()
  @IsEnum({ PROMOTION: 'PROMOTION', HOLIDAY: 'HOLIDAY', SPECIAL_EVENT: 'SPECIAL_EVENT' })
  eventType!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateEventDto {
  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  titleI18n?: I18nFieldDto;

  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  descriptionI18n?: I18nFieldDto;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/event-cover.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiPropertyOptional({ example: '2026-05-03' })
  @IsOptional()
  @IsDateString()
  eventEndDate?: string;

  @ApiPropertyOptional({ enum: ['PROMOTION', 'HOLIDAY', 'SPECIAL_EVENT'] })
  @IsOptional()
  @IsEnum({ PROMOTION: 'PROMOTION', HOLIDAY: 'HOLIDAY', SPECIAL_EVENT: 'SPECIAL_EVENT' })
  eventType?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ToggleEventFeaturedDto {
  @ApiProperty({ default: true })
  @IsDefined()
  @IsBoolean()
  isFeatured!: boolean;
}

// ===================== MEDIA FILE DTOs =====================

export class UpdateMediaFileDto {
  @ApiPropertyOptional({ type: I18nFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => I18nFieldDto)
  altTextI18n?: I18nFieldDto;

  @ApiPropertyOptional({ example: 'Banner image' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'banners' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  folder?: string;
}
