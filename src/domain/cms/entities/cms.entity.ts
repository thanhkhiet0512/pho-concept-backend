import { I18nField } from '@domain/menu/entities/menu.entity';

export { I18nField };

export class PostCategoryEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _slug!: string;
  private _nameI18n!: I18nField;
  private _sortOrder!: number;
  private _isActive!: boolean;

  static reconstitute(data: {
    id: bigint;
    slug: string;
    nameI18n: I18nField;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PostCategoryEntity {
    const entity = new PostCategoryEntity();
    entity.id = data.id;
    entity._slug = data.slug;
    entity._nameI18n = data.nameI18n;
    entity._sortOrder = data.sortOrder;
    entity._isActive = data.isActive;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    return entity;
  }

  get slug(): string { return this._slug; }
  get nameI18n(): I18nField { return this._nameI18n; }
  get sortOrder(): number { return this._sortOrder; }
  get isActive(): boolean { return this._isActive; }
}

export class CmsPageEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _slug!: string;
  private _titleI18n!: I18nField;
  private _metaDescriptionI18n: I18nField | null = null;
  private _ogImageUrl: string | null = null;
  private _sections!: unknown[];
  private _isPublished!: boolean;

  static reconstitute(data: {
    id: bigint;
    slug: string;
    titleI18n: I18nField;
    metaDescriptionI18n: I18nField | null;
    ogImageUrl: string | null;
    sections: unknown[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): CmsPageEntity {
    const entity = new CmsPageEntity();
    entity.id = data.id;
    entity._slug = data.slug;
    entity._titleI18n = data.titleI18n;
    entity._metaDescriptionI18n = data.metaDescriptionI18n;
    entity._ogImageUrl = data.ogImageUrl;
    entity._sections = data.sections;
    entity._isPublished = data.isPublished;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    return entity;
  }

  get slug(): string { return this._slug; }
  get titleI18n(): I18nField { return this._titleI18n; }
  get metaDescriptionI18n(): I18nField | null { return this._metaDescriptionI18n; }
  get ogImageUrl(): string | null { return this._ogImageUrl; }
  get sections(): unknown[] { return this._sections; }
  get isPublished(): boolean { return this._isPublished; }
}

export class BlogPostEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _slug!: string;
  private _titleI18n!: I18nField;
  private _contentI18n!: I18nField;
  private _excerptI18n: I18nField | null = null;
  private _metaDescriptionI18n: I18nField | null = null;
  private _coverImageUrl: string | null = null;
  private _galleryImageIds: string[] | null = null;
  private _author: string | null = null;
  private _externalLink: string | null = null;
  private _videoUrl: string | null = null;
  private _readTime: string | null = null;
  private _views: string | null = null;
  private _isFeatured!: boolean;
  private _status!: BlogPostStatus;
  private _publishedAt: Date | null = null;
  private _categoryId: bigint | null = null;

  static reconstitute(data: {
    id: bigint;
    slug: string;
    titleI18n: I18nField;
    contentI18n: I18nField;
    excerptI18n: I18nField | null;
    metaDescriptionI18n: I18nField | null;
    coverImageUrl: string | null;
    galleryImageIds: string[] | null;
    author: string | null;
    externalLink: string | null;
    videoUrl: string | null;
    readTime: string | null;
    views: string | null;
    isFeatured: boolean;
    status: BlogPostStatus;
    publishedAt: Date | null;
    categoryId: bigint | null;
    createdAt: Date;
    updatedAt: Date;
  }): BlogPostEntity {
    const entity = new BlogPostEntity();
    entity.id = data.id;
    entity._slug = data.slug;
    entity._titleI18n = data.titleI18n;
    entity._contentI18n = data.contentI18n;
    entity._excerptI18n = data.excerptI18n;
    entity._metaDescriptionI18n = data.metaDescriptionI18n;
    entity._coverImageUrl = data.coverImageUrl;
    entity._galleryImageIds = data.galleryImageIds;
    entity._author = data.author;
    entity._externalLink = data.externalLink;
    entity._videoUrl = data.videoUrl;
    entity._readTime = data.readTime;
    entity._views = data.views;
    entity._isFeatured = data.isFeatured;
    entity._status = data.status;
    entity._publishedAt = data.publishedAt;
    entity._categoryId = data.categoryId;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    return entity;
  }

  get slug(): string { return this._slug; }
  get titleI18n(): I18nField { return this._titleI18n; }
  get contentI18n(): I18nField { return this._contentI18n; }
  get excerptI18n(): I18nField | null { return this._excerptI18n; }
  get metaDescriptionI18n(): I18nField | null { return this._metaDescriptionI18n; }
  get coverImageUrl(): string | null { return this._coverImageUrl; }
  get galleryImageIds(): string[] | null { return this._galleryImageIds; }
  get author(): string | null { return this._author; }
  get externalLink(): string | null { return this._externalLink; }
  get videoUrl(): string | null { return this._videoUrl; }
  get readTime(): string | null { return this._readTime; }
  get views(): string | null { return this._views; }
  get isFeatured(): boolean { return this._isFeatured; }
  get status(): BlogPostStatus { return this._status; }
  get publishedAt(): Date | null { return this._publishedAt; }
  get categoryId(): bigint | null { return this._categoryId; }

  get publishDay(): number | null {
    return this._publishedAt ? this._publishedAt.getDate() : null;
  }
}

export enum BlogPostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
  ARCHIVED = 'ARCHIVED',
}

