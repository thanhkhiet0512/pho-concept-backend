import { I18nFieldResponseDto } from '@presentation/menu/dtos/response/menu-response.dto';
import { CmsPageEntity, BlogPostEntity, EventEntity, MediaFileEntity } from '@domain/cms/entities/cms.entity';

export class CmsPageResponseDto {
  id!: number;
  slug!: string;
  titleI18n!: I18nFieldResponseDto;
  metaDescriptionI18n!: I18nFieldResponseDto | null;
  ogImageUrl!: string | null;
  sections!: unknown[];
  isPublished!: boolean;
  createdAt!: string;
  updatedAt!: string;

  static from(entity: CmsPageEntity): CmsPageResponseDto {
    const dto = new CmsPageResponseDto();
    dto.id = Number(entity.id);
    dto.slug = entity.slug;
    dto.titleI18n = I18nFieldResponseDto.from(entity.titleI18n);
    dto.metaDescriptionI18n = entity.metaDescriptionI18n
      ? I18nFieldResponseDto.from(entity.metaDescriptionI18n)
      : null;
    dto.ogImageUrl = entity.ogImageUrl;
    dto.sections = entity.sections;
    dto.isPublished = entity.isPublished;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }

  static fromList(entities: CmsPageEntity[]): CmsPageResponseDto[] {
    return entities.map((e) => CmsPageResponseDto.from(e));
  }
}

export class BlogPostResponseDto {
  id!: number;
  slug!: string;
  titleI18n!: I18nFieldResponseDto;
  contentI18n!: I18nFieldResponseDto;
  excerptI18n!: I18nFieldResponseDto | null;
  metaDescriptionI18n!: I18nFieldResponseDto | null;
  coverImageUrl!: string | null;
  status!: string;
  publishedAt!: string | null;
  createdAt!: string;
  updatedAt!: string;

  static from(entity: BlogPostEntity): BlogPostResponseDto {
    const dto = new BlogPostResponseDto();
    dto.id = Number(entity.id);
    dto.slug = entity.slug;
    dto.titleI18n = I18nFieldResponseDto.from(entity.titleI18n);
    dto.contentI18n = I18nFieldResponseDto.from(entity.contentI18n);
    dto.excerptI18n = entity.excerptI18n
      ? I18nFieldResponseDto.from(entity.excerptI18n)
      : null;
    dto.metaDescriptionI18n = entity.metaDescriptionI18n
      ? I18nFieldResponseDto.from(entity.metaDescriptionI18n)
      : null;
    dto.coverImageUrl = entity.coverImageUrl;
    dto.status = entity.status;
    dto.publishedAt = entity.publishedAt?.toISOString() ?? null;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }

  static fromList(entities: BlogPostEntity[]): BlogPostResponseDto[] {
    return entities.map((e) => BlogPostResponseDto.from(e));
  }
}

export class EventResponseDto {
  id!: number;
  titleI18n!: I18nFieldResponseDto;
  descriptionI18n!: I18nFieldResponseDto | null;
  coverImageUrl!: string | null;
  eventDate!: string;
  eventEndDate!: string | null;
  eventType!: string;
  isFeatured!: boolean;
  isActive!: boolean;
  createdAt!: string;
  updatedAt!: string;

  static from(entity: EventEntity): EventResponseDto {
    const dto = new EventResponseDto();
    dto.id = Number(entity.id);
    dto.titleI18n = I18nFieldResponseDto.from(entity.titleI18n);
    dto.descriptionI18n = entity.descriptionI18n
      ? I18nFieldResponseDto.from(entity.descriptionI18n)
      : null;
    dto.coverImageUrl = entity.coverImageUrl;
    dto.eventDate = entity.eventDate.toISOString().split('T')[0] ?? '';
    dto.eventEndDate = entity.eventEndDate?.toISOString().split('T')[0] ?? null;
    dto.eventType = entity.eventType;
    dto.isFeatured = entity.isFeatured;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }

  static fromList(entities: EventEntity[]): EventResponseDto[] {
    return entities.map((e) => EventResponseDto.from(e));
  }
}

export class MediaFileResponseDto {
  id!: number;
  filename!: string;
  r2Key!: string;
  url!: string;
  mimeType!: string;
  sizeBytes!: number;
  altTextI18n!: I18nFieldResponseDto | null;
  uploadedBy!: number;
  createdAt!: string;

  static from(entity: MediaFileEntity): MediaFileResponseDto {
    const dto = new MediaFileResponseDto();
    dto.id = Number(entity.id);
    dto.filename = entity.filename;
    dto.r2Key = entity.r2Key;
    dto.url = entity.url;
    dto.mimeType = entity.mimeType;
    dto.sizeBytes = Number(entity.sizeBytes);
    dto.altTextI18n = entity.altTextI18n
      ? I18nFieldResponseDto.from(entity.altTextI18n)
      : null;
    dto.uploadedBy = Number(entity.uploadedBy);
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }

  static fromList(entities: MediaFileEntity[]): MediaFileResponseDto[] {
    return entities.map((e) => MediaFileResponseDto.from(e));
  }
}
