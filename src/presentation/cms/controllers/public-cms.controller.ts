import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { ParseBigIntPipe } from '@common/pipes/parse-bigint.pipe';
import {
  GetCmsPageBySlugUseCase,
  GetPublishedBlogPostsUseCase,
  GetBlogPostBySlugUseCase,
  GetActiveEventsUseCase,
  GetEventByIdPublicUseCase,
} from '@application/cms/use-cases/cms.use-cases';
import { CmsPageResponseDto, BlogPostResponseDto, EventResponseDto } from '../dtos/response/cms-response.dto';

@ApiTags('CMS - Public')
@Controller('p')
export class PublicCmsController {
  constructor(
    private readonly getCmsPageBySlugUseCase: GetCmsPageBySlugUseCase,
    private readonly getPublishedBlogPostsUseCase: GetPublishedBlogPostsUseCase,
    private readonly getBlogPostBySlugUseCase: GetBlogPostBySlugUseCase,
    private readonly getActiveEventsUseCase: GetActiveEventsUseCase,
    private readonly getEventByIdPublicUseCase: GetEventByIdPublicUseCase,
  ) {}

  // ===================== CMS PAGES =====================

  @Public()
  @Get('cms/pages/:slug')
  @ApiOperation({ summary: 'Get published CMS page by slug' })
  async getPageBySlug(@Param('slug') slug: string) {
    const page = await this.getCmsPageBySlugUseCase.execute(slug);
    return CmsPageResponseDto.from(page);
  }

  // ===================== BLOG POSTS =====================

  @Public()
  @Get('blog')
  @ApiOperation({ summary: 'Get published blog posts (paginated)' })
  async getPublishedPosts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.getPublishedBlogPostsUseCase.execute({ page, limit });
    return {
      data: BlogPostResponseDto.fromList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Public()
  @Get('blog/:slug')
  @ApiOperation({ summary: 'Get published blog post by slug' })
  async getPostBySlug(@Param('slug') slug: string) {
    const post = await this.getBlogPostBySlugUseCase.execute(slug);
    return BlogPostResponseDto.from(post);
  }

  // ===================== EVENTS =====================

  @Public()
  @Get('events')
  @ApiOperation({ summary: 'Get active events (optional: featured, upcoming, page, limit)' })
  async getActiveEvents(
    @Query('featured') featured?: string,
    @Query('upcoming') upcoming?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const result = await this.getActiveEventsUseCase.execute(
      {
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        upcoming: upcoming === 'true',
      },
      { page, limit },
    );
    return {
      data: EventResponseDto.fromList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Public()
  @Get('events/:id')
  @ApiOperation({ summary: 'Get active event by ID' })
  async getEventById(@Param('id', ParseBigIntPipe) id: bigint) {
    const event = await this.getEventByIdPublicUseCase.execute(id);
    return EventResponseDto.from(event);
  }
}
