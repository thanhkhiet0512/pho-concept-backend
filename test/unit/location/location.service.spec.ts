import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { LocationService } from '../../../src/application/location/services/location.service';
import { LOCATION_REPOSITORY } from '../../../src/domain/location/ports/location.repository.token';

describe('LocationService', () => {
  let service: LocationService;
  let mockLocationRepository: any;

  // Use plain object instead of typed entity
  const mockLocation = {
    id: BigInt(1),
    slug: 'ho-chi-minh',
    name: 'Ho Chi Minh City',
    address: '123 Main St',
    city: 'Ho Chi Minh',
    state: 'HCM',
    zip: '70000',
    phone: '1234567890',
    email: 'hcm@test.com',
    timezone: 'Asia/Ho_Chi_Minh',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockLocationRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateHours: jest.fn(),
      toggle: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        { provide: LOCATION_REPOSITORY, useValue: mockLocationRepository },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  describe('findAll', () => {
    it('should return all locations', async () => {
      mockLocationRepository.findAll.mockResolvedValue([mockLocation]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockLocation);
    });

    it('should return empty array if no locations', async () => {
      mockLocationRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return location by id', async () => {
      mockLocationRepository.findById.mockResolvedValue(mockLocation);

      const result = await service.findById(BigInt(1));

      expect(result).toEqual(mockLocation);
    });

    it('should throw NotFoundException if location not found', async () => {
      mockLocationRepository.findById.mockResolvedValue(null);

      await expect(service.findById(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create location successfully', async () => {
      mockLocationRepository.findBySlug.mockResolvedValue(null);
      mockLocationRepository.create.mockResolvedValue(mockLocation);

      const result = await service.create({
        slug: 'ho-chi-minh',
        name: 'Ho Chi Minh City',
        address: '123 Main St',
        city: 'Ho Chi Minh',
        state: 'HCM',
        zip: '70000',
      });

      expect(result).toEqual(mockLocation);
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockLocationRepository.findBySlug.mockResolvedValue(mockLocation);

      await expect(
        service.create({
          slug: 'ho-chi-minh',
          name: 'Ho Chi Minh City',
          address: '123 Main St',
          city: 'Ho Chi Minh',
          state: 'HCM',
          zip: '70000',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update location successfully', async () => {
      const updatedLocation = { ...mockLocation, name: 'Updated Name' };
      mockLocationRepository.findById.mockResolvedValue(mockLocation);
      mockLocationRepository.update.mockResolvedValue(updatedLocation);

      const result = await service.update(BigInt(1), { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException if location not found', async () => {
      mockLocationRepository.findById.mockResolvedValue(null);

      await expect(service.update(BigInt(999), { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateHours', () => {
    it('should update hours successfully', async () => {
      mockLocationRepository.findById.mockResolvedValue(mockLocation);
      mockLocationRepository.updateHours.mockResolvedValue(undefined);

      await expect(
        service.updateHours(BigInt(1), [
          { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00' },
        ]),
      ).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if location not found', async () => {
      mockLocationRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateHours(BigInt(999), [
          { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00' },
        ]),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggle', () => {
    it('should toggle location status successfully', async () => {
      mockLocationRepository.findById.mockResolvedValue(mockLocation);
      mockLocationRepository.toggle.mockResolvedValue(undefined);

      await expect(service.toggle(BigInt(1), false)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if location not found', async () => {
      mockLocationRepository.findById.mockResolvedValue(null);

      await expect(service.toggle(BigInt(999), false)).rejects.toThrow(NotFoundException);
    });
  });
});
