import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IStoragePort } from '@application/cms/ports/storage.port';
import {
  CmsPageRepositoryPort,
  BlogPostRepositoryPort,
  EventRepositoryPort,
  MediaFileRepositoryPort,
} from '@domain/cms/ports/cms.repository.port';
import {
  CMS_PAGE_REPOSITORY_TOKEN,
  BLOG_POST_REPOSITORY_TOKEN,
  EVENT_REPOSITORY_TOKEN,
  MEDIA_FILE_REPOSITORY_TOKEN,
} from '@domain/cms/ports/cms.repository.token';
import {
  CreateCmsPageDto,
  UpdateCmsPageDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateEventDto,
  UpdateEventDto,
  UpdateMediaFileDto,
} from '@application/cms/dtos/cms.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { BlogPostStatus, EventType } from '@domain/cms/entities/cms.entity';

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

  async execute(pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    return this.repository.findAll({ page, limit });
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
    if (existing) {
      throw new ConflictException(`Blog post with slug "${dto.slug}" already exists`);
    }
    return this.repository.create({
      slug: dto.slug,
      titleI18n: dto.titleI18n,
      contentI18n: dto.contentI18n,
      excerptI18n: dto.excerptI18n ?? null,
      metaDescriptionI18n: dto.metaDescriptionI18n ?? null,
      coverImageUrl: dto.coverImageUrl ?? null,
      status: BlogPostStatus.DRAFT,
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
    if (!post) {
      throw new NotFoundException(`Blog post with id ${id} not found`);
    }
    return this.repository.update(id, {
      titleI18n: dto.titleI18n,
      contentI18n: dto.contentI18n,
      excerptI18n: dto.excerptI18n ?? null,
      metaDescriptionI18n: dto.metaDescriptionI18n,
      coverImageUrl: dto.coverImageUrl,
    });
  }
}

@Injectable()
export class PublishBlogPostUseCase {
  constructor(
    @Inject(BLOG_POST_REPOSITORY_TOKEN)
    private readonly repository: BlogPostRepositoryPort,
  ) {}

  async execute(id: bigint, dto: { status: string }) {
    const post = await this.repository.findById(id);
    if (!post) {
      throw new NotFoundException(`Blog post with id ${id} not found`);
    }
    const status = dto.status as BlogPostStatus;
    return this.repository.updateStatus(id, status);
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
    if (!post) {
      throw new NotFoundException(`Blog post with id ${id} not found`);
    }
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

  async execute(params?: { mimeType?: string }, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    return this.repository.findAll({ page, limit, mimeType: params?.mimeType });
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
    if (!file) {
      throw new NotFoundException(`Media file with id ${id} not found`);
    }
    return this.repository.update(id, {
      altTextI18n: dto.altTextI18n ?? null,
    });
  }
}

@Injectable()
export class DeleteMediaFileUseCase {
  constructor(
    @Inject(MEDIA_FILE_REPOSITORY_TOKEN)
    private readonly repository: MediaFileRepositoryPort,
  ) {}

  async execute(id: bigint) {
    const file = await this.repository.findById(id);
    if (!file) {
      throw new NotFoundException(`Media file with id ${id} not found`);
    }
    return this.repository.hardDelete(id);
  }
}

export const STORAGE_SERVICE_TOKEN = 'STORAGE_SERVICE_TOKEN';

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
  }) {
    if (!ALLOWED_MIME_TYPES.includes(input.mimetype)) {
      throw new BadRequestException(`File type not allowed: ${input.mimetype}`);
    }
    if (input.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 50MB limit');
    }

    const ext = extname(input.originalname).toLowerCase();
    const key = `media/${uuidv4()}${ext}`;

    const uploaded = await this.storage.uploadFile(key, input.buffer, input.size, input.mimetype);

    return this.repository.create({
      filename: input.originalname,
      r2Key: uploaded.key,
      url: uploaded.url,
      mimeType: input.mimetype,
      sizeBytes: BigInt(input.size),
      altTextI18n: input.altTextI18n ?? null,
      uploadedBy: input.uploadedBy,
    });
  }
}
