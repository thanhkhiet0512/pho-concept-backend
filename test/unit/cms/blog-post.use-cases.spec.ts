import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  GetPublishedBlogPostsUseCase,
  GetBlogPostBySlugUseCase,
  GetBlogPostsUseCase,
  GetBlogPostByIdUseCase,
  CreateBlogPostUseCase,
  UpdateBlogPostUseCase,
  PublishBlogPostUseCase,
  DeleteBlogPostUseCase,
} from '@/application/cms/use-cases';
import { BLOG_POST_REPOSITORY_TOKEN } from '@/domain/cms/ports/cms.repository.token';
import { BlogPostEntity, BlogPostStatus } from '@/domain/cms/entities/cms.entity';

const mockPost = BlogPostEntity.reconstitute({
  id: BigInt(1),
  slug: 'vietnamese-new-year',
  titleI18n: { en: 'Vietnamese New Year', vi: 'Tết Nguyên Đán' },
  contentI18n: { en: 'Content here', vi: 'Nội dung ở đây' },
  excerptI18n: { en: 'Excerpt', vi: 'Trích dẫn' },
  metaDescriptionI18n: { en: 'Meta description' },
  coverImageUrl: 'https://cdn.example.com/cover.jpg',
  status: BlogPostStatus.DRAFT,
  publishedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('Blog Post Use Cases', () => {
  let getPublishedBlogPostsUseCase: GetPublishedBlogPostsUseCase;
  let getBlogPostBySlugUseCase: GetBlogPostBySlugUseCase;
  let getBlogPostsUseCase: GetBlogPostsUseCase;
  let getBlogPostByIdUseCase: GetBlogPostByIdUseCase;
  let createBlogPostUseCase: CreateBlogPostUseCase;
  let updateBlogPostUseCase: UpdateBlogPostUseCase;
  let publishBlogPostUseCase: PublishBlogPostUseCase;
  let deleteBlogPostUseCase: DeleteBlogPostUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findPublished: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      hardDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPublishedBlogPostsUseCase,
        GetBlogPostBySlugUseCase,
        GetBlogPostsUseCase,
        GetBlogPostByIdUseCase,
        CreateBlogPostUseCase,
        UpdateBlogPostUseCase,
        PublishBlogPostUseCase,
        DeleteBlogPostUseCase,
        { provide: BLOG_POST_REPOSITORY_TOKEN, useValue: mockRepository },
      ],
    }).compile();

    getPublishedBlogPostsUseCase = module.get<GetPublishedBlogPostsUseCase>(GetPublishedBlogPostsUseCase);
    getBlogPostBySlugUseCase = module.get<GetBlogPostBySlugUseCase>(GetBlogPostBySlugUseCase);
    getBlogPostsUseCase = module.get<GetBlogPostsUseCase>(GetBlogPostsUseCase);
    getBlogPostByIdUseCase = module.get<GetBlogPostByIdUseCase>(GetBlogPostByIdUseCase);
    createBlogPostUseCase = module.get<CreateBlogPostUseCase>(CreateBlogPostUseCase);
    updateBlogPostUseCase = module.get<UpdateBlogPostUseCase>(UpdateBlogPostUseCase);
    publishBlogPostUseCase = module.get<PublishBlogPostUseCase>(PublishBlogPostUseCase);
    deleteBlogPostUseCase = module.get<DeleteBlogPostUseCase>(DeleteBlogPostUseCase);
  });

  describe('GetPublishedBlogPostsUseCase', () => {
    it('should return paginated published posts', async () => {
      const published = BlogPostEntity.reconstitute({
        ...mockPost,
        status: BlogPostStatus.PUBLISHED,
        publishedAt: new Date(),
      } as any);
      mockRepository.findPublished.mockResolvedValue({
        data: [published],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const result = await getPublishedBlogPostsUseCase.execute({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should use default pagination when not provided', async () => {
      mockRepository.findPublished.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await getPublishedBlogPostsUseCase.execute();

      expect(mockRepository.findPublished).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('GetBlogPostBySlugUseCase (public)', () => {
    it('should return published post by slug', async () => {
      const published = BlogPostEntity.reconstitute({
        id: BigInt(1),
        slug: 'vietnamese-new-year',
        titleI18n: { en: 'Vietnamese New Year', vi: 'Tết Nguyên Đán' },
        contentI18n: { en: 'Content here', vi: 'Nội dung ở đây' },
        excerptI18n: { en: 'Excerpt', vi: 'Trích dẫn' },
        metaDescriptionI18n: { en: 'Meta description' },
        coverImageUrl: 'https://cdn.example.com/cover.jpg',
        status: BlogPostStatus.PUBLISHED,
        publishedAt: new Date(),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });
      mockRepository.findBySlug.mockResolvedValue(published);

      const result = await getBlogPostBySlugUseCase.execute('vietnamese-new-year');

      expect(result.slug).toBe('vietnamese-new-year');
    });

    it('should throw NotFoundException if slug not found', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);

      await expect(getBlogPostBySlugUseCase.execute('not-found')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if post is not published', async () => {
      mockRepository.findBySlug.mockResolvedValue(mockPost);

      await expect(getBlogPostBySlugUseCase.execute('vietnamese-new-year')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GetBlogPostsUseCase (admin)', () => {
    it('should return all posts', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [mockPost],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await getBlogPostsUseCase.execute();

      expect(result.data).toHaveLength(1);
    });
  });

  describe('GetBlogPostByIdUseCase', () => {
    it('should return post by id', async () => {
      mockRepository.findById.mockResolvedValue(mockPost);

      const result = await getBlogPostByIdUseCase.execute(BigInt(1));

      expect(result.id).toBe(BigInt(1));
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(getBlogPostByIdUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });

  describe('CreateBlogPostUseCase', () => {
    it('should create post in DRAFT status', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockPost);

      await createBlogPostUseCase.execute({
        slug: 'vietnamese-new-year',
        titleI18n: { en: 'Vietnamese New Year' },
        contentI18n: { en: 'Content' },
      });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: BlogPostStatus.DRAFT }),
      );
    });
  });

  describe('UpdateBlogPostUseCase', () => {
    it('should update post successfully', async () => {
      const updated = BlogPostEntity.reconstitute({
        ...mockPost,
        titleI18n: { en: 'Updated Title' },
      } as any);
      mockRepository.findById.mockResolvedValue(mockPost);
      mockRepository.update.mockResolvedValue(updated);

      const result = await updateBlogPostUseCase.execute(BigInt(1), {
        titleI18n: { en: 'Updated Title' },
      });

      expect(result.titleI18n).toEqual({ en: 'Updated Title' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        updateBlogPostUseCase.execute(BigInt(999), { titleI18n: { en: 'Test' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('PublishBlogPostUseCase', () => {
    it('should update post status to PUBLISHED', async () => {
      const published = BlogPostEntity.reconstitute({
        ...mockPost,
        status: BlogPostStatus.PUBLISHED,
      } as any);
      mockRepository.findById.mockResolvedValue(mockPost);
      mockRepository.updateStatus.mockResolvedValue(published);

      const result = await publishBlogPostUseCase.execute(BigInt(1), { status: 'PUBLISHED' });

      expect(result.status).toBe(BlogPostStatus.PUBLISHED);
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(BigInt(1), BlogPostStatus.PUBLISHED);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        publishBlogPostUseCase.execute(BigInt(999), { status: 'PUBLISHED' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DeleteBlogPostUseCase', () => {
    it('should hard delete post', async () => {
      mockRepository.findById.mockResolvedValue(mockPost);
      mockRepository.hardDelete.mockResolvedValue(undefined);

      await expect(deleteBlogPostUseCase.execute(BigInt(1))).resolves.toBeUndefined();
      expect(mockRepository.hardDelete).toHaveBeenCalledWith(BigInt(1));
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(deleteBlogPostUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });
});
