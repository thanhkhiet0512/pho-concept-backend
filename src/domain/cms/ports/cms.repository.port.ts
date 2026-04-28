import { PostCategoryEntity, CmsPageEntity, BlogPostEntity, BlogPostStatus, EventEntity, EventType, MediaFileEntity } from '@domain/cms/entities/cms.entity';
import { I18nField } from '@domain/menu/entities/menu.entity';

export { PostCategoryEntity, CmsPageEntity, BlogPostEntity, BlogPostStatus, EventEntity, EventType, MediaFileEntity };

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCmsPageData {
  slug: string;
  titleI18n: I18nField;
  metaDescriptionI18n?: I18nField | null;
  ogImageUrl?: string | null;
  sections?: unknown[];
  isPublished?: boolean;
}

export interface UpdateCmsPageData {
  titleI18n?: I18nField;
  metaDescriptionI18n?: I18nField | null;
  ogImageUrl?: string | null;
  sections?: unknown[];
  isPublished?: boolean;
}

export interface CreatePostCategoryData {
  slug: string;
  nameI18n: I18nField;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdatePostCategoryData {
  slug?: string;
  nameI18n?: I18nField;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateBlogPostData {
  slug: string;
  titleI18n: I18nField;
  contentI18n: I18nField;
  excerptI18n?: I18nField | null;
  metaDescriptionI18n?: I18nField | null;
  coverImageUrl?: string | null;
  galleryImageIds?: string[] | null;
  author?: string | null;
  externalLink?: string | null;
  videoUrl?: string | null;
  readTime?: string | null;
  views?: string | null;
  isFeatured?: boolean;
  status?: BlogPostStatus;
  publishedAt?: Date | null;
  categoryId?: bigint | null;
}

export interface UpdateBlogPostData {
  titleI18n?: I18nField;
  contentI18n?: I18nField;
  excerptI18n?: I18nField | null;
  metaDescriptionI18n?: I18nField | null;
  coverImageUrl?: string | null;
  galleryImageIds?: string[] | null;
  author?: string | null;
  externalLink?: string | null;
  videoUrl?: string | null;
  readTime?: string | null;
  views?: string | null;
  isFeatured?: boolean;
  status?: BlogPostStatus;
  publishedAt?: Date | null;
  categoryId?: bigint | null;
}

export interface BlogPostFilterParams extends PaginationParams {
  status?: BlogPostStatus;
  categoryId?: bigint;
  search?: string;
  author?: string;
  publishMonth?: string;
  isFeatured?: boolean;
}

export interface CreateEventData {
  titleI18n: I18nField;
  descriptionI18n?: I18nField | null;
  coverImageUrl?: string | null;
  eventDate: Date;
  eventEndDate?: Date | null;
  eventType: EventType;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdateEventData {
  titleI18n?: I18nField;
  descriptionI18n?: I18nField | null;
  coverImageUrl?: string | null;
  eventDate?: Date;
  eventEndDate?: Date | null;
  eventType?: EventType;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdateMediaFileData {
  altTextI18n?: I18nField | null;
  title?: string | null;
  folder?: string | null;
}

export interface CreateMediaFileData {
  filename: string;
  title?: string | null;
  r2Key: string;
  url: string;
  mimeType: string;
  sizeBytes: bigint;
  altTextI18n?: I18nField | null;
  folder?: string | null;
  uploadedBy: bigint;
}

export interface MediaFilterParams extends PaginationParams {
  type?: 'image' | 'video';
  folder?: string;
  search?: string;
}

export abstract class PostCategoryRepositoryPort {
  abstract findAll(params?: PaginationParams & { isActive?: boolean; search?: string }): Promise<PaginatedResult<PostCategoryEntity>>;
  abstract findById(id: bigint): Promise<PostCategoryEntity | null>;
  abstract findBySlug(slug: string): Promise<PostCategoryEntity | null>;
  abstract create(data: CreatePostCategoryData): Promise<PostCategoryEntity>;
  abstract update(id: bigint, data: UpdatePostCategoryData): Promise<PostCategoryEntity>;
  abstract toggleActive(id: bigint, isActive: boolean): Promise<PostCategoryEntity>;
  abstract hardDelete(id: bigint): Promise<void>;
}

export abstract class CmsPageRepositoryPort {
  abstract findAll(params?: PaginationParams): Promise<PaginatedResult<CmsPageEntity>>;
  abstract findById(id: bigint): Promise<CmsPageEntity | null>;
  abstract findBySlug(slug: string): Promise<CmsPageEntity | null>;
  abstract findPublishedBySlug(slug: string): Promise<CmsPageEntity | null>;
  abstract create(data: CreateCmsPageData): Promise<CmsPageEntity>;
  abstract update(id: bigint, data: UpdateCmsPageData): Promise<CmsPageEntity>;
  abstract togglePublish(id: bigint, isPublished: boolean): Promise<CmsPageEntity>;
}

export abstract class BlogPostRepositoryPort {
  abstract findAll(params?: BlogPostFilterParams): Promise<PaginatedResult<BlogPostEntity>>;
  abstract findPublished(params?: PaginationParams): Promise<PaginatedResult<BlogPostEntity>>;
  abstract findById(id: bigint): Promise<BlogPostEntity | null>;
  abstract findBySlug(slug: string): Promise<BlogPostEntity | null>;
  abstract create(data: CreateBlogPostData): Promise<BlogPostEntity>;
  abstract update(id: bigint, data: UpdateBlogPostData): Promise<BlogPostEntity>;
  abstract updateStatus(id: bigint, status: BlogPostStatus, publishedAt?: Date | null): Promise<BlogPostEntity>;
  abstract toggleFeatured(id: bigint, isFeatured: boolean): Promise<BlogPostEntity>;
  abstract hardDelete(id: bigint): Promise<void>;
}

export abstract class EventRepositoryPort {
  abstract findAll(params?: PaginationParams & { isActive?: boolean; isFeatured?: boolean; upcoming?: boolean }): Promise<PaginatedResult<EventEntity>>;
  abstract findActive(params?: PaginationParams & { isFeatured?: boolean; upcoming?: boolean }): Promise<PaginatedResult<EventEntity>>;
  abstract findById(id: bigint): Promise<EventEntity | null>;
  abstract create(data: CreateEventData): Promise<EventEntity>;
  abstract update(id: bigint, data: UpdateEventData): Promise<EventEntity>;
  abstract toggleFeatured(id: bigint, isFeatured: boolean): Promise<EventEntity>;
  abstract hardDelete(id: bigint): Promise<void>;
}

export abstract class MediaFileRepositoryPort {
  abstract findAll(params?: MediaFilterParams): Promise<PaginatedResult<MediaFileEntity>>;
  abstract findById(id: bigint): Promise<MediaFileEntity | null>;
  abstract isUsedInPosts(id: bigint): Promise<boolean>;
  abstract create(data: CreateMediaFileData): Promise<MediaFileEntity>;
  abstract update(id: bigint, data: UpdateMediaFileData): Promise<MediaFileEntity>;
  abstract softDelete(id: bigint): Promise<MediaFileEntity>;
  abstract hardDelete(id: bigint): Promise<MediaFileEntity>;
}
