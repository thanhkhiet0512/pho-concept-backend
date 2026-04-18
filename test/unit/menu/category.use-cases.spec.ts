import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  GetCategoriesUseCase,
  GetCategoryByIdUseCase,
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  ToggleCategoryUseCase,
  DeleteCategoryUseCase,
} from '@/application/menu/use-cases';
import { MENU_CATEGORY_REPOSITORY_TOKEN } from '@/domain/menu/ports/menu.repository.token';
import { MenuCategoryEntity } from '@/domain/menu/entities/menu.entity';

const mockCategory = MenuCategoryEntity.reconstitute({
  id: BigInt(1),
  slug: 'pho-noodles',
  nameI18n: { en: 'Pho Noodles', vi: 'Phở' },
  sortOrder: 1,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('Menu Category Use Cases', () => {
  let getCategoriesUseCase: GetCategoriesUseCase;
  let getCategoryByIdUseCase: GetCategoryByIdUseCase;
  let createCategoryUseCase: CreateCategoryUseCase;
  let updateCategoryUseCase: UpdateCategoryUseCase;
  let toggleCategoryUseCase: ToggleCategoryUseCase;
  let deleteCategoryUseCase: DeleteCategoryUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      toggle: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoriesUseCase,
        GetCategoryByIdUseCase,
        CreateCategoryUseCase,
        UpdateCategoryUseCase,
        ToggleCategoryUseCase,
        DeleteCategoryUseCase,
        { provide: MENU_CATEGORY_REPOSITORY_TOKEN, useValue: mockRepository },
      ],
    }).compile();

    getCategoriesUseCase = module.get<GetCategoriesUseCase>(GetCategoriesUseCase);
    getCategoryByIdUseCase = module.get<GetCategoryByIdUseCase>(GetCategoryByIdUseCase);
    createCategoryUseCase = module.get<CreateCategoryUseCase>(CreateCategoryUseCase);
    updateCategoryUseCase = module.get<UpdateCategoryUseCase>(UpdateCategoryUseCase);
    toggleCategoryUseCase = module.get<ToggleCategoryUseCase>(ToggleCategoryUseCase);
    deleteCategoryUseCase = module.get<DeleteCategoryUseCase>(DeleteCategoryUseCase);
  });

  describe('GetCategoriesUseCase', () => {
    it('should return paginated categories', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [mockCategory],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await getCategoriesUseCase.execute({ page: 1, limit: 20 }, true);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 20, isActive: true });
    });

    it('should default pagination', async () => {
      mockRepository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

      await getCategoriesUseCase.execute();

      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 20, isActive: undefined });
    });
  });

  describe('GetCategoryByIdUseCase', () => {
    it('should return category by id', async () => {
      mockRepository.findById.mockResolvedValue(mockCategory);

      const result = await getCategoryByIdUseCase.execute(BigInt(1));

      expect(result.id).toBe(BigInt(1));
      expect(result.slug).toBe('pho-noodles');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(getCategoryByIdUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });

  describe('CreateCategoryUseCase', () => {
    it('should create category successfully', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockCategory);

      const result = await createCategoryUseCase.execute({
        slug: 'pho-noodles',
        nameI18n: { en: 'Pho Noodles', vi: 'Phở' },
      });

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'pho-noodles', isActive: true }),
      );
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockRepository.findBySlug.mockResolvedValue(mockCategory);

      await expect(
        createCategoryUseCase.execute({ slug: 'pho-noodles', nameI18n: { en: 'Pho' } }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('UpdateCategoryUseCase', () => {
    it('should update category successfully', async () => {
      const updated = MenuCategoryEntity.reconstitute({
        id: BigInt(1),
        slug: 'pho-noodles',
        nameI18n: { en: 'Updated Name', vi: 'Phở Cập nhật' },
        sortOrder: 2,
        isActive: true,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date(),
      });
      mockRepository.findById.mockResolvedValue(mockCategory);
      mockRepository.update.mockResolvedValue(updated);

      const result = await updateCategoryUseCase.execute(BigInt(1), {
        nameI18n: { en: 'Updated Name', vi: 'Phở Cập nhật' },
        sortOrder: 2,
      });

      expect(result.nameI18n).toEqual({ en: 'Updated Name', vi: 'Phở Cập nhật' });
      expect(result.sortOrder).toBe(2);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        updateCategoryUseCase.execute(BigInt(999), { nameI18n: { en: 'Test' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('ToggleCategoryUseCase', () => {
    it('should toggle category active status', async () => {
      const toggled = MenuCategoryEntity.reconstitute({
        id: BigInt(1),
        slug: 'pho-noodles',
        nameI18n: { en: 'Pho Noodles' },
        sortOrder: 1,
        isActive: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date(),
      });
      mockRepository.findById.mockResolvedValue(mockCategory);
      mockRepository.toggle.mockResolvedValue(toggled);

      const result = await toggleCategoryUseCase.execute(BigInt(1), false);

      expect(result.isActive).toBe(false);
      expect(mockRepository.toggle).toHaveBeenCalledWith(BigInt(1), false);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(toggleCategoryUseCase.execute(BigInt(999), true)).rejects.toThrow(NotFoundException);
    });
  });

  describe('DeleteCategoryUseCase', () => {
    it('should soft delete category', async () => {
      mockRepository.findById.mockResolvedValue(mockCategory);
      mockRepository.softDelete.mockResolvedValue(undefined);

      await expect(deleteCategoryUseCase.execute(BigInt(1))).resolves.toBeUndefined();
      expect(mockRepository.softDelete).toHaveBeenCalledWith(BigInt(1));
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(deleteCategoryUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });
});
