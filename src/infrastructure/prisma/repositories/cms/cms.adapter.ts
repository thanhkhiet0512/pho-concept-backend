import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  PostCategoryRepositoryPort,
  CmsPageRepositoryPort,
  BlogPostRepositoryPort,
  EventRepositoryPort,
  MediaFileRepositoryPort,
  CreatePostCategoryData,
  UpdatePostCategoryData,
  CreateCmsPageData,
  UpdateCmsPageData,
  CreateBlogPostData,
  UpdateBlogPostData,
  BlogPostFilterParams,
  CreateEventData,
  UpdateEventData,
  CreateMediaFileData,
  UpdateMediaFileData,
  MediaFilterParams,
  PaginationParams,
  PaginatedResult,
} from '@domain/cms/ports/cms.repository.port';
import {
  PostCategoryEntity,
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

// ==================== POST CATEGORY ADAPTER ====================

@Injectable()
export class PostCategoryAdapter implements PostCategoryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(data: {
    id: bigint; slug: string; nameI18n: unknown; sortOrder: number;
    isActive: boolean; createdAt: Date; updatedAt: Date;
  }): PostCategoryEntity {
    return PostCategoryEntity.reconstitute({
      id: data.id,
      slug: data.slug,
      nameI18n: toI18n(data.nameI18n),
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findAll(params?: PaginationParams & { isActive?: boolean; search?: string }): Promise<PaginatedResult<PostCategoryEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.PostCategoryWhereInput = {};
    if (params?.isActive !== undefined) where.isActive = params.isActive;
    if (params?.search) {
      where.OR = [
        { slug: { contains: params.search, mode: 'insensitive' } },
        { nameI18n: { path: ['en'], string_contains: params.search } },
        { nameI18n: { path: ['vi'], string_contains: params.search } },
      ];
    }

    const [categories, total] = await Promise.all([
      this.prisma.postCategory.findMany({ where, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }], skip, take: limit }),
      this.prisma.postCategory.count({ where }),
    ]);

    return { data: categories.map((c) => this.map(c)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: bigint): Promise<PostCategoryEntity | null> {
    const cat = await this.prisma.postCategory.findUnique({ where: { id } });
    return cat ? this.map(cat) : null;
  }

  async findBySlug(slug: string): Promise<PostCategoryEntity | null> {
    const cat = await this.prisma.postCategory.findUnique({ where: { slug } });
    return cat ? this.map(cat) : null;
  }

  async create(data: CreatePostCategoryData): Promise<PostCategoryEntity> {
    const cat = await this.prisma.postCategory.create({
      data: {
        slug: data.slug,
        nameI18n: data.nameI18n as unknown as Prisma.InputJsonValue,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    return this.map(cat);
  }

  async update(id: bigint, data: UpdatePostCategoryData): Promise<PostCategoryEntity> {
    const updateData: Prisma.PostCategoryUncheckedUpdateInput = {};
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.nameI18n !== undefined) updateData.nameI18n = data.nameI18n as unknown as Prisma.InputJsonValue;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    const cat = await this.prisma.postCategory.update({ where: { id }, data: updateData });
    return this.map(cat);
  }

  async toggleActive(id: bigint, isActive: boolean): Promise<PostCategoryEntity> {
    const cat = await this.prisma.postCategory.update({ where: { id }, data: { isActive } });
    return this.map(cat);
  }

  async hardDelete(id: bigint): Promise<void> {
    await this.prisma.postCategory.delete({ where: { id } });
  }
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
    galleryImageIds: unknown; author: string | null; externalLink: string | null;
    videoUrl: string | null; readTime: string | null; views: string | null;
    isFeatured: boolean; status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
    publishedAt: Date | null; categoryId: bigint | null; createdAt: Date; updatedAt: Date;
  }): BlogPostEntity {
    const galleryIds = Array.isArray(data.galleryImageIds) ? (data.galleryImageIds as string[]) : null;
    return BlogPostEntity.reconstitute({
      id: data.id,
      slug: data.slug,
      titleI18n: toI18n(data.titleI18n),
      contentI18n: toI18n(data.contentI18n),
      excerptI18n: toI18nOrNull(data.excerptI18n),
      metaDescriptionI18n: toI18nOrNull(data.metaDescriptionI18n),
      coverImageUrl: data.coverImageUrl,
      galleryImageIds: galleryIds,
      author: data.author,
      externalLink: data.externalLink,
      videoUrl: data.videoUrl,
      readTime: data.readTime,
      views: data.views,
      isFeatured: data.isFeatured,
      status: DomainBlogPostStatus[data.status],
      publishedAt: data.publishedAt,
      categoryId: data.categoryId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findAll(params?: BlogPostFilterParams): Promise<PaginatedResult<BlogPostEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.BlogPostWhereInput = {};

    if (params?.status) where.status = BlogPostStatusToPrisma(params.status);
    if (params?.categoryId) where.categoryId = params.categoryId;
    if (params?.author) where.author = { contains: params.author, mode: 'insensitive' };
    if (params?.isFeatured !== undefined) where.isFeatured = params.isFeatured;
    if (params?.publishMonth) {
      const [year, month] = params.publishMonth.split('-').map(Number);
      if (year && month) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        where.publishedAt = { gte: start, lt: end };
      }
    }
    if (params?.search) {
      where.OR = [
        { slug: { contains: params.search, mode: 'insensitive' } },
        { author: { contains: params.search, mode: 'insensitive' } },
        { titleI18n: { path: ['en'], string_contains: params.search } },
        { titleI18n: { path: ['vi'], string_contains: params.search } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { updatedAt: 'desc' }],
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
        excerptI18n: data.excerptI18n ? (data.excerptI18n as unknown as Prisma.InputJsonValue) : undefined,
        metaDescriptionI18n: data.metaDescriptionI18n ? (data.metaDescriptionI18n as unknown as Prisma.InputJsonValue) : undefined,
        coverImageUrl: data.coverImageUrl ?? null,
        galleryImageIds: data.galleryImageIds ? (data.galleryImageIds as unknown as Prisma.InputJsonValue) : undefined,
        author: data.author ?? null,
        externalLink: data.externalLink ?? null,
        videoUrl: data.videoUrl ?? null,
        readTime: data.readTime ?? null,
        views: data.views ?? null,
        isFeatured: data.isFeatured ?? false,
        status: data.status ? BlogPostStatusToPrisma(data.status) : 'DRAFT',
        publishedAt: data.publishedAt ?? null,
        categoryId: data.categoryId ?? null,
      },
    });
    return this.map(post);
  }

  async update(id: bigint, data: UpdateBlogPostData): Promise<BlogPostEntity> {
    const updateData: Prisma.BlogPostUncheckedUpdateInput = {};
    if (data.titleI18n !== undefined) updateData.titleI18n = data.titleI18n as unknown as Prisma.InputJsonValue;
    if (data.contentI18n !== undefined) updateData.contentI18n = data.contentI18n as unknown as Prisma.InputJsonValue;
    if (data.excerptI18n !== undefined) updateData.excerptI18n = data.excerptI18n ? (data.excerptI18n as unknown as Prisma.InputJsonValue) : Prisma.DbNull;
    if (data.metaDescriptionI18n !== undefined) updateData.metaDescriptionI18n = data.metaDescriptionI18n ? (data.metaDescriptionI18n as unknown as Prisma.InputJsonValue) : Prisma.DbNull;
    if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl;
    if (data.galleryImageIds !== undefined) updateData.galleryImageIds = data.galleryImageIds ? (data.galleryImageIds as unknown as Prisma.InputJsonValue) : Prisma.DbNull;
    if (data.author !== undefined) updateData.author = data.author;
    if (data.externalLink !== undefined) updateData.externalLink = data.externalLink;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.readTime !== undefined) updateData.readTime = data.readTime;
    if (data.views !== undefined) updateData.views = data.views;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.status !== undefined) updateData.status = BlogPostStatusToPrisma(data.status);
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    const post = await this.prisma.blogPost.update({ where: { id }, data: updateData });
    return this.map(post);
  }

  async updateStatus(id: bigint, status: DomainBlogPostStatus, publishedAt?: Date | null): Promise<BlogPostEntity> {
    const updateData: Prisma.BlogPostUncheckedUpdateInput = { status: BlogPostStatusToPrisma(status) };
    if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt;
    } else if (status === DomainBlogPostStatus.PUBLISHED) {
      const current = await this.prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
      if (!current?.publishedAt) updateData.publishedAt = new Date();
    }
    const post = await this.prisma.blogPost.update({ where: { id }, data: updateData });
    return this.map(post);
  }

  async toggleFeatured(id: bigint, isFeatured: boolean): Promise<BlogPostEntity> {
    const post = await this.prisma.blogPost.update({ where: { id }, data: { isFeatured } });
    return this.map(post);
  }

  async hardDelete(id: bigint): Promise<void> {
    await this.prisma.blogPost.delete({ where: { id } });
  }
}

