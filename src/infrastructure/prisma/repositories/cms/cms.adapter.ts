import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  CmsPageRepositoryPort,
  BlogPostRepositoryPort,
  EventRepositoryPort,
  MediaFileRepositoryPort,
  CreateCmsPageData,
  UpdateCmsPageData,
  CreateBlogPostData,
  UpdateBlogPostData,
  CreateEventData,
  UpdateEventData,
  CreateMediaFileData,
  UpdateMediaFileData,
  PaginationParams,
  PaginatedResult,
} from '@domain/cms/ports/cms.repository.port';
import {
  CmsPageEntity,
  BlogPostEntity,
  BlogPostStatus as DomainBlogPostStatus,
  EventEntity,
  EventType as DomainEventType,
  MediaFileEntity,
} from '@domain/cms/ports/cms.repository.port';
import { I18nField } from '@domain/menu/entities/menu.entity';

function toI18n(raw: unknown): I18nField {
  if (raw && typeof raw === 'object' && 'en' in raw) {
    const obj = raw as Record<string, unknown>;
    return { en: String(obj.en ?? ''), vi: obj.vi ? String(obj.vi) : undefined };
  }
  return { en: '' };
}

function toI18nOrNull(raw: unknown): I18nField | null {
  if (!raw) return null;
  return toI18n(raw);
}

function toSections(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  return [];
}

// ==================== CMS PAGE ADAPTER ====================

