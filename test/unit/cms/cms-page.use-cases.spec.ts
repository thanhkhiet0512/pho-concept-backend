import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  GetCmsPagesUseCase,
  GetCmsPageBySlugUseCase,
  GetCmsPageByIdUseCase,
  CreateCmsPageUseCase,
  UpdateCmsPageUseCase,
  PublishCmsPageUseCase,
} from '@/application/cms/use-cases';
import { CMS_PAGE_REPOSITORY_TOKEN } from '@/domain/cms/ports/cms.repository.token';
import { CmsPageEntity } from '@/domain/cms/entities/cms.entity';

const mockPage = CmsPageEntity.reconstitute({
  id: BigInt(1),
  slug: 'about-us',
  titleI18n: { en: 'About Us', vi: 'Giới thiệu' },
  metaDescriptionI18n: { en: 'About us page' },
  ogImageUrl: 'https://cdn.example.com/og.jpg',
  sections: [{ type: 'hero' }],
  isPublished: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('CMS Page Use Cases', () => {
  let getCmsPagesUseCase: GetCmsPagesUseCase;
  let getCmsPageBySlugUseCase: GetCmsPageBySlugUseCase;
  let getCmsPageByIdUseCase: GetCmsPageByIdUseCase;
  let createCmsPageUseCase: CreateCmsPageUseCase;
  let updateCmsPageUseCase: UpdateCmsPageUseCase;
  let publishCmsPageUseCase: PublishCmsPageUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findPublishedBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      togglePublish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCmsPagesUseCase,
        GetCmsPageBySlugUseCase,
        GetCmsPageByIdUseCase,
        CreateCmsPageUseCase,
        UpdateCmsPageUseCase,
        PublishCmsPageUseCase,
        { provide: CMS_PAGE_REPOSITORY_TOKEN, useValue: mockRepository },
      ],
    }).compile();

    getCmsPagesUseCase = module.get<GetCmsPagesUseCase>(GetCmsPagesUseCase);
    getCmsPageBySlugUseCase = module.get<GetCmsPageBySlugUseCase>(GetCmsPageBySlugUseCase);
    getCmsPageByIdUseCase = module.get<GetCmsPageByIdUseCase>(GetCmsPageByIdUseCase);
    createCmsPageUseCase = module.get<CreateCmsPageUseCase>(CreateCmsPageUseCase);
    updateCmsPageUseCase = module.get<UpdateCmsPageUseCase>(UpdateCmsPageUseCase);
    publishCmsPageUseCase = module.get<PublishCmsPageUseCase>(PublishCmsPageUseCase);
  });

  describe('GetCmsPagesUseCase', () => {
    it('should return paginated CMS pages', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [mockPage],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await getCmsPagesUseCase.execute({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe('GetCmsPageBySlugUseCase (public)', () => {
    it('should return published page by slug', async () => {
      mockRepository.findPublishedBySlug.mockResolvedValue(mockPage);

      const result = await getCmsPageBySlugUseCase.execute('about-us');

      expect(result.slug).toBe('about-us');
      expect(mockRepository.findPublishedBySlug).toHaveBeenCalledWith('about-us');
    });

    it('should throw NotFoundException if page not found', async () => {
      mockRepository.findPublishedBySlug.mockResolvedValue(null);

      await expect(getCmsPageBySlugUseCase.execute('not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GetCmsPageByIdUseCase', () => {
    it('should return page by id', async () => {
      mockRepository.findById.mockResolvedValue(mockPage);

      const result = await getCmsPageByIdUseCase.execute(BigInt(1));

      expect(result.id).toBe(BigInt(1));
    });

    it('should throw NotFoundException if page not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(getCmsPageByIdUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });

  describe('CreateCmsPageUseCase', () => {
    it('should create page successfully', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockPage);

      const result = await createCmsPageUseCase.execute({
        slug: 'about-us',
        titleI18n: { en: 'About Us', vi: 'Giới thiệu' },
      });

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockRepository.findBySlug.mockResolvedValue(mockPage);

      await expect(
        createCmsPageUseCase.execute({
          slug: 'about-us',
          titleI18n: { en: 'About Us' },
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('UpdateCmsPageUseCase', () => {
    it('should update page successfully', async () => {
      const updated = CmsPageEntity.reconstitute({
        ...mockPage,
        titleI18n: { en: 'Updated Title' },
      } as any);
      mockRepository.findBySlug.mockResolvedValue(mockPage);
      mockRepository.update.mockResolvedValue(updated);

      const result = await updateCmsPageUseCase.execute('about-us', {
        titleI18n: { en: 'Updated Title' },
      });

      expect(result.titleI18n).toEqual({ en: 'Updated Title' });
    });

    it('should throw NotFoundException if page not found', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);

      await expect(
        updateCmsPageUseCase.execute('not-found', { titleI18n: { en: 'Test' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('PublishCmsPageUseCase', () => {
    it('should publish page', async () => {
      const published = CmsPageEntity.reconstitute({
        ...mockPage,
        isPublished: true,
      } as any);
      mockRepository.findBySlug.mockResolvedValue(mockPage);
      mockRepository.togglePublish.mockResolvedValue(published);

      const result = await publishCmsPageUseCase.execute('about-us', true);

      expect(result.isPublished).toBe(true);
      expect(mockRepository.togglePublish).toHaveBeenCalledWith(BigInt(1), true);
    });

    it('should throw NotFoundException if page not found', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);

      await expect(publishCmsPageUseCase.execute('not-found', true)).rejects.toThrow(NotFoundException);
    });
  });
});
