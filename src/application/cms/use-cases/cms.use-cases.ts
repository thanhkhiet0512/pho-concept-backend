import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IStoragePort } from '@application/cms/ports/storage.port';
import {
  PostCategoryRepositoryPort,
  CmsPageRepositoryPort,
  BlogPostRepositoryPort,
  EventRepositoryPort,
  MediaFileRepositoryPort,
  BlogPostFilterParams,
  MediaFilterParams,
} from '@domain/cms/ports/cms.repository.port';
import {
  POST_CATEGORY_REPOSITORY_TOKEN,
  CMS_PAGE_REPOSITORY_TOKEN,
  BLOG_POST_REPOSITORY_TOKEN,
  EVENT_REPOSITORY_TOKEN,
  MEDIA_FILE_REPOSITORY_TOKEN,
} from '@domain/cms/ports/cms.repository.token';
import {
  CreatePostCategoryDto,
  UpdatePostCategoryDto,
  CreateCmsPageDto,
  UpdateCmsPageDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  UpdateBlogPostStatusDto,
  CreateEventDto,
  UpdateEventDto,
  UpdateMediaFileDto,
} from '@application/cms/dtos/cms.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { BlogPostStatus, EventType } from '@domain/cms/entities/cms.entity';

export const STORAGE_SERVICE_TOKEN = 'STORAGE_SERVICE_TOKEN';

// Resolves a publishDay (1-28) to an absolute Date, advancing to next month if the day has passed.
// Caps at day 28 to avoid month-boundary overflow (Feb 29 issue).
function resolvePublishDay(day: number): Date {
  const safeDay = Math.min(day, 28);
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), safeDay);
  return candidate <= now
    ? new Date(now.getFullYear(), now.getMonth() + 1, safeDay)
    : candidate;
}

// ===================== POST CATEGORY USE CASES =====================