function BlogPostStatusToPrisma(status: DomainBlogPostStatus): 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED' {
  return status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
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
    id: bigint; filename: string; title: string | null; r2Key: string; url: string;
    mimeType: string; sizeBytes: bigint; altTextI18n: unknown; folder: string | null;
    uploadedBy: bigint; deletedAt: Date | null; createdAt: Date; updatedAt: Date;
  }): MediaFileEntity {
    return MediaFileEntity.reconstitute({
      id: data.id,
      filename: data.filename,
      title: data.title,
      r2Key: data.r2Key,
      url: data.url,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      altTextI18n: toI18nOrNull(data.altTextI18n),
      folder: data.folder,
      uploadedBy: data.uploadedBy,
      deletedAt: data.deletedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findAll(params?: MediaFilterParams): Promise<PaginatedResult<MediaFileEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.MediaFileWhereInput = { deletedAt: null };

    if (params?.type === 'image') where.mimeType = { startsWith: 'image/' };
    else if (params?.type === 'video') where.mimeType = { startsWith: 'video/' };
    if (params?.folder) where.folder = params.folder;
    if (params?.search) {
      where.OR = [
        { filename: { contains: params.search, mode: 'insensitive' } },
        { title: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [files, total] = await Promise.all([
      this.prisma.mediaFile.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      this.prisma.mediaFile.count({ where }),
    ]);

    return { data: files.map((f) => this.map(f)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: bigint): Promise<MediaFileEntity | null> {
    const file = await this.prisma.mediaFile.findUnique({ where: { id } });
    return file ? this.map(file) : null;
  }

  async isUsedInPosts(id: bigint): Promise<boolean> {
    const file = await this.prisma.mediaFile.findUnique({ where: { id }, select: { url: true } });
    if (!file) return false;
    const count = await this.prisma.blogPost.count({
      where: {
        OR: [
          { coverImageUrl: file.url },
          { galleryImageIds: { array_contains: file.url } },
        ],
      },
    });
    return count > 0;
  }

  async create(data: CreateMediaFileData): Promise<MediaFileEntity> {
    const file = await this.prisma.mediaFile.create({
      data: {
        filename: data.filename,
        title: data.title ?? null,
        r2Key: data.r2Key,
        url: data.url,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        altTextI18n: data.altTextI18n ? (data.altTextI18n as unknown as Prisma.InputJsonValue) : undefined,
        folder: data.folder ?? null,
        uploadedBy: data.uploadedBy,
      },
    });
    return this.map(file);
  }

  async update(id: bigint, data: UpdateMediaFileData): Promise<MediaFileEntity> {
    const updateData: Prisma.MediaFileUncheckedUpdateInput = {};
    if (data.altTextI18n !== undefined) updateData.altTextI18n = data.altTextI18n ? (data.altTextI18n as unknown as Prisma.InputJsonValue) : Prisma.DbNull;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.folder !== undefined) updateData.folder = data.folder;
    const file = await this.prisma.mediaFile.update({ where: { id }, data: updateData });
    return this.map(file);
  }

  async softDelete(id: bigint): Promise<MediaFileEntity> {
    const file = await this.prisma.mediaFile.update({ where: { id }, data: { deletedAt: new Date() } });
    return this.map(file);
  }

  async hardDelete(id: bigint): Promise<MediaFileEntity> {
    const file = await this.prisma.mediaFile.delete({ where: { id } });
    return this.map(file);
  }
}
