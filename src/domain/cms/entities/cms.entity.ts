import { I18nField } from '@domain/menu/entities/menu.entity';

export { I18nField };

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
  private _status!: BlogPostStatus;
  private _publishedAt: Date | null = null;

  static reconstitute(data: {
    id: bigint;
    slug: string;
    titleI18n: I18nField;
    contentI18n: I18nField;
    excerptI18n: I18nField | null;
    metaDescriptionI18n: I18nField | null;
    coverImageUrl: string | null;
    status: BlogPostStatus;
    publishedAt: Date | null;
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
    entity._status = data.status;
    entity._publishedAt = data.publishedAt;
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
  get status(): BlogPostStatus { return this._status; }
  get publishedAt(): Date | null { return this._publishedAt; }
}

export enum BlogPostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
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
  private _filename!: string;
  private _r2Key!: string;
  private _url!: string;
  private _mimeType!: string;
  private _sizeBytes!: bigint;
  private _altTextI18n: I18nField | null = null;
  private _uploadedBy!: bigint;

  static reconstitute(data: {
    id: bigint;
    filename: string;
    r2Key: string;
    url: string;
    mimeType: string;
    sizeBytes: bigint;
    altTextI18n: I18nField | null;
    uploadedBy: bigint;
    createdAt: Date;
  }): MediaFileEntity {
    const entity = new MediaFileEntity();
    entity.id = data.id;
    entity._filename = data.filename;
    entity._r2Key = data.r2Key;
    entity._url = data.url;
    entity._mimeType = data.mimeType;
    entity._sizeBytes = data.sizeBytes;
    entity._altTextI18n = data.altTextI18n;
    entity._uploadedBy = data.uploadedBy;
    entity.createdAt = data.createdAt;
    return entity;
  }

  get filename(): string { return this._filename; }
  get r2Key(): string { return this._r2Key; }
  get url(): string { return this._url; }
  get mimeType(): string { return this._mimeType; }
  get sizeBytes(): bigint { return this._sizeBytes; }
  get altTextI18n(): I18nField | null { return this._altTextI18n; }
  get uploadedBy(): bigint { return this._uploadedBy; }
}