@Injectable()
export class GetPostCategoriesUseCase {
  constructor(
    @Inject(POST_CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: PostCategoryRepositoryPort,
  ) {}

  async execute(params?: PaginationDto & { isActive?: boolean; search?: string }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    return this.repository.findAll({ page, limit, isActive: params?.isActive, search: params?.search });
  }
}

@Injectable()
export class GetPostCategoryByIdUseCase {
  constructor(
    @Inject(POST_CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: PostCategoryRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const cat = await this.repository.findById(id);
    if (!cat) throw new NotFoundException(`Post category with id ${id} not found`);
    return cat;
  }
}

@Injectable()
export class CreatePostCategoryUseCase {
  constructor(
    @Inject(POST_CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: PostCategoryRepositoryPort,
  ) {}

  async execute(dto: CreatePostCategoryDto) {
    const existing = await this.repository.findBySlug(dto.slug);
    if (existing) throw new ConflictException(`Post category with slug "${dto.slug}" already exists`);
    return this.repository.create({
      slug: dto.slug,
      nameI18n: dto.nameI18n,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
  }
}

@Injectable()
export class UpdatePostCategoryUseCase {
  constructor(
    @Inject(POST_CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: PostCategoryRepositoryPort,
  ) {}

  async execute(id: bigint, dto: UpdatePostCategoryDto) {
    const cat = await this.repository.findById(id);
    if (!cat) throw new NotFoundException(`Post category with id ${id} not found`);
    if (dto.slug && dto.slug !== cat.slug) {
      const conflict = await this.repository.findBySlug(dto.slug);
      if (conflict) throw new ConflictException(`Slug "${dto.slug}" already in use`);
    }
    return this.repository.update(id, {
      slug: dto.slug,
      nameI18n: dto.nameI18n,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
    });
  }
}

@Injectable()
export class TogglePostCategoryUseCase {
  constructor(
    @Inject(POST_CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: PostCategoryRepositoryPort,
  ) {}

  async execute(id: bigint, isActive: boolean) {
    const cat = await this.repository.findById(id);
    if (!cat) throw new NotFoundException(`Post category with id ${id} not found`);
    return this.repository.toggleActive(id, isActive);
  }
}

@Injectable()
export class DeletePostCategoryUseCase {
  constructor(
    @Inject(POST_CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: PostCategoryRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const cat = await this.repository.findById(id);
    if (!cat) throw new NotFoundException(`Post category with id ${id} not found`);
    await this.repository.hardDelete(id);
  }
}

// ===================== CMS PAGE USE CASES =====================

@Injectable()
export class GetCmsPagesUseCase {
  constructor(
    @Inject(CMS_PAGE_REPOSITORY_TOKEN)
    private readonly repository: CmsPageRepositoryPort,
  ) {}

  async execute(pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    return this.repository.findAll({ page, limit });
  }
}

@Injectable()
export class GetCmsPageBySlugUseCase {
  constructor(
    @Inject(CMS_PAGE_REPOSITORY_TOKEN)
    private readonly repository: CmsPageRepositoryPort,
  ) {}

  async execute(slug: string) {
    const page = await this.repository.findPublishedBySlug(slug);
    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    return page;
  }
}

@Injectable()
export class GetCmsPageByIdUseCase {
  constructor(
    @Inject(CMS_PAGE_REPOSITORY_TOKEN)
    private readonly repository: CmsPageRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const page = await this.repository.findById(id);
    if (!page) {
      throw new NotFoundException(`Page with id ${id} not found`);
    }
    return page;
  }
}

@Injectable()
export class CreateCmsPageUseCase {
  constructor(
    @Inject(CMS_PAGE_REPOSITORY_TOKEN)
    private readonly repository: CmsPageRepositoryPort,
  ) {}

  async execute(dto: CreateCmsPageDto) {
    const existing = await this.repository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException(`Page with slug "${dto.slug}" already exists`);
    }
    return this.repository.create({
      slug: dto.slug,
      titleI18n: dto.titleI18n,
      metaDescriptionI18n: dto.metaDescriptionI18n ?? null,
      ogImageUrl: dto.ogImageUrl ?? null,
      sections: dto.sections ?? [],
      isPublished: dto.isPublished ?? false,
    });
  }
}

@Injectable()
export class UpdateCmsPageUseCase {
  constructor(
    @Inject(CMS_PAGE_REPOSITORY_TOKEN)
    private readonly repository: CmsPageRepositoryPort,
  ) {}

  async execute(slug: string, dto: UpdateCmsPageDto) {
    const page = await this.repository.findBySlug(slug);
    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    return this.repository.update(page.id, {
      titleI18n: dto.titleI18n,
      metaDescriptionI18n: dto.metaDescriptionI18n,
      ogImageUrl: dto.ogImageUrl,
      sections: dto.sections,
      isPublished: dto.isPublished,
    });
  }
}

@Injectable()
export class PublishCmsPageUseCase {
  constructor(
    @Inject(CMS_PAGE_REPOSITORY_TOKEN)
    private readonly repository: CmsPageRepositoryPort,
  ) {}

  async execute(slug: string, isPublished: boolean) {
    const page = await this.repository.findBySlug(slug);
    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    return this.repository.togglePublish(page.id, isPublished);
  }
}

// ===================== BLOG POST USE CASES =====================

@Injectable()
export class GetPublishedBlogPostsUseCase {
  constructor(
    @Inject(BLOG_POST_REPOSITORY_TOKEN)
    private readonly repository: BlogPostRepositoryPort,
  ) {}

  async execute(pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    return this.repository.findPublished({ page, limit });
  }
}

@Injectable()
export class GetBlogPostBySlugUseCase {
  constructor(
    @Inject(BLOG_POST_REPOSITORY_TOKEN)
    private readonly repository: BlogPostRepositoryPort,
  ) {}

  async execute(slug: string) {
    const post = await this.repository.findBySlug(slug);
    if (!post || post.status !== BlogPostStatus.PUBLISHED) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }
    return post;
  }
}

@Injectable()
export class GetBlogPostsUseCase {
  constructor(
    @Inject(BLOG_POST_REPOSITORY_TOKEN)
    private readonly repository: BlogPostRepositoryPort,
  ) {}

  async execute(params?: PaginationDto & Omit<BlogPostFilterParams, 'page' | 'limit'>) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    return this.repository.findAll({
      page,
      limit,
      status: params?.status,
      categoryId: params?.categoryId,
      search: params?.search,
      author: params?.author,
      publishMonth: params?.publishMonth,
      isFeatured: params?.isFeatured,
    });
  }
}

@Injectable()
export class GetBlogPostByIdUseCase {
  constructor(
    @Inject(BLOG_POST_REPOSITORY_TOKEN)
    private readonly repository: BlogPostRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const post = await this.repository.findById(id);
    if (!post) {
      throw new NotFoundException(`Blog post with id ${id} not found`);
    }
    return post;
  }
}

@Injectable()
export class CreateBlogPostUseCase {
  constructor(
    @Inject(BLOG_POST_REPOSITORY_TOKEN)
    private readonly repository: BlogPostRepositoryPort,
  ) {}

  async execute(dto: CreateBlogPostDto) {
    const existing = await this.repository.findBySlug(dto.slug);
    if (existing) throw new ConflictException(`Blog post with slug "${dto.slug}" already exists`);

    const publishedAt: Date | null = dto.publishDay ? resolvePublishDay(dto.publishDay) : null;

    return this.repository.create({
      slug: dto.slug,
      titleI18n: dto.titleI18n,
      contentI18n: dto.contentI18n,
      excerptI18n: dto.excerptI18n ?? null,
      metaDescriptionI18n: dto.metaDescriptionI18n ?? null,
      coverImageUrl: dto.coverImageUrl ?? null,
      galleryImageIds: dto.galleryImageIds ?? null,
      author: dto.author ?? null,
      externalLink: dto.externalLink ?? null,
      videoUrl: dto.videoUrl ?? null,
      readTime: dto.readTime ?? null,
      views: dto.views ?? null,
      isFeatured: dto.isFeatured ?? false,
      status: BlogPostStatus.DRAFT,
      publishedAt,
      categoryId: null//dto.categoryId ? BigInt(dto.categoryId) : null,
    });
  }
}

@Injectable()
export class UpdateBlogPostUseCase {
  constructor(
    @Inject(BLOG_POST_REPOSITORY_TOKEN)
    private readonly repository: BlogPostRepositoryPort,
  ) {}

  async execute(id: bigint, dto: UpdateBlogPostDto) {
    const post = await this.repository.findById(id);
    if (!post) throw new NotFoundException(`Blog post with id ${id} not found`);

    let publishedAt: Date | null | undefined = undefined;
    if (dto.publishDay !== undefined) {
      publishedAt = dto.publishDay === null ? null : resolvePublishDay(dto.publishDay);
    }

    return this.repository.update(id, {
      titleI18n: dto.titleI18n,
      contentI18n: dto.contentI18n,
      excerptI18n: dto.excerptI18n,
      metaDescriptionI18n: dto.metaDescriptionI18n,
      coverImageUrl: dto.coverImageUrl,
      galleryImageIds: dto.galleryImageIds,
      author: dto.author,
      externalLink: dto.externalLink,
      videoUrl: dto.videoUrl,
      readTime: dto.readTime,
      views: dto.views,
      isFeatured: dto.isFeatured,
      publishedAt,
      categoryId: dto.categoryId !== undefined ? (dto.categoryId ? BigInt(dto.categoryId) : null) : undefined,
    });
  }
}

@Injectable()
export class PublishBlogPostUseCase {
  constructor(
    @Inject(BLOG_POST_REPOSITORY_TOKEN)
    private readonly repository: BlogPostRepositoryPort,
  ) {}

  async execute(id: bigint, dto: UpdateBlogPostStatusDto) {
    const post = await this.repository.findById(id);
    if (!post) throw new NotFoundException(`Blog post with id ${id} not found`);

    let publishedAt: Date | null | undefined = undefined;
    if (dto.status === BlogPostStatus.SCHEDULED && dto.publishDay) {
      publishedAt = resolvePublishDay(dto.publishDay);
    } else if (dto.status === BlogPostStatus.DRAFT) {
      publishedAt = null;
    }
    // ARCHIVED and PUBLISHED: preserve existing publishedAt (undefined = no change)

    return this.repository.updateStatus(id, BlogPostStatus[dto.status], publishedAt);
  }
}

@Injectable()
export class ToggleBlogPostFeaturedUseCase {
  constructor(
    @Inject(BLOG_POST_REPOSITORY_TOKEN)
    private readonly repository: BlogPostRepositoryPort,
  ) {}

  async execute(id: bigint, isFeatured: boolean) {
    const post = await this.repository.findById(id);
    if (!post) throw new NotFoundException(`Blog post with id ${id} not found`);
    return this.repository.toggleFeatured(id, isFeatured);
  }
}

@Injectable()
export class DeleteBlogPostUseCase {
  constructor(
    @Inject(BLOG_POST_REPOSITORY_TOKEN)
    private readonly repository: BlogPostRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const post = await this.repository.findById(id);
    if (!post) throw new NotFoundException(`Blog post with id ${id} not found`);
    await this.repository.hardDelete(id);
  }
}

// ===================== EVENT USE CASES =====================

@Injectable()
export class GetActiveEventsUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY_TOKEN)
    private readonly repository: EventRepositoryPort,
  ) {}

