import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  GetMenuItemsUseCase,
  GetMenuItemByIdUseCase,
  CreateMenuItemUseCase,
  UpdateMenuItemUseCase,
  ToggleMenuItemUseCase,
  DeleteMenuItemUseCase,
} from '@/application/menu/use-cases';
import {
  MENU_ITEM_REPOSITORY_TOKEN,
  MENU_CATEGORY_REPOSITORY_TOKEN,
} from '@/domain/menu/ports/menu.repository.token';
import { MenuItemEntity } from '@/domain/menu/entities/menu.entity';

const mockItem = MenuItemEntity.reconstitute({
  id: BigInt(1),
  categoryId: BigInt(1),
  slug: 'pho-bo',
  nameI18n: { en: 'Pho Bo', vi: 'Phở Bò' },
  descriptionI18n: { en: 'Delicious beef pho', vi: 'Phở bò thơm ngon' },
  imageUrl: 'https://cdn.example.com/pho-bo.jpg',
  isFeatured: false,
  isActive: true,
  sortOrder: 1,
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

const mockCategory = {
  id: BigInt(1),
  slug: 'pho-noodles',
  nameI18n: { en: 'Pho Noodles' },
  sortOrder: 1,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Menu Item Use Cases', () => {
  let getMenuItemsUseCase: GetMenuItemsUseCase;
  let getMenuItemByIdUseCase: GetMenuItemByIdUseCase;
  let createMenuItemUseCase: CreateMenuItemUseCase;
  let updateMenuItemUseCase: UpdateMenuItemUseCase;
  let toggleMenuItemUseCase: ToggleMenuItemUseCase;
  let deleteMenuItemUseCase: DeleteMenuItemUseCase;
  let mockItemRepository: any;
  let mockCategoryRepository: any;

  beforeEach(async () => {
    mockItemRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      toggle: jest.fn(),
    };

    mockCategoryRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMenuItemsUseCase,
        GetMenuItemByIdUseCase,
        CreateMenuItemUseCase,
        UpdateMenuItemUseCase,
        ToggleMenuItemUseCase,
        DeleteMenuItemUseCase,
        { provide: MENU_ITEM_REPOSITORY_TOKEN, useValue: mockItemRepository },
        { provide: MENU_CATEGORY_REPOSITORY_TOKEN, useValue: mockCategoryRepository },
      ],
    }).compile();

    getMenuItemsUseCase = module.get<GetMenuItemsUseCase>(GetMenuItemsUseCase);
    getMenuItemByIdUseCase = module.get<GetMenuItemByIdUseCase>(GetMenuItemByIdUseCase);
    createMenuItemUseCase = module.get<CreateMenuItemUseCase>(CreateMenuItemUseCase);
    updateMenuItemUseCase = module.get<UpdateMenuItemUseCase>(UpdateMenuItemUseCase);
    toggleMenuItemUseCase = module.get<ToggleMenuItemUseCase>(ToggleMenuItemUseCase);
    deleteMenuItemUseCase = module.get<DeleteMenuItemUseCase>(DeleteMenuItemUseCase);
  });

  describe('GetMenuItemsUseCase', () => {
    it('should return paginated menu items', async () => {
      mockItemRepository.findAll.mockResolvedValue({
        data: [mockItem],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await getMenuItemsUseCase.execute({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(mockItemRepository.findAll).toHaveBeenCalledWith({
        page: 1, limit: 20, categoryId: undefined, locationId: undefined, isActive: undefined, isFeatured: undefined,
      });
    });

    it('should filter by category, location, active, featured', async () => {
      mockItemRepository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

      await getMenuItemsUseCase.execute(
        { page: 1, limit: 20 },
        { categoryId: BigInt(1), locationId: BigInt(2), isActive: true, isFeatured: true },
      );

      expect(mockItemRepository.findAll).toHaveBeenCalledWith({
        page: 1, limit: 20, categoryId: BigInt(1), locationId: BigInt(2), isActive: true, isFeatured: true,
      });
    });
  });

  describe('GetMenuItemByIdUseCase', () => {
    it('should return menu item by id', async () => {
      mockItemRepository.findById.mockResolvedValue(mockItem);

      const result = await getMenuItemByIdUseCase.execute(BigInt(1));

      expect(result.id).toBe(BigInt(1));
      expect(result.slug).toBe('pho-bo');
    });

    it('should throw NotFoundException if not found', async () => {
      mockItemRepository.findById.mockResolvedValue(null);

      await expect(getMenuItemByIdUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });

  describe('CreateMenuItemUseCase', () => {
    it('should create menu item successfully', async () => {
      mockItemRepository.findBySlug.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockItemRepository.create.mockResolvedValue(mockItem);

      const result = await createMenuItemUseCase.execute({
        categoryId: 1,
        slug: 'pho-bo',
        nameI18n: { en: 'Pho Bo', vi: 'Phở Bò' },
      });

      expect(result).toBeDefined();
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(BigInt(1));
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockItemRepository.findBySlug.mockResolvedValue(mockItem);

      await expect(
        createMenuItemUseCase.execute({ categoryId: 1, slug: 'pho-bo', nameI18n: { en: 'Pho' } }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockItemRepository.findBySlug.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(
        createMenuItemUseCase.execute({ categoryId: 999, slug: 'pho-bo', nameI18n: { en: 'Pho' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UpdateMenuItemUseCase', () => {
    it('should update menu item successfully', async () => {
      const updated = MenuItemEntity.reconstitute({
        id: BigInt(1),
        categoryId: BigInt(1),
        slug: 'pho-bo',
        nameI18n: { en: 'Updated Pho Bo' },
        descriptionI18n: null,
        imageUrl: null,
        isFeatured: false,
        isActive: true,
        sortOrder: 2,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockItemRepository.update.mockResolvedValue(updated);

      const result = await updateMenuItemUseCase.execute(BigInt(1), {
        nameI18n: { en: 'Updated Pho Bo' },
        sortOrder: 2,
      });

      expect(result.nameI18n).toEqual({ en: 'Updated Pho Bo' });
    });

    it('should throw ConflictException if new slug already taken', async () => {
      const existing = MenuItemEntity.reconstitute({
        id: BigInt(99),
        categoryId: BigInt(1),
        slug: 'pho-ga',
        nameI18n: { en: 'Pho Ga' },
        descriptionI18n: null,
        imageUrl: null,
        isFeatured: false,
        isActive: true,
        sortOrder: 0,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockItemRepository.findBySlug.mockResolvedValue(existing);

      await expect(
        updateMenuItemUseCase.execute(BigInt(1), { slug: 'pho-ga' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating to same slug', async () => {
      const updated = MenuItemEntity.reconstitute({
        id: BigInt(1),
        categoryId: BigInt(1),
        slug: 'pho-bo',
        nameI18n: { en: 'Pho Bo Updated' },
        descriptionI18n: null,
        imageUrl: null,
        isFeatured: false,
        isActive: true,
        sortOrder: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockItemRepository.findBySlug.mockResolvedValue(mockItem);
      mockItemRepository.update.mockResolvedValue(updated);

      const result = await updateMenuItemUseCase.execute(BigInt(1), { slug: 'pho-bo', nameI18n: { en: 'Pho Bo Updated' } });

      expect(result.nameI18n).toEqual({ en: 'Pho Bo Updated' });
    });

    it('should throw NotFoundException if item not found', async () => {
      mockItemRepository.findById.mockResolvedValue(null);

      await expect(
        updateMenuItemUseCase.execute(BigInt(999), { nameI18n: { en: 'Test' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('ToggleMenuItemUseCase', () => {
    it('should toggle item active status', async () => {
      const toggled = MenuItemEntity.reconstitute({
        id: BigInt(1),
        categoryId: BigInt(1),
        slug: 'pho-bo',
        nameI18n: { en: 'Pho Bo' },
        descriptionI18n: null,
        imageUrl: null,
        isFeatured: false,
        isActive: false,
        sortOrder: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockItemRepository.toggle.mockResolvedValue(toggled);

      const result = await toggleMenuItemUseCase.execute(BigInt(1), false);

      expect(result.isActive).toBe(false);
      expect(mockItemRepository.toggle).toHaveBeenCalledWith(BigInt(1), false);
    });

    it('should throw NotFoundException if not found', async () => {
      mockItemRepository.findById.mockResolvedValue(null);

      await expect(toggleMenuItemUseCase.execute(BigInt(999), true)).rejects.toThrow(NotFoundException);
    });
  });

  describe('DeleteMenuItemUseCase', () => {
    it('should soft delete menu item', async () => {
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockItemRepository.softDelete.mockResolvedValue(undefined);

      await expect(deleteMenuItemUseCase.execute(BigInt(1))).resolves.toBeUndefined();
      expect(mockItemRepository.softDelete).toHaveBeenCalledWith(BigInt(1));
    });

    it('should throw NotFoundException if not found', async () => {
      mockItemRepository.findById.mockResolvedValue(null);

      await expect(deleteMenuItemUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });
});
