import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile,
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { AdminRole } from '@common/enums/admin-role.enum';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ParseBigIntPipe } from '@common/pipes/parse-bigint.pipe';
import { PaginationDto } from '@common/dto/pagination.dto';
import {
  GetPostCategoriesUseCase,
  GetPostCategoryByIdUseCase,
  CreatePostCategoryUseCase,
  UpdatePostCategoryUseCase,
  TogglePostCategoryUseCase,
  DeletePostCategoryUseCase,
  GetCmsPagesUseCase,
  GetCmsPageByIdUseCase,
  GetCmsPageBySlugUseCase,
  CreateCmsPageUseCase,
  UpdateCmsPageUseCase,
  PublishCmsPageUseCase,
  GetBlogPostsUseCase,
  GetBlogPostByIdUseCase,
  GetBlogPostBySlugUseCase,
  CreateBlogPostUseCase,
  UpdateBlogPostUseCase,
  PublishBlogPostUseCase,
  ToggleBlogPostFeaturedUseCase,
  DeleteBlogPostUseCase,
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
  UploadMediaUseCase,
} from '@application/cms/use-cases/cms.use-cases';
import {
  CreatePostCategoryDto,
  UpdatePostCategoryDto,
  TogglePostCategoryDto,
  CreateCmsPageDto,
  UpdateCmsPageDto,
  PublishCmsPageDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  UpdateBlogPostStatusDto,
  ToggleBlogPostFeaturedDto,
  CreateEventDto,
  UpdateEventDto,
  ToggleEventFeaturedDto,
  UpdateMediaFileDto,
} from '@application/cms/dtos/cms.dto';
import {
  PostCategoryResponseDto,
  CmsPageResponseDto,
  BlogPostResponseDto,
  EventResponseDto,
  MediaFileResponseDto,
} from '../dtos/response/cms-response.dto';
import { BlogPostStatus } from '@domain/cms/entities/cms.entity';

