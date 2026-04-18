import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  GetMediaFilesUseCase,
  GetMediaFileByIdUseCase,
  CreateMediaFileUseCase,
  UpdateMediaFileUseCase,
  DeleteMediaFileUseCase,
} from '@/application/cms/use-cases';
import { MEDIA_FILE_REPOSITORY_TOKEN } from '@/domain/cms/ports/cms.repository.token';
import { MediaFileEntity } from '@/domain/cms/entities/cms.entity';

const mockFile = MediaFileEntity.reconstitute({
  id: BigInt(1),
  filename: 'hero-banner.jpg',
  r2Key: 'uploads/2026/hero-banner.jpg',
  url: 'https://cdn.example.com/uploads/2026/hero-banner.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: BigInt(204800),
  altTextI18n: { en: 'Hero banner', vi: 'Banner chính' },
  uploadedBy: BigInt(1),
  createdAt: new Date('2026-01-01'),
});

describe('Media File Use Cases', () => {
  let getMediaFilesUseCase: GetMediaFilesUseCase;
  let getMediaFileByIdUseCase: GetMediaFileByIdUseCase;
  let createMediaFileUseCase: CreateMediaFileUseCase;
  let updateMediaFileUseCase: UpdateMediaFileUseCase;
  let deleteMediaFileUseCase: DeleteMediaFileUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      hardDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMediaFilesUseCase,
        GetMediaFileByIdUseCase,
        CreateMediaFileUseCase,
        UpdateMediaFileUseCase,
        DeleteMediaFileUseCase,
        { provide: MEDIA_FILE_REPOSITORY_TOKEN, useValue: mockRepository },
      ],
    }).compile();

    getMediaFilesUseCase = module.get<GetMediaFilesUseCase>(GetMediaFilesUseCase);
    getMediaFileByIdUseCase = module.get<GetMediaFileByIdUseCase>(GetMediaFileByIdUseCase);
    createMediaFileUseCase = module.get<CreateMediaFileUseCase>(CreateMediaFileUseCase);
    updateMediaFileUseCase = module.get<UpdateMediaFileUseCase>(UpdateMediaFileUseCase);
    deleteMediaFileUseCase = module.get<DeleteMediaFileUseCase>(DeleteMediaFileUseCase);
  });

  describe('GetMediaFilesUseCase', () => {
    it('should return paginated media files', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [mockFile],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await getMediaFilesUseCase.execute(undefined, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by mimeType', async () => {
      mockRepository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

      await getMediaFilesUseCase.execute({ mimeType: 'image/' }, { page: 1, limit: 20 });

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        mimeType: 'image/',
      });
    });

    it('should use default pagination', async () => {
      mockRepository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

      await getMediaFilesUseCase.execute();

      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe('GetMediaFileByIdUseCase', () => {
    it('should return file by id', async () => {
      mockRepository.findById.mockResolvedValue(mockFile);

      const result = await getMediaFileByIdUseCase.execute(BigInt(1));

      expect(result.id).toBe(BigInt(1));
      expect(result.filename).toBe('hero-banner.jpg');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(getMediaFileByIdUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });

  describe('CreateMediaFileUseCase', () => {
    it('should create media file with all fields', async () => {
      mockRepository.create.mockResolvedValue(mockFile);

      await createMediaFileUseCase.execute({
        filename: 'hero-banner.jpg',
        r2Key: 'uploads/2026/hero-banner.jpg',
        url: 'https://cdn.example.com/uploads/2026/hero-banner.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: BigInt(204800),
        altTextI18n: { en: 'Hero banner', vi: 'Banner chính' },
        uploadedBy: BigInt(1),
      });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'hero-banner.jpg',
          mimeType: 'image/jpeg',
        }),
      );
    });
  });

  describe('UpdateMediaFileUseCase', () => {
    it('should update alt text', async () => {
      const updated = MediaFileEntity.reconstitute({
        ...mockFile,
        altTextI18n: { en: 'Updated alt' },
      } as any);
      mockRepository.findById.mockResolvedValue(mockFile);
      mockRepository.update.mockResolvedValue(updated);

      const result = await updateMediaFileUseCase.execute(BigInt(1), {
        altTextI18n: { en: 'Updated alt' },
      });

      expect(result.altTextI18n).toEqual({ en: 'Updated alt' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        updateMediaFileUseCase.execute(BigInt(999), { altTextI18n: { en: 'Test' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DeleteMediaFileUseCase', () => {
    it('should hard delete file and return r2Key', async () => {
      mockRepository.findById.mockResolvedValue(mockFile);
      mockRepository.hardDelete.mockResolvedValue(mockFile);

      await expect(deleteMediaFileUseCase.execute(BigInt(1))).resolves.toBeDefined();
      expect(mockRepository.hardDelete).toHaveBeenCalledWith(BigInt(1));
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(deleteMediaFileUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });
});
