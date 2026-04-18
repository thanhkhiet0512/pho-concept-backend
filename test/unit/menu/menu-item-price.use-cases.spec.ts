import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateMenuItemPricesUseCase } from '@/application/menu/use-cases';
import {
  MENU_ITEM_REPOSITORY_TOKEN,
  MENU_ITEM_PRICE_REPOSITORY_TOKEN,
} from '@/domain/menu/ports/menu.repository.token';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { MenuItemEntity } from '@/domain/menu/entities/menu.entity';

const mockItem = MenuItemEntity.reconstitute({
  id: BigInt(1),
  categoryId: BigInt(1),
  slug: 'pho-bo',
  nameI18n: { en: 'Pho Bo', vi: 'Phở Bò' },
  descriptionI18n: null,
  imageUrl: null,
  isFeatured: false,
  isActive: true,
  sortOrder: 1,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('Menu Item Price Use Cases', () => {
  let updatePricesUseCase: UpdateMenuItemPricesUseCase;
  let mockItemRepository: any;
  let mockPriceRepository: any;
  let mockPrisma: any;

  beforeEach(async () => {
    mockItemRepository = {
      findById: jest.fn(),
    };

    mockPriceRepository = {
      upsert: jest.fn(),
    };

    mockPrisma = {
      location: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMenuItemPricesUseCase,
        { provide: MENU_ITEM_REPOSITORY_TOKEN, useValue: mockItemRepository },
        { provide: MENU_ITEM_PRICE_REPOSITORY_TOKEN, useValue: mockPriceRepository },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    updatePricesUseCase = module.get<UpdateMenuItemPricesUseCase>(UpdateMenuItemPricesUseCase);
  });

  describe('UpdateMenuItemPricesUseCase', () => {
    it('should upsert prices for a valid item and location', async () => {
      const mockPrices: any[] = [];
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockPrisma.location.findUnique.mockResolvedValue({ id: BigInt(1), slug: 'ho-chi-minh' });
      mockPriceRepository.upsert.mockResolvedValue(mockPrices);

      const result = await updatePricesUseCase.execute(BigInt(1), {
        locationId: 1,
        prices: [
          { price: 12.99, sizeLabel: 'S' },
          { price: 15.99, sizeLabel: 'M' },
          { price: 18.99, sizeLabel: 'L' },
        ],
      });

      expect(result).toEqual(mockPrices);
      expect(mockItemRepository.findById).toHaveBeenCalledWith(BigInt(1));
      expect(mockPrisma.location.findUnique).toHaveBeenCalledWith({ where: { id: BigInt(1) } });
      expect(mockPriceRepository.upsert).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1),
        [
          { sizeLabel: 'S', price: 12.99, isActive: undefined },
          { sizeLabel: 'M', price: 15.99, isActive: undefined },
          { sizeLabel: 'L', price: 18.99, isActive: undefined },
        ],
      );
    });

    it('should throw NotFoundException if menu item not found', async () => {
      mockItemRepository.findById.mockResolvedValue(null);

      await expect(
        updatePricesUseCase.execute(BigInt(999), {
          locationId: 1,
          prices: [{ price: 12.99 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if location not found', async () => {
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockPrisma.location.findUnique.mockResolvedValue(null);

      await expect(
        updatePricesUseCase.execute(BigInt(1), {
          locationId: 999,
          prices: [{ price: 12.99 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should pass isActive to upsert when provided', async () => {
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockPrisma.location.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPriceRepository.upsert.mockResolvedValue([]);

      await updatePricesUseCase.execute(BigInt(1), {
        locationId: 1,
        prices: [{ price: 12.99, sizeLabel: 'S', isActive: false }],
      });

      expect(mockPriceRepository.upsert).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1),
        [{ sizeLabel: 'S', price: 12.99, isActive: false }],
      );
    });
  });
});
