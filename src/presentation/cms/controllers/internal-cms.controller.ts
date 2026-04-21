import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { AdminRole } from '@common/enums/admin-role.enum';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ParseBigIntPipe } from '@common/pipes/parse-bigint.pipe';
import { PaginationDto } from '@common/dto/pagination.dto';
import {
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
  CreateCmsPageDto,
  UpdateCmsPageDto,
  PublishCmsPageDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  UpdateBlogPostStatusDto,
  CreateEventDto,
  UpdateEventDto,
  ToggleEventFeaturedDto,
  UpdateMediaFileDto,
} from '@application/cms/dtos/cms.dto';
import { CmsPageResponseDto, BlogPostResponseDto, EventResponseDto, MediaFileResponseDto } from '../dtos/response/cms-response.dto';

@ApiTags('CMS - Admin')
@ApiBearerAuth()
@Controller('i')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternalCmsController {
  constructor(
    private readonly getCmsPagesUseCase: GetCmsPagesUseCase,
    private readonly getCmsPageByIdUseCase: GetCmsPageByIdUseCase,
    private readonly getCmsPageBySlugUseCase: GetCmsPageBySlugUseCase,
    private readonly createCmsPageUseCase: CreateCmsPageUseCase,
    private readonly updateCmsPageUseCase: UpdateCmsPageUseCase,
    private readonly publishCmsPageUseCase: PublishCmsPageUseCase,
    private readonly getBlogPostsUseCase: GetBlogPostsUseCase,
    private readonly getBlogPostByIdUseCase: GetBlogPostByIdUseCase,
    private readonly createBlogPostUseCase: CreateBlogPostUseCase,
    private readonly updateBlogPostUseCase: UpdateBlogPostUseCase,
    private readonly publishBlogPostUseCase: PublishBlogPostUseCase,
    private readonly deleteBlogPostUseCase: DeleteBlogPostUseCase,
    private readonly getEventsUseCase: GetEventsUseCase,
    private readonly getEventByIdUseCase: GetEventByIdUseCase,
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly toggleEventFeaturedUseCase: ToggleEventFeaturedUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
    private readonly getMediaFilesUseCase: GetMediaFilesUseCase,
    private readonly getMediaFileByIdUseCase: GetMediaFileByIdUseCase,
    private readonly createMediaFileUseCase: CreateMediaFileUseCase,
    private readonly updateMediaFileUseCase: UpdateMediaFileUseCase,
    private readonly deleteMediaFileUseCase: DeleteMediaFileUseCase,
    private readonly uploadMediaUseCase: UploadMediaUseCase,
  ) {}

  // ===================== CMS PAGES =====================

  @Get('cms/pages')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get all CMS pages (incl. unpublished)' })
  async getPages(@Query() pagination: PaginationDto) {
    const result = await this.getCmsPagesUseCase.execute(pagination);
    return {
      data: CmsPageResponseDto.fromList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('cms/pages/:slug')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get CMS page by slug (incl. unpublished)' })
  async getPageBySlug(@Param('slug') slug: string) {
    const page = await this.getCmsPageBySlugUseCase.execute(slug);
    return CmsPageResponseDto.from(page);
  }

  @Post('cms/pages')
  @Roles(AdminRole.OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new CMS page (OWNER only)' })
  async createPage(@Body() dto: CreateCmsPageDto) {
    const page = await this.createCmsPageUseCase.execute(dto);
    return CmsPageResponseDto.from(page);
  }

  @Put('cms/pages/:slug')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update CMS page content + SEO' })
  async updatePage(@Param('slug') slug: string, @Body() dto: UpdateCmsPageDto) {
    const page = await this.updateCmsPageUseCase.execute(slug, dto);
    return CmsPageResponseDto.from(page);
  }

  @Patch('cms/pages/:slug/publish')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Toggle page published status' })
  async publishPage(
    @Param('slug') slug: string,
    @Body() dto: PublishCmsPageDto,
  ) {
    const page = await this.publishCmsPageUseCase.execute(slug, dto.isPublished);
    return CmsPageResponseDto.from(page);
  }

  // ===================== BLOG POSTS =====================

  @Get('blog')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get all blog posts (incl. DRAFT/ARCHIVED)' })
  async getBlogPosts(@Query() pagination: PaginationDto) {
    const result = await this.getBlogPostsUseCase.execute(pagination);
    return {
      data: BlogPostResponseDto.fromList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('blog/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get blog post by ID (admin view)' })
  async getBlogPostById(@Param('id', ParseBigIntPipe) id: bigint) {
    const post = await this.getBlogPostByIdUseCase.execute(id);
    return BlogPostResponseDto.from(post);
  }

  @Post('blog')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new blog post (DRAFT)' })
  async createBlogPost(@Body() dto: CreateBlogPostDto) {
    const post = await this.createBlogPostUseCase.execute(dto);
    return BlogPostResponseDto.from(post);
  }

  @Put('blog/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update blog post' })
  async updateBlogPost(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateBlogPostDto,
  ) {
    const post = await this.updateBlogPostUseCase.execute(id, dto);
    return BlogPostResponseDto.from(post);
  }

  @Patch('blog/:id/publish')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Publish / Unpublish / Archive blog post' })
  async publishBlogPost(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateBlogPostStatusDto,
  ) {
    const post = await this.publishBlogPostUseCase.execute(id, { status: dto.status });
    return BlogPostResponseDto.from(post);
  }

  @Delete('blog/:id')
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
    const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
    const result = await this.getEventsUseCase.execute(
      { isActive, isFeatured: featured === 'true' ? true : featured === 'false' ? false : undefined, upcoming: upcoming === 'true' },
      pagination,
    );
    return {
      data: EventResponseDto.fromList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('events/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get event by ID' })
  async getEventById(@Param('id', ParseBigIntPipe) id: bigint) {
    const event = await this.getEventByIdUseCase.execute(id);
    return EventResponseDto.from(event);
  }

  @Post('events')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new event' })
  async createEvent(@Body() dto: CreateEventDto) {
    const event = await this.createEventUseCase.execute(dto);
    return EventResponseDto.from(event);
  }

  @Put('events/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update event' })
  async updateEvent(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateEventDto,
  ) {
    const event = await this.updateEventUseCase.execute(id, dto);
    return EventResponseDto.from(event);
  }

  @Patch('events/:id/toggle')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Toggle event featured status' })
  async toggleEventFeatured(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: ToggleEventFeaturedDto,
  ) {
    const event = await this.toggleEventFeaturedUseCase.execute(id, dto.isFeatured);
    return EventResponseDto.from(event);
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
  @ApiOperation({ summary: 'Get media files (paginated, filter by mimeType)' })
  async getMediaFiles(
    @Query() pagination: PaginationDto,
    @Query('mimeType') mimeType?: string,
  ) {
    const result = await this.getMediaFilesUseCase.execute({ mimeType }, pagination);
    return {
      data: MediaFileResponseDto.fromList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('media/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get media file by ID' })
  async getMediaFileById(@Param('id', ParseBigIntPipe) id: bigint) {
    const file = await this.getMediaFileByIdUseCase.execute(id);
    return MediaFileResponseDto.from(file);
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
  ) {
    if (!currentUser?.id) throw new BadRequestException('User not authenticated');
    const result = await this.uploadMediaUseCase.execute({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: BigInt(currentUser.id),
      altTextI18n: altTextEn ? { en: altTextEn, vi: altTextVi } : null,
    });
    return MediaFileResponseDto.from(result);
  }

  @Put('media/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update media file alt text' })
  async updateMediaFile(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateMediaFileDto,
  ) {
    const file = await this.updateMediaFileUseCase.execute(id, dto);
    return MediaFileResponseDto.from(file);
  }

  @Delete('media/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete media file (R2 + DB)' })
  async deleteMediaFile(@Param('id', ParseBigIntPipe) id: bigint) {
    const file = await this.deleteMediaFileUseCase.execute(id);
    return { message: 'Media file deleted successfully', r2Key: file.r2Key };
  }
}