@ApiTags('CMS - Admin')
@ApiBearerAuth()
@Controller('i')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternalCmsController {
  constructor(
    // Post Categories
    private readonly getPostCategoriesUseCase: GetPostCategoriesUseCase,
    private readonly getPostCategoryByIdUseCase: GetPostCategoryByIdUseCase,
    private readonly createPostCategoryUseCase: CreatePostCategoryUseCase,
    private readonly updatePostCategoryUseCase: UpdatePostCategoryUseCase,
    private readonly togglePostCategoryUseCase: TogglePostCategoryUseCase,
    private readonly deletePostCategoryUseCase: DeletePostCategoryUseCase,
    // CMS Pages
    private readonly getCmsPagesUseCase: GetCmsPagesUseCase,
    private readonly getCmsPageByIdUseCase: GetCmsPageByIdUseCase,
    private readonly getCmsPageBySlugUseCase: GetCmsPageBySlugUseCase,
    private readonly createCmsPageUseCase: CreateCmsPageUseCase,
    private readonly updateCmsPageUseCase: UpdateCmsPageUseCase,
    private readonly publishCmsPageUseCase: PublishCmsPageUseCase,
    // Blog Posts
    private readonly getBlogPostsUseCase: GetBlogPostsUseCase,
    private readonly getBlogPostByIdUseCase: GetBlogPostByIdUseCase,
    private readonly getBlogPostBySlugUseCase: GetBlogPostBySlugUseCase,
    private readonly createBlogPostUseCase: CreateBlogPostUseCase,
    private readonly updateBlogPostUseCase: UpdateBlogPostUseCase,
    private readonly publishBlogPostUseCase: PublishBlogPostUseCase,
    private readonly toggleBlogPostFeaturedUseCase: ToggleBlogPostFeaturedUseCase,
    private readonly deleteBlogPostUseCase: DeleteBlogPostUseCase,
    // Events
    private readonly getEventsUseCase: GetEventsUseCase,
    private readonly getEventByIdUseCase: GetEventByIdUseCase,
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly toggleEventFeaturedUseCase: ToggleEventFeaturedUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
    // Media Files
    private readonly getMediaFilesUseCase: GetMediaFilesUseCase,
    private readonly getMediaFileByIdUseCase: GetMediaFileByIdUseCase,
    private readonly createMediaFileUseCase: CreateMediaFileUseCase,
    private readonly updateMediaFileUseCase: UpdateMediaFileUseCase,
    private readonly deleteMediaFileUseCase: DeleteMediaFileUseCase,
    private readonly uploadMediaUseCase: UploadMediaUseCase,
  ) {}

  // ===================== POST CATEGORIES =====================

  @Get('post-categories')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'List post categories' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false })
  async getPostCategories(
    @Query() pagination: PaginationDto,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    const result = await this.getPostCategoriesUseCase.execute({ ...pagination, isActive: active, search });
    return { data: PostCategoryResponseDto.fromList(result.data), total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages };
  }

  @Get('post-categories/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get post category by ID' })
  async getPostCategoryById(@Param('id', ParseBigIntPipe) id: bigint) {
    return PostCategoryResponseDto.from(await this.getPostCategoryByIdUseCase.execute(id));
  }

  @Post('post-categories')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create post category' })
  async createPostCategory(@Body() dto: CreatePostCategoryDto) {
    return PostCategoryResponseDto.from(await this.createPostCategoryUseCase.execute(dto));
  }

  @Put('post-categories/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update post category' })
  async updatePostCategory(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdatePostCategoryDto) {
    return PostCategoryResponseDto.from(await this.updatePostCategoryUseCase.execute(id, dto));
  }

  @Patch('post-categories/:id/toggle')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Toggle active/inactive' })
  async togglePostCategory(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: TogglePostCategoryDto) {
    return PostCategoryResponseDto.from(await this.togglePostCategoryUseCase.execute(id, dto.isActive));
  }

  @Delete('post-categories/:id')
  @Roles(AdminRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete post category (OWNER only)' })
  async deletePostCategory(@Param('id', ParseBigIntPipe) id: bigint) {
    await this.deletePostCategoryUseCase.execute(id);
    return { message: 'Post category deleted successfully' };
  }

  // ===================== CMS PAGES =====================

  @Get('cms/pages')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get all CMS pages (incl. unpublished)' })
  async getPages(@Query() pagination: PaginationDto) {
    const result = await this.getCmsPagesUseCase.execute(pagination);
    return { data: CmsPageResponseDto.fromList(result.data), total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages };
  }

  @Get('cms/pages/:slug')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get CMS page by slug (incl. unpublished)' })
  async getPageBySlug(@Param('slug') slug: string) {
    return CmsPageResponseDto.from(await this.getCmsPageBySlugUseCase.execute(slug));
  }

  @Post('cms/pages')
  @Roles(AdminRole.OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new CMS page (OWNER only)' })
  async createPage(@Body() dto: CreateCmsPageDto) {
    return CmsPageResponseDto.from(await this.createCmsPageUseCase.execute(dto));
  }

  @Put('cms/pages/:slug')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update CMS page content + SEO' })
  async updatePage(@Param('slug') slug: string, @Body() dto: UpdateCmsPageDto) {
    return CmsPageResponseDto.from(await this.updateCmsPageUseCase.execute(slug, dto));
  }

  @Patch('cms/pages/:slug/publish')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Toggle page published status' })
  async publishPage(@Param('slug') slug: string, @Body() dto: PublishCmsPageDto) {
    return CmsPageResponseDto.from(await this.publishCmsPageUseCase.execute(slug, dto.isPublished));
  }

  // ===================== BLOG POSTS =====================

  @Get('posts')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'List blog posts with filters' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'] })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'author', required: false })
  @ApiQuery({ name: 'publishMonth', required: false, description: 'Format: YYYY-MM' })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  async getBlogPosts(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('author') author?: string,
    @Query('publishMonth') publishMonth?: string,
    @Query('isFeatured') isFeatured?: string,
  ) {
    const result = await this.getBlogPostsUseCase.execute({
      ...pagination,
      status: status as BlogPostStatus | undefined,
      categoryId: categoryId ? BigInt(categoryId) : undefined,
      search,
      author,
      publishMonth,
      isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
    });
    return { data: BlogPostResponseDto.fromList(result.data), total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages };
  }

  @Get('posts/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get blog post by ID' })
  async getBlogPostById(@Param('id', ParseBigIntPipe) id: bigint) {
    return BlogPostResponseDto.from(await this.getBlogPostByIdUseCase.execute(id));
  }

  @Post('posts')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create blog post (DRAFT)' })
  async createBlogPost(@Body() dto: CreateBlogPostDto) {
    return BlogPostResponseDto.from(await this.createBlogPostUseCase.execute(dto));
  }

  @Put('posts/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update blog post' })
  async updateBlogPost(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateBlogPostDto) {
    return BlogPostResponseDto.from(await this.updateBlogPostUseCase.execute(id, dto));
  }

  @Patch('posts/:id/status')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Change blog post status (DRAFT/PUBLISHED/SCHEDULED/ARCHIVED)' })
  async updateBlogPostStatus(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateBlogPostStatusDto) {
    return BlogPostResponseDto.from(await this.publishBlogPostUseCase.execute(id, dto));
  }

  @Patch('posts/:id/toggle-featured')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Toggle featured flag on blog post' })
  async toggleBlogPostFeatured(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: ToggleBlogPostFeaturedDto) {
    return BlogPostResponseDto.from(await this.toggleBlogPostFeaturedUseCase.execute(id, dto.isFeatured));
  }

  @Delete('posts/:id')
  @Roles(AdminRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hard delete blog post (OWNER only)' })
  async deleteBlogPost(@Param('id', ParseBigIntPipe) id: bigint) {
    await this.deleteBlogPostUseCase.execute(id);
    return { message: 'Blog post deleted successfully' };
  }

  // ===================== EVENTS =====================

  @Get('events')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get all events (incl. expired)' })
  async getEvents(
    @Query() pagination: PaginationDto,
    @Query('active') active?: string,
    @Query('featured') featured?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    const result = await this.getEventsUseCase.execute(
      {
        isActive: active === 'true' ? true : active === 'false' ? false : undefined,
        isFeatured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        upcoming: upcoming === 'true',
      },
      pagination,
    );
    return { data: EventResponseDto.fromList(result.data), total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages };
  }

  @Get('events/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get event by ID' })
  async getEventById(@Param('id', ParseBigIntPipe) id: bigint) {
    return EventResponseDto.from(await this.getEventByIdUseCase.execute(id));
  }

  @Post('events')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new event' })
  async createEvent(@Body() dto: CreateEventDto) {
    return EventResponseDto.from(await this.createEventUseCase.execute(dto));
  }

  @Put('events/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update event' })
  async updateEvent(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateEventDto) {
    return EventResponseDto.from(await this.updateEventUseCase.execute(id, dto));
  }

  @Patch('events/:id/toggle')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Toggle event featured status' })
  async toggleEventFeatured(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: ToggleEventFeaturedDto) {
    return EventResponseDto.from(await this.toggleEventFeaturedUseCase.execute(id, dto.isFeatured));
  }

  @Delete('events/:id')
  @Roles(AdminRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hard delete event (OWNER only)' })
  async deleteEvent(@Param('id', ParseBigIntPipe) id: bigint) {
    await this.deleteEventUseCase.execute(id);
    return { message: 'Event deleted successfully' };
  }

  // ===================== MEDIA FILES =====================

  @Get('media')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'List media files (filter by type=image|video, folder, search)' })
  @ApiQuery({ name: 'type', required: false, enum: ['image', 'video'] })
  @ApiQuery({ name: 'folder', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getMediaFiles(
    @Query() pagination: PaginationDto,
    @Query('type') type?: string,
    @Query('folder') folder?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.getMediaFilesUseCase.execute({
      ...pagination,
      type: type === 'image' || type === 'video' ? type : undefined,
      folder,
      search,
    });
    return { data: MediaFileResponseDto.fromList(result.data), total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages };
  }

  @Get('media/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get media file by ID' })
  async getMediaFileById(@Param('id', ParseBigIntPipe) id: bigint) {
    return MediaFileResponseDto.from(await this.getMediaFileByIdUseCase.execute(id));
  }

  @Post('media/upload')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload file to MinIO storage' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  async uploadMedia(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^(image\/(jpeg|png|webp|gif|svg\+xml)|video\/(mp4|webm)|application\/pdf)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() currentUser: { id: number },
    @Body('altTextEn') altTextEn?: string,
    @Body('altTextVi') altTextVi?: string,
    @Body('title') title?: string,
    @Body('folder') folder?: string,
  ) {
    if (!currentUser?.id) throw new BadRequestException('User not authenticated');
    return MediaFileResponseDto.from(await this.uploadMediaUseCase.execute({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: BigInt(currentUser.id),
      altTextI18n: altTextEn ? { en: altTextEn, vi: altTextVi } : null,
      title: title ?? null,
      folder: folder ?? null,
    }));
  }

  @Put('media/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update media metadata (alt text, title, folder)' })
  async updateMediaFile(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateMediaFileDto) {
    return MediaFileResponseDto.from(await this.updateMediaFileUseCase.execute(id, dto));
  }

  @Delete('media/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete media (soft delete if used in posts, hard delete + MinIO cleanup otherwise)' })
  async deleteMediaFile(@Param('id', ParseBigIntPipe) id: bigint) {
    const result = await this.deleteMediaFileUseCase.execute(id);
    return { message: result.isDeleted ? 'Media soft-deleted (still in use by posts)' : 'Media file deleted successfully', r2Key: result.r2Key };
  }
}