  async execute(params?: { featured?: boolean; upcoming?: boolean }, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    return this.repository.findActive({
      page,
      limit,
      isFeatured: params?.featured,
      upcoming: params?.upcoming,
    });
  }
}

@Injectable()
export class GetEventByIdPublicUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY_TOKEN)
    private readonly repository: EventRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const event = await this.repository.findById(id);
    if (!event || !event.isActive) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }
}

@Injectable()
export class GetEventsUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY_TOKEN)
    private readonly repository: EventRepositoryPort,
  ) {}

  async execute(params?: { isActive?: boolean; isFeatured?: boolean; upcoming?: boolean }, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    return this.repository.findAll({ page, limit, ...params });
  }
}

@Injectable()
export class GetEventByIdUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY_TOKEN)
    private readonly repository: EventRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const event = await this.repository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }
}

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY_TOKEN)
    private readonly repository: EventRepositoryPort,
  ) {}

  async execute(dto: CreateEventDto) {
    return this.repository.create({
      titleI18n: dto.titleI18n,
      descriptionI18n: dto.descriptionI18n ?? null,
      coverImageUrl: dto.coverImageUrl ?? null,
      eventDate: new Date(dto.eventDate),
      eventEndDate: dto.eventEndDate ? new Date(dto.eventEndDate) : null,
      eventType: dto.eventType as EventType,
      isFeatured: dto.isFeatured ?? false,
      isActive: true,
    });
  }
}

