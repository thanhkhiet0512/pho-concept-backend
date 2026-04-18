import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  GetActiveEventsUseCase,
  GetEventByIdPublicUseCase,
  GetEventsUseCase,
  GetEventByIdUseCase,
  CreateEventUseCase,
  UpdateEventUseCase,
  ToggleEventFeaturedUseCase,
  DeleteEventUseCase,
} from '@/application/cms/use-cases';
import { EVENT_REPOSITORY_TOKEN } from '@/domain/cms/ports/cms.repository.token';
import { EventEntity, EventType } from '@/domain/cms/entities/cms.entity';

const mockEvent = EventEntity.reconstitute({
  id: BigInt(1),
  titleI18n: { en: 'Spring Promotion', vi: 'Khuyến mã mùa xuân' },
  descriptionI18n: { en: 'Get 20% off', vi: 'Giảm 20%' },
  coverImageUrl: 'https://cdn.example.com/event.jpg',
  eventDate: new Date('2026-05-01'),
  eventEndDate: new Date('2026-05-03'),
  eventType: EventType.PROMOTION,
  isFeatured: false,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('Event Use Cases', () => {
  let getActiveEventsUseCase: GetActiveEventsUseCase;
  let getEventByIdPublicUseCase: GetEventByIdPublicUseCase;
  let getEventsUseCase: GetEventsUseCase;
  let getEventByIdUseCase: GetEventByIdUseCase;
  let createEventUseCase: CreateEventUseCase;
  let updateEventUseCase: UpdateEventUseCase;
  let toggleEventFeaturedUseCase: ToggleEventFeaturedUseCase;
  let deleteEventUseCase: DeleteEventUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findActive: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      toggleFeatured: jest.fn(),
      hardDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetActiveEventsUseCase,
        GetEventByIdPublicUseCase,
        GetEventsUseCase,
        GetEventByIdUseCase,
        CreateEventUseCase,
        UpdateEventUseCase,
        ToggleEventFeaturedUseCase,
        DeleteEventUseCase,
        { provide: EVENT_REPOSITORY_TOKEN, useValue: mockRepository },
      ],
    }).compile();

    getActiveEventsUseCase = module.get<GetActiveEventsUseCase>(GetActiveEventsUseCase);
    getEventByIdPublicUseCase = module.get<GetEventByIdPublicUseCase>(GetEventByIdPublicUseCase);
    getEventsUseCase = module.get<GetEventsUseCase>(GetEventsUseCase);
    getEventByIdUseCase = module.get<GetEventByIdUseCase>(GetEventByIdUseCase);
    createEventUseCase = module.get<CreateEventUseCase>(CreateEventUseCase);
    updateEventUseCase = module.get<UpdateEventUseCase>(UpdateEventUseCase);
    toggleEventFeaturedUseCase = module.get<ToggleEventFeaturedUseCase>(ToggleEventFeaturedUseCase);
    deleteEventUseCase = module.get<DeleteEventUseCase>(DeleteEventUseCase);
  });

  describe('GetActiveEventsUseCase (public)', () => {
    it('should return active events paginated', async () => {
      mockRepository.findActive.mockResolvedValue({
        data: [mockEvent],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await getActiveEventsUseCase.execute();

      expect(result.data).toHaveLength(1);
      expect(mockRepository.findActive).toHaveBeenCalled();
    });

    it('should filter by featured', async () => {
      mockRepository.findActive.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

      await getActiveEventsUseCase.execute({ featured: true });

      expect(mockRepository.findActive).toHaveBeenCalledWith(
        expect.objectContaining({ isFeatured: true }),
      );
    });

    it('should filter by upcoming', async () => {
      mockRepository.findActive.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

      await getActiveEventsUseCase.execute({ upcoming: true });

      expect(mockRepository.findActive).toHaveBeenCalledWith(
        expect.objectContaining({ upcoming: true }),
      );
    });
  });

  describe('GetEventByIdPublicUseCase (public)', () => {
    it('should return active event by id', async () => {
      mockRepository.findById.mockResolvedValue(mockEvent);

      const result = await getEventByIdPublicUseCase.execute(BigInt(1));

      expect(result.id).toBe(BigInt(1));
    });

    it('should throw NotFoundException if event not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(getEventByIdPublicUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if event is not active', async () => {
      const inactive = EventEntity.reconstitute({ ...mockEvent, isActive: false } as any);
      mockRepository.findById.mockResolvedValue(inactive);

      await expect(getEventByIdPublicUseCase.execute(BigInt(1))).rejects.toThrow(NotFoundException);
    });
  });

  describe('GetEventsUseCase (admin)', () => {
    it('should return all events', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [mockEvent],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await getEventsUseCase.execute();

      expect(result.data).toHaveLength(1);
    });

    it('should pass filter params to repository', async () => {
      mockRepository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

      await getEventsUseCase.execute({ isActive: false, isFeatured: true }, { page: 2, limit: 10 });

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 10, isActive: false, isFeatured: true }),
      );
    });
  });

  describe('GetEventByIdUseCase (admin)', () => {
    it('should return event by id regardless of active status', async () => {
      const inactive = EventEntity.reconstitute({ ...mockEvent, isActive: false } as any);
      mockRepository.findById.mockResolvedValue(inactive);

      const result = await getEventByIdUseCase.execute(BigInt(1));

      expect(result.id).toBe(BigInt(1));
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(getEventByIdUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });

  describe('CreateEventUseCase', () => {
    it('should create event with correct type', async () => {
      mockRepository.create.mockResolvedValue(mockEvent);

      await createEventUseCase.execute({
        titleI18n: { en: 'Spring Promotion' },
        eventDate: '2026-05-01',
        eventType: 'PROMOTION',
      });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          titleI18n: { en: 'Spring Promotion' },
          eventType: EventType.PROMOTION,
        }),
      );
    });

    it('should default isActive to true', async () => {
      mockRepository.create.mockResolvedValue(mockEvent);

      await createEventUseCase.execute({
        titleI18n: { en: 'Event' },
        eventDate: '2026-05-01',
        eventType: 'HOLIDAY',
      });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });
  });

  describe('UpdateEventUseCase', () => {
    it('should update event successfully', async () => {
      const updated = EventEntity.reconstitute({ ...mockEvent, titleI18n: { en: 'Updated Event' } } as any);
      mockRepository.findById.mockResolvedValue(mockEvent);
      mockRepository.update.mockResolvedValue(updated);

      const result = await updateEventUseCase.execute(BigInt(1), {
        titleI18n: { en: 'Updated Event' },
      });

      expect(result.titleI18n).toEqual({ en: 'Updated Event' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        updateEventUseCase.execute(BigInt(999), { titleI18n: { en: 'Test' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('ToggleEventFeaturedUseCase', () => {
    it('should toggle featured status', async () => {
      const featured = EventEntity.reconstitute({ ...mockEvent, isFeatured: true } as any);
      mockRepository.findById.mockResolvedValue(mockEvent);
      mockRepository.toggleFeatured.mockResolvedValue(featured);

      const result = await toggleEventFeaturedUseCase.execute(BigInt(1), true);

      expect(result.isFeatured).toBe(true);
      expect(mockRepository.toggleFeatured).toHaveBeenCalledWith(BigInt(1), true);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(toggleEventFeaturedUseCase.execute(BigInt(999), true)).rejects.toThrow(NotFoundException);
    });
  });

  describe('DeleteEventUseCase', () => {
    it('should hard delete event', async () => {
      mockRepository.findById.mockResolvedValue(mockEvent);
      mockRepository.hardDelete.mockResolvedValue(undefined);

      await expect(deleteEventUseCase.execute(BigInt(1))).resolves.toBeUndefined();
      expect(mockRepository.hardDelete).toHaveBeenCalledWith(BigInt(1));
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(deleteEventUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });
});
