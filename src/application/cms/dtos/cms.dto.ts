import {
  IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min, IsArray, IsObject, ValidateNested,
  IsDefined, MaxLength, IsEnum, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { I18nFieldDto } from '@application/menu/dtos/menu.dto';

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

  @ApiPropertyOptional({ example: 'https://cdn.example.com/blog-cover.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string;
}

export class UpdateBlogPostStatusDto {
  @ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  @IsDefined()
  @IsEnum({ DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED', ARCHIVED: 'ARCHIVED' })
  status!: string;
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
}