@Injectable()
export class UpdateEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY_TOKEN)
    private readonly repository: EventRepositoryPort,
  ) {}

  async execute(id: bigint, dto: UpdateEventDto) {
    const event = await this.repository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return this.repository.update(id, {
      titleI18n: dto.titleI18n,
      descriptionI18n: dto.descriptionI18n,
      coverImageUrl: dto.coverImageUrl,
      eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
      eventEndDate: dto.eventEndDate !== undefined ? (dto.eventEndDate ? new Date(dto.eventEndDate) : null) : undefined,
      eventType: dto.eventType as EventType | undefined,
      isFeatured: dto.isFeatured,
      isActive: dto.isActive,
    });
  }
}

@Injectable()
export class ToggleEventFeaturedUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY_TOKEN)
    private readonly repository: EventRepositoryPort,
  ) {}

  async execute(id: bigint, isFeatured: boolean) {
    const event = await this.repository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return this.repository.toggleFeatured(id, isFeatured);
  }
}

@Injectable()
export class DeleteEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY_TOKEN)
    private readonly repository: EventRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const event = await this.repository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    await this.repository.hardDelete(id);
  }
}

// ===================== MEDIA FILE USE CASES =====================

@Injectable()
export class GetMediaFilesUseCase {
  constructor(
    @Inject(MEDIA_FILE_REPOSITORY_TOKEN)
    private readonly repository: MediaFileRepositoryPort,
  ) {}

