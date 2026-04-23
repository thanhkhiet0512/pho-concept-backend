import { Test, TestingModule } from '@nestjs/testing';
import { GetCateringPackagesUseCase } from '@/application/catering/use-cases/catering.use-cases';
import { CATERING_PACKAGE_REPOSITORY_TOKEN } from '@/domain/catering/ports/catering.repository.token';
import { CateringPackageEntity } from '@/domain/catering/entities/catering-package.entity';

const mockPackage = CateringPackageEntity.reconstitute({
  id: BigInt(1),
  name: 'Package S — Small Gathering',
  descriptionI18n: { en: 'Perfect for intimate gatherings', vi: 'Phù hợp cho buổi tụ họp nhỏ' },
  minGuests: 10,
  maxGuests: 30,
  basePrice: 45.0,
  includesI18n: {
    en: ['Pho Bar', 'Spring Rolls', 'Beverages'],
    vi: ['Bàn phở tự phục vụ', 'Chả giò', 'Đồ uống'],
  },
  isActive: true,
  sortOrder: 1,
  createdAt: new Date('2026-04-01'),
  updatedAt: new Date('2026-04-01'),
});

describe('Catering Package Use Cases', () => {
  let getCateringPackagesUseCase: GetCateringPackagesUseCase;
  let mockPackageRepository: any;

  beforeEach(async () => {
    mockPackageRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCateringPackagesUseCase,
        { provide: CATERING_PACKAGE_REPOSITORY_TOKEN, useValue: mockPackageRepository },
      ],
    }).compile();

    getCateringPackagesUseCase = module.get<GetCateringPackagesUseCase>(GetCateringPackagesUseCase);
  });

  describe('GetCateringPackagesUseCase', () => {
    it('should return all active packages', async () => {
      const packages = [
        mockPackage,
        CateringPackageEntity.reconstitute({
          id: BigInt(2),
          name: 'Package M — Medium Event',
          descriptionI18n: { en: 'Ideal for corporate events', vi: 'Lý tưởng cho sự kiện công ty' },
          minGuests: 30,
          maxGuests: 60,
          basePrice: 40.0,
          includesI18n: { en: ['Pho Bar'], vi: ['Bàn phở'] },
          isActive: true,
          sortOrder: 2,
          createdAt: new Date('2026-04-01'),
          updatedAt: new Date('2026-04-01'),
        }),
      ];
      mockPackageRepository.findAll.mockResolvedValue(packages);

      const result = await getCateringPackagesUseCase.execute();

      expect(result).toHaveLength(2);
      expect(result[0]!.name).toBe('Package S — Small Gathering');
      expect(result[1]!.name).toBe('Package M — Medium Event');
      expect(mockPackageRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no packages exist', async () => {
      mockPackageRepository.findAll.mockResolvedValue([]);

      const result = await getCateringPackagesUseCase.execute();

      expect(result).toHaveLength(0);
    });

    it('should return packages in the order returned by repository', async () => {
      const packages = [
        CateringPackageEntity.reconstitute({
          id: BigInt(3),
          name: 'Package L',
          descriptionI18n: { en: 'Large' },
          minGuests: 60,
          maxGuests: 150,
          basePrice: 35.0,
          includesI18n: { en: [] },
          isActive: true,
          sortOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        mockPackage,
      ];
      mockPackageRepository.findAll.mockResolvedValue(packages);

      const result = await getCateringPackagesUseCase.execute();

      expect(result).toHaveLength(2);
      expect(result[0]!.sortOrder).toBe(3);
      expect(result[1]!.sortOrder).toBe(1);
    });

    it('should include all package properties', async () => {
      mockPackageRepository.findAll.mockResolvedValue([mockPackage]);

      const result = await getCateringPackagesUseCase.execute();
      const pkg = result[0]!;

      expect(pkg.id).toBe(BigInt(1));
      expect(pkg.name).toBe('Package S — Small Gathering');
      expect(pkg.descriptionI18n).toEqual({ en: 'Perfect for intimate gatherings', vi: 'Phù hợp cho buổi tụ họp nhỏ' });
      expect(pkg.minGuests).toBe(10);
      expect(pkg.maxGuests).toBe(30);
      expect(pkg.basePrice).toBe(45.0);
      expect(pkg.includesI18n).toEqual({
        en: ['Pho Bar', 'Spring Rolls', 'Beverages'],
        vi: ['Bàn phở tự phục vụ', 'Chả giò', 'Đồ uống'],
      });
      expect(pkg.isActive).toBe(true);
      expect(pkg.sortOrder).toBe(1);
    });
  });
});