export class EventEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _titleI18n!: I18nField;
  private _descriptionI18n: I18nField | null = null;
  private _coverImageUrl: string | null = null;
  private _eventDate!: Date;
  private _eventEndDate: Date | null = null;
  private _eventType!: EventType;
  private _isFeatured!: boolean;
  private _isActive!: boolean;

  static reconstitute(data: {
    id: bigint;
    titleI18n: I18nField;
    descriptionI18n: I18nField | null;
    coverImageUrl: string | null;
    eventDate: Date;
    eventEndDate: Date | null;
    eventType: EventType;
    isFeatured: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): EventEntity {
    const entity = new EventEntity();
    entity.id = data.id;
    entity._titleI18n = data.titleI18n;
    entity._descriptionI18n = data.descriptionI18n;
    entity._coverImageUrl = data.coverImageUrl;
    entity._eventDate = data.eventDate;
    entity._eventEndDate = data.eventEndDate;
    entity._eventType = data.eventType;
    entity._isFeatured = data.isFeatured;
    entity._isActive = data.isActive;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    return entity;
  }

  get titleI18n(): I18nField { return this._titleI18n; }
  get descriptionI18n(): I18nField | null { return this._descriptionI18n; }
  get coverImageUrl(): string | null { return this._coverImageUrl; }
  get eventDate(): Date { return this._eventDate; }
  get eventEndDate(): Date | null { return this._eventEndDate; }
  get eventType(): EventType { return this._eventType; }
  get isFeatured(): boolean { return this._isFeatured; }
  get isActive(): boolean { return this._isActive; }
}

export enum EventType {
  PROMOTION = 'PROMOTION',
  HOLIDAY = 'HOLIDAY',
  SPECIAL_EVENT = 'SPECIAL_EVENT',
}

export class MediaFileEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _filename!: string;
  private _title: string | null = null;
  private _r2Key!: string;
  private _url!: string;
  private _mimeType!: string;
  private _sizeBytes!: bigint;
  private _altTextI18n: I18nField | null = null;
  private _folder: string | null = null;
  private _uploadedBy!: bigint;
  private _deletedAt: Date | null = null;

  static reconstitute(data: {
    id: bigint;
    filename: string;
    title: string | null;
    r2Key: string;
    url: string;
    mimeType: string;
    sizeBytes: bigint;
    altTextI18n: I18nField | null;
    folder: string | null;
    uploadedBy: bigint;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): MediaFileEntity {
    const entity = new MediaFileEntity();
    entity.id = data.id;
    entity._filename = data.filename;
    entity._title = data.title;
    entity._r2Key = data.r2Key;
    entity._url = data.url;
    entity._mimeType = data.mimeType;
    entity._sizeBytes = data.sizeBytes;
    entity._altTextI18n = data.altTextI18n;
    entity._folder = data.folder;
    entity._uploadedBy = data.uploadedBy;
    entity._deletedAt = data.deletedAt;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    return entity;
  }

  get filename(): string { return this._filename; }
  get title(): string | null { return this._title; }
  get r2Key(): string { return this._r2Key; }
  get url(): string { return this._url; }
  get mimeType(): string { return this._mimeType; }
  get sizeBytes(): bigint { return this._sizeBytes; }
  get altTextI18n(): I18nField | null { return this._altTextI18n; }
  get folder(): string | null { return this._folder; }
  get uploadedBy(): bigint { return this._uploadedBy; }
  get deletedAt(): Date | null { return this._deletedAt; }
  get isDeleted(): boolean { return this._deletedAt !== null; }
}
