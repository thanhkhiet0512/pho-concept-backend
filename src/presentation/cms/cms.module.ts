import { Module } from '@nestjs/common';
import { PublicCmsController, InternalCmsController } from './controllers';
import {
  GetCmsPagesUseCase,
  GetCmsPageBySlugUseCase,
  GetCmsPageByIdUseCase,
  CreateCmsPageUseCase,
  UpdateCmsPageUseCase,
  PublishCmsPageUseCase,
  GetPublishedBlogPostsUseCase,
  GetBlogPostBySlugUseCase,
  GetBlogPostsUseCase,
  GetBlogPostByIdUseCase,
  CreateBlogPostUseCase,
  UpdateBlogPostUseCase,
  PublishBlogPostUseCase,
  DeleteBlogPostUseCase,
  GetActiveEventsUseCase,
  GetEventByIdPublicUseCase,
  GetEventsUseCase,
  GetEventByIdUseCase,
  CreateEventUseCase,
  UpdateEventUseCase,
  ToggleEventFeaturedUseCase,
  DeleteEventUseCase,
  GetMediaFilesUseCase,
  GetMediaFileByIdUseCase,
  CreateMediaFileUseCase,
  UpdateMediaFileUseCase,
  DeleteMediaFileUseCase,
} from '@application/cms/use-cases/cms.use-cases';
import {
  CmsPageAdapter,
  BlogPostAdapter,
  EventAdapter,
  MediaFileAdapter,
} from '@infrastructure/prisma/repositories/cms/cms.adapter';
import {
  CMS_PAGE_REPOSITORY_TOKEN,
  BLOG_POST_REPOSITORY_TOKEN,
  EVENT_REPOSITORY_TOKEN,
  MEDIA_FILE_REPOSITORY_TOKEN,
} from '@domain/cms/ports/cms.repository.token';

@Module({
  controllers: [PublicCmsController, InternalCmsController],
  providers: [
    // Repository tokens → adapters
    { provide: CMS_PAGE_REPOSITORY_TOKEN, useClass: CmsPageAdapter },
    { provide: BLOG_POST_REPOSITORY_TOKEN, useClass: BlogPostAdapter },
    { provide: EVENT_REPOSITORY_TOKEN, useClass: EventAdapter },
    { provide: MEDIA_FILE_REPOSITORY_TOKEN, useClass: MediaFileAdapter },
    // CMS Page Use Cases
    GetCmsPagesUseCase,
    GetCmsPageBySlugUseCase,
    GetCmsPageByIdUseCase,
    CreateCmsPageUseCase,
    UpdateCmsPageUseCase,
    PublishCmsPageUseCase,
    // Blog Post Use Cases
    GetPublishedBlogPostsUseCase,
    GetBlogPostBySlugUseCase,
    GetBlogPostsUseCase,
    GetBlogPostByIdUseCase,
    CreateBlogPostUseCase,
    UpdateBlogPostUseCase,
    PublishBlogPostUseCase,
    DeleteBlogPostUseCase,
    // Event Use Cases
    GetActiveEventsUseCase,
    GetEventByIdPublicUseCase,
    GetEventsUseCase,
    GetEventByIdUseCase,
    CreateEventUseCase,
    UpdateEventUseCase,
    ToggleEventFeaturedUseCase,
    DeleteEventUseCase,
    // Media File Use Cases
    GetMediaFilesUseCase,
    GetMediaFileByIdUseCase,
    CreateMediaFileUseCase,
    UpdateMediaFileUseCase,
    DeleteMediaFileUseCase,
  ],
  exports: [
    CMS_PAGE_REPOSITORY_TOKEN,
    BLOG_POST_REPOSITORY_TOKEN,
    EVENT_REPOSITORY_TOKEN,
    MEDIA_FILE_REPOSITORY_TOKEN,
  ],
})
export class CmsModule {}