@Injectable()
export class CmsPageAdapter implements CmsPageRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(data: {
    id: bigint; slug: string; titleI18n: unknown; metaDescriptionI18n: unknown;
    ogImageUrl: string | null; sections: unknown; isPublished: boolean;
    createdAt: Date; updatedAt: Date;
  }): CmsPageEntity {
    return CmsPageEntity.reconstitute({
      id: data.id,
      slug: data.slug,
      titleI18n: toI18n(data.titleI18n),
      metaDescriptionI18n: toI18nOrNull(data.metaDescriptionI18n),
      ogImageUrl: data.ogImageUrl,
      sections: toSections(data.sections),
      isPublished: data.isPublished,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResult<CmsPageEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [pages, total] = await Promise.all([
      this.prisma.cmsPage.findMany({
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.cmsPage.count(),
    ]);

    return { data: pages.map((p) => this.map(p)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: bigint): Promise<CmsPageEntity | null> {
    const page = await this.prisma.cmsPage.findUnique({ where: { id } });
    return page ? this.map(page) : null;
  }

  async findBySlug(slug: string): Promise<CmsPageEntity | null> {
    const page = await this.prisma.cmsPage.findUnique({ where: { slug } });
    return page ? this.map(page) : null;
  }

  async findPublishedBySlug(slug: string): Promise<CmsPageEntity | null> {
    const page = await this.prisma.cmsPage.findFirst({ where: { slug, isPublished: true } });
    return page ? this.map(page) : null;
  }

  async create(data: CreateCmsPageData): Promise<CmsPageEntity> {
    const page = await this.prisma.cmsPage.create({
      data: {
        slug: data.slug,
        titleI18n: data.titleI18n as unknown as Prisma.InputJsonValue,
        metaDescriptionI18n: data.metaDescriptionI18n
          ? (data.metaDescriptionI18n as unknown as Prisma.InputJsonValue)
          : undefined,
        ogImageUrl: data.ogImageUrl,
        sections: (data.sections ?? []) as unknown as Prisma.InputJsonValue,
        isPublished: data.isPublished ?? false,
      },
    });
    return this.map(page);
  }

  async update(id: bigint, data: UpdateCmsPageData): Promise<CmsPageEntity> {
    const updateData: Prisma.CmsPageUncheckedUpdateInput = {};
    if (data.titleI18n !== undefined) updateData.titleI18n = data.titleI18n as unknown as Prisma.InputJsonValue;
    if (data.metaDescriptionI18n !== undefined) {
      updateData.metaDescriptionI18n = data.metaDescriptionI18n
        ? (data.metaDescriptionI18n as unknown as Prisma.InputJsonValue)
        : Prisma.DbNull;
    }
    if (data.ogImageUrl !== undefined) updateData.ogImageUrl = data.ogImageUrl;
    if (data.sections !== undefined) updateData.sections = data.sections as unknown as Prisma.InputJsonValue;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
    const page = await this.prisma.cmsPage.update({ where: { id }, data: updateData });
    return this.map(page);
  }

  async togglePublish(id: bigint, isPublished: boolean): Promise<CmsPageEntity> {
    const page = await this.prisma.cmsPage.update({ where: { id }, data: { isPublished } });
    return this.map(page);
  }
}

// ==================== BLOG POST ADAPTER ====================

@Injectable()
export class BlogPostAdapter implements BlogPostRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(data: {
    id: bigint; slug: string; titleI18n: unknown; contentI18n: unknown;
    excerptI18n: unknown; metaDescriptionI18n: unknown; coverImageUrl: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; publishedAt: Date | null;
    createdAt: Date; updatedAt: Date;
  }): BlogPostEntity {
    return BlogPostEntity.reconstitute({
      id: data.id,
      slug: data.slug,
      titleI18n: toI18n(data.titleI18n),
      contentI18n: toI18n(data.contentI18n),
      excerptI18n: toI18nOrNull(data.excerptI18n),
      metaDescriptionI18n: toI18nOrNull(data.metaDescriptionI18n),
      coverImageUrl: data.coverImageUrl,
      status: DomainBlogPostStatus[data.status],
      publishedAt: data.publishedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findAll(params?: PaginationParams & { status?: DomainBlogPostStatus }): Promise<PaginatedResult<BlogPostEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (params?.status) where.status = params.status;

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { data: posts.map((p) => this.map(p)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findPublished(params?: PaginationParams): Promise<PaginatedResult<BlogPostEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return { data: posts.map((p) => this.map(p)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: bigint): Promise<BlogPostEntity | null> {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    return post ? this.map(post) : null;
  }

  async findBySlug(slug: string): Promise<BlogPostEntity | null> {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    return post ? this.map(post) : null;
  }

  async create(data: CreateBlogPostData): Promise<BlogPostEntity> {
    const post = await this.prisma.blogPost.create({
      data: {
        slug: data.slug,
        titleI18n: data.titleI18n as unknown as Prisma.InputJsonValue,
        contentI18n: data.contentI18n as unknown as Prisma.InputJsonValue,
        excerptI18n: data.excerptI18n
          ? (data.excerptI18n as unknown as Prisma.InputJsonValue)
          : undefined,
        metaDescriptionI18n: data.metaDescriptionI18n
          ? (data.metaDescriptionI18n as unknown as Prisma.InputJsonValue)
          : undefined,
        coverImageUrl: data.coverImageUrl,
        status: data.status ? BlogPostStatusToPrisma(data.status) : 'DRAFT',
      },
    });
    return this.map(post);
  }

  async update(id: bigint, data: UpdateBlogPostData): Promise<BlogPostEntity> {
    const updateData: Prisma.BlogPostUncheckedUpdateInput = {};
    if (data.titleI18n !== undefined) updateData.titleI18n = data.titleI18n as unknown as Prisma.InputJsonValue;
    if (data.contentI18n !== undefined) updateData.contentI18n = data.contentI18n as unknown as Prisma.InputJsonValue;
    if (data.excerptI18n !== undefined) {
      updateData.excerptI18n = data.excerptI18n
        ? (data.excerptI18n as unknown as Prisma.InputJsonValue)
        : Prisma.DbNull;
    }
    if (data.metaDescriptionI18n !== undefined) {
      updateData.metaDescriptionI18n = data.metaDescriptionI18n
        ? (data.metaDescriptionI18n as unknown as Prisma.InputJsonValue)
        : Prisma.DbNull;
    }
    if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl;
    if (data.status !== undefined) updateData.status = BlogPostStatusToPrisma(data.status);
    const post = await this.prisma.blogPost.update({ where: { id }, data: updateData });
    return this.map(post);
  }

  async updateStatus(id: bigint, status: DomainBlogPostStatus): Promise<BlogPostEntity> {
    const publishedAt = status === DomainBlogPostStatus.PUBLISHED ? new Date() : undefined;
    const post = await this.prisma.blogPost.update({
      where: { id },
      data: {
        status: BlogPostStatusToPrisma(status),
        publishedAt: publishedAt ?? undefined,
      },
    });
    return this.map(post);
  }

  async hardDelete(id: bigint): Promise<void> {
    await this.prisma.blogPost.delete({ where: { id } });
  }
}

function BlogPostStatusToPrisma(status: DomainBlogPostStatus): 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' {
  return status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

// ==================== EVENT ADAPTER ====================

@Injectable()
export class EventAdapter implements EventRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(data: {
    id: bigint; titleI18n: unknown; descriptionI18n: unknown;
    coverImageUrl: string | null; eventDate: Date; eventEndDate: Date | null;
    eventType: 'PROMOTION' | 'HOLIDAY' | 'SPECIAL_EVENT'; isFeatured: boolean;
    isActive: boolean; createdAt: Date; updatedAt: Date;
  }): EventEntity {
    return EventEntity.reconstitute({
      id: data.id,
      titleI18n: toI18n(data.titleI18n),
      descriptionI18n: toI18nOrNull(data.descriptionI18n),
      coverImageUrl: data.coverImageUrl,
      eventDate: data.eventDate,
      eventEndDate: data.eventEndDate,
      eventType: DomainEventType[data.eventType],
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findAll(
    params?: PaginationParams & { isActive?: boolean; isFeatured?: boolean; upcoming?: boolean },
  ): Promise<PaginatedResult<EventEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (params?.isActive !== undefined) where.isActive = params.isActive;
    if (params?.isFeatured !== undefined) where.isFeatured = params.isFeatured;
    if (params?.upcoming) where.eventDate = { gte: new Date() };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { eventDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data: events.map((e) => this.map(e)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findActive(
    params?: PaginationParams & { isFeatured?: boolean; upcoming?: boolean },
  ): Promise<PaginatedResult<EventEntity>> {
    return this.findAll({ ...params, isActive: true });
  }

  async findById(id: bigint): Promise<EventEntity | null> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    return event ? this.map(event) : null;
  }

  async create(data: CreateEventData): Promise<EventEntity> {
    const event = await this.prisma.event.create({
      data: {
        titleI18n: data.titleI18n as unknown as Prisma.InputJsonValue,
        descriptionI18n: data.descriptionI18n
          ? (data.descriptionI18n as unknown as Prisma.InputJsonValue)
          : undefined,
        coverImageUrl: data.coverImageUrl,
        eventDate: data.eventDate,
        eventEndDate: data.eventEndDate,
        eventType: EventTypeToPrisma(data.eventType),
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
      },
    });
    return this.map(event);
  }

  async update(id: bigint, data: UpdateEventData): Promise<EventEntity> {
    const updateData: Prisma.EventUncheckedUpdateInput = {};
    if (data.titleI18n !== undefined) updateData.titleI18n = data.titleI18n as unknown as Prisma.InputJsonValue;
    if (data.descriptionI18n !== undefined) {
      updateData.descriptionI18n = data.descriptionI18n
        ? (data.descriptionI18n as unknown as Prisma.InputJsonValue)
        : Prisma.DbNull;
    }
    if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl;
    if (data.eventDate !== undefined) updateData.eventDate = data.eventDate;
    if (data.eventEndDate !== undefined) updateData.eventEndDate = data.eventEndDate;
    if (data.eventType !== undefined) updateData.eventType = EventTypeToPrisma(data.eventType);
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    const event = await this.prisma.event.update({ where: { id }, data: updateData });
    return this.map(event);
  }

  async toggleFeatured(id: bigint, isFeatured: boolean): Promise<EventEntity> {
    const event = await this.prisma.event.update({ where: { id }, data: { isFeatured } });
    return this.map(event);
  }

  async hardDelete(id: bigint): Promise<void> {
    await this.prisma.event.delete({ where: { id } });
  }
}

function EventTypeToPrisma(type: DomainEventType): 'PROMOTION' | 'HOLIDAY' | 'SPECIAL_EVENT' {
  return type as 'PROMOTION' | 'HOLIDAY' | 'SPECIAL_EVENT';
}

// ==================== MEDIA FILE ADAPTER ====================

@Injectable()
export class MediaFileAdapter implements MediaFileRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(data: {
    id: bigint; filename: string; r2Key: string; url: string;
    mimeType: string; sizeBytes: bigint; altTextI18n: unknown;
    uploadedBy: bigint; createdAt: Date;
  }): MediaFileEntity {
    return MediaFileEntity.reconstitute({
      id: data.id,
      filename: data.filename,
      r2Key: data.r2Key,
      url: data.url,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      altTextI18n: toI18nOrNull(data.altTextI18n),
      uploadedBy: data.uploadedBy,
      createdAt: data.createdAt,
    });
  }

  async findAll(params?: PaginationParams & { mimeType?: string }): Promise<PaginatedResult<MediaFileEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (params?.mimeType) where.mimeType = { startsWith: params.mimeType };

    const [files, total] = await Promise.all([
      this.prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.mediaFile.count({ where }),
    ]);

    return { data: files.map((f) => this.map(f)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: bigint): Promise<MediaFileEntity | null> {
    const file = await this.prisma.mediaFile.findUnique({ where: { id } });
    return file ? this.map(file) : null;
  }

  async create(data: CreateMediaFileData): Promise<MediaFileEntity> {
    const file = await this.prisma.mediaFile.create({
      data: {
        filename: data.filename,
        r2Key: data.r2Key,
        url: data.url,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        altTextI18n: data.altTextI18n
          ? (data.altTextI18n as unknown as Prisma.InputJsonValue)
          : undefined,
        uploadedBy: data.uploadedBy,
      },
    });
    return this.map(file);
  }

  async update(id: bigint, data: UpdateMediaFileData): Promise<MediaFileEntity> {
    const updateData: Prisma.MediaFileUncheckedUpdateInput = {};
    if (data.altTextI18n !== undefined) {
      updateData.altTextI18n = data.altTextI18n
        ? (data.altTextI18n as unknown as Prisma.InputJsonValue)
        : Prisma.DbNull;
    }
    const file = await this.prisma.mediaFile.update({ where: { id }, data: updateData });
    return this.map(file);
  }

  async hardDelete(id: bigint): Promise<MediaFileEntity> {
    const file = await this.prisma.mediaFile.delete({ where: { id } });
    return this.map(file);
  }
}