  async execute(params?: MediaFilterParams & PaginationDto) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    return this.repository.findAll({ page, limit, type: params?.type, folder: params?.folder, search: params?.search });
  }
}

@Injectable()
export class GetMediaFileByIdUseCase {
  constructor(
    @Inject(MEDIA_FILE_REPOSITORY_TOKEN)
    private readonly repository: MediaFileRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const file = await this.repository.findById(id);
    if (!file) {
      throw new NotFoundException(`Media file with id ${id} not found`);
    }
    return file;
  }
}

@Injectable()
export class CreateMediaFileUseCase {
  constructor(
    @Inject(MEDIA_FILE_REPOSITORY_TOKEN)
    private readonly repository: MediaFileRepositoryPort,
  ) {}

  async execute(dto: {
    filename: string;
    r2Key: string;
    url: string;
    mimeType: string;
    sizeBytes: bigint;
    altTextI18n?: { en: string; vi?: string } | null;
    uploadedBy: bigint;
  }) {
    return this.repository.create({
      filename: dto.filename,
      r2Key: dto.r2Key,
      url: dto.url,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      altTextI18n: dto.altTextI18n ?? null,
      uploadedBy: dto.uploadedBy,
    });
  }
}

@Injectable()
export class UpdateMediaFileUseCase {
  constructor(
    @Inject(MEDIA_FILE_REPOSITORY_TOKEN)
    private readonly repository: MediaFileRepositoryPort,
  ) {}

  async execute(id: bigint, dto: UpdateMediaFileDto) {
    const file = await this.repository.findById(id);
    if (!file) throw new NotFoundException(`Media file with id ${id} not found`);
    return this.repository.update(id, {
      altTextI18n: dto.altTextI18n ?? undefined,
      title: dto.title ?? undefined,
      folder: dto.folder ?? undefined,
    });
  }
}

@Injectable()
export class DeleteMediaFileUseCase {
  constructor(
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storage: IStoragePort,
    @Inject(MEDIA_FILE_REPOSITORY_TOKEN)
    private readonly repository: MediaFileRepositoryPort,
  ) {}

  async execute(id: bigint): Promise<{ isDeleted: boolean; r2Key: string }> {
    const file = await this.repository.findById(id);
    if (!file) throw new NotFoundException(`Media file with id ${id} not found`);
    const usedInPosts = await this.repository.isUsedInPosts(id);
    if (usedInPosts) {
      const softDeleted = await this.repository.softDelete(id);
      return { isDeleted: true, r2Key: softDeleted.r2Key };
    }
    const r2Key = file.r2Key;
    await this.repository.hardDelete(id);
    await this.storage.deleteFile(r2Key).catch(() => { /* best-effort */ });
    return { isDeleted: false, r2Key };
  }
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm',
  'application/pdf',
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Injectable()
export class UploadMediaUseCase {
  constructor(
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storage: IStoragePort,
    @Inject(MEDIA_FILE_REPOSITORY_TOKEN)
    private readonly repository: MediaFileRepositoryPort,
  ) {}

  async execute(input: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
    uploadedBy: bigint;
    altTextI18n?: { en: string; vi?: string } | null;
    title?: string | null;
    folder?: string | null;
  }) {
    if (!ALLOWED_MIME_TYPES.includes(input.mimetype)) {
      throw new BadRequestException(`File type not allowed: ${input.mimetype}`);
    }
    if (input.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 50MB limit');
    }

    const ext = extname(input.originalname).toLowerCase();
    const folderPrefix = input.folder ? `${input.folder}/` : 'media/';
    const key = `${folderPrefix}${uuidv4()}${ext}`;

    const uploaded = await this.storage.uploadFile(key, input.buffer, input.size, input.mimetype);

    return this.repository.create({
      filename: input.originalname,
      title: input.title ?? null,
      r2Key: uploaded.key,
      url: uploaded.url,
      mimeType: input.mimetype,
      sizeBytes: BigInt(input.size),
      altTextI18n: input.altTextI18n ?? null,
      folder: input.folder ?? null,
      uploadedBy: input.uploadedBy,
    });
  }
}
