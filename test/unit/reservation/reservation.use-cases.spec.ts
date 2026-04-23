import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  CheckAvailabilityUseCase,
  CreateReservationUseCase,
  GetReservationByTokenUseCase,
  CancelReservationByTokenUseCase,
  ListReservationsUseCase,
  GetCalendarViewUseCase,
  AdminCreateReservationUseCase,
  UpdateReservationStatusUseCase,
  GetSlotConfigUseCase,
  UpsertSlotConfigUseCase,
} from '@/application/reservation/use-cases/reservation.use-cases';
import {
  RESERVATION_REPOSITORY_TOKEN,
  SLOT_CONFIG_REPOSITORY_TOKEN,
} from '@/domain/reservation/ports/reservation.repository.token';
import { LOCATION_REPOSITORY_TOKEN } from '@/domain/location/ports/location.repository.token';
import {
  ReservationEntity,
  SlotConfigEntity,
  ReservationStatus,
} from '@/domain/reservation/entities/reservation.entity';

const mockSlotConfig = SlotConfigEntity.reconstitute({
  id: BigInt(1),
  locationId: BigInt(1),
  slotDuration: 30,
  maxGuestsPerSlot: 20,
  minAdvanceHours: 2,
  maxAdvanceDays: 30,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockLocation = {
  id: BigInt(1),
  isActive: true,
  hours: [
    { dayOfWeek: 0, isOpen: true, openTime: '10:00', closeTime: '22:00' },
    { dayOfWeek: 1, isOpen: true, openTime: '10:00', closeTime: '22:00' },
    { dayOfWeek: 2, isOpen: true, openTime: '10:00', closeTime: '22:00' },
    { dayOfWeek: 3, isOpen: true, openTime: '10:00', closeTime: '22:00' },
    { dayOfWeek: 4, isOpen: true, openTime: '10:00', closeTime: '22:00' },
    { dayOfWeek: 5, isOpen: true, openTime: '10:00', closeTime: '23:00' },
    { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '23:00' },
  ],
};

const mockReservation = ReservationEntity.reconstitute({
  id: BigInt(1),
  token: 'res-token-123',
  locationId: BigInt(1),
  guestName: 'John Doe',
  guestEmail: 'john@example.com',
  guestPhone: '+17025551234',
  partySize: 4,
  reservationDate: new Date('2026-04-25'),
  reservationTime: '18:00',
  status: 'PENDING' as ReservationStatus,
  specialRequest: null,
  internalNote: null,
  createdByAdminId: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('Reservation Use Cases', () => {
  let checkAvailabilityUseCase: CheckAvailabilityUseCase;
  let createReservationUseCase: CreateReservationUseCase;
  let getByTokenUseCase: GetReservationByTokenUseCase;
  let cancelByTokenUseCase: CancelReservationByTokenUseCase;
  let listReservationsUseCase: ListReservationsUseCase;
  let getCalendarViewUseCase: GetCalendarViewUseCase;
  let adminCreateUseCase: AdminCreateReservationUseCase;
  let updateStatusUseCase: UpdateReservationStatusUseCase;
  let getSlotConfigUseCase: GetSlotConfigUseCase;
  let upsertSlotConfigUseCase: UpsertSlotConfigUseCase;

  let mockReservationRepository: any;
  let mockSlotConfigRepository: any;
  let mockLocationRepository: any;

  beforeEach(async () => {
    mockReservationRepository = {
      findById: jest.fn(),
      findByToken: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      countBySlot: jest.fn(),
    };

    mockSlotConfigRepository = {
      findByLocationId: jest.fn(),
      upsert: jest.fn(),
    };

    mockLocationRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckAvailabilityUseCase,
        CreateReservationUseCase,
        GetReservationByTokenUseCase,
        CancelReservationByTokenUseCase,
        ListReservationsUseCase,
        GetCalendarViewUseCase,
        AdminCreateReservationUseCase,
        UpdateReservationStatusUseCase,
        GetSlotConfigUseCase,
        UpsertSlotConfigUseCase,
        { provide: RESERVATION_REPOSITORY_TOKEN, useValue: mockReservationRepository },
        { provide: SLOT_CONFIG_REPOSITORY_TOKEN, useValue: mockSlotConfigRepository },
        { provide: LOCATION_REPOSITORY_TOKEN, useValue: mockLocationRepository },
      ],
    }).compile();

    checkAvailabilityUseCase = module.get<CheckAvailabilityUseCase>(CheckAvailabilityUseCase);
    createReservationUseCase = module.get<CreateReservationUseCase>(CreateReservationUseCase);
    getByTokenUseCase = module.get<GetReservationByTokenUseCase>(GetReservationByTokenUseCase);
    cancelByTokenUseCase = module.get<CancelReservationByTokenUseCase>(CancelReservationByTokenUseCase);
    listReservationsUseCase = module.get<ListReservationsUseCase>(ListReservationsUseCase);
    getCalendarViewUseCase = module.get<GetCalendarViewUseCase>(GetCalendarViewUseCase);
    adminCreateUseCase = module.get<AdminCreateReservationUseCase>(AdminCreateReservationUseCase);
    updateStatusUseCase = module.get<UpdateReservationStatusUseCase>(UpdateReservationStatusUseCase);
    getSlotConfigUseCase = module.get<GetSlotConfigUseCase>(GetSlotConfigUseCase);
    upsertSlotConfigUseCase = module.get<UpsertSlotConfigUseCase>(UpsertSlotConfigUseCase);
  });

  // ==================== CHECK AVAILABILITY ====================

  describe('CheckAvailabilityUseCase', () => {
    it('should return available slots for a valid date', async () => {
      mockSlotConfigRepository.findByLocationId.mockResolvedValue(mockSlotConfig);
      mockLocationRepository.findById.mockResolvedValue(mockLocation);
      mockReservationRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 1000,
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const dateStr = futureDate.toISOString().split('T')[0]!;

      const result = await checkAvailabilityUseCase.execute({
        locationId: 1,
        date: dateStr,
        partySize: 2,
      });

      expect(result.slots).toBeDefined();
      expect(result.slots.length).toBeGreaterThan(0);
      expect(result.locationId).toBe(1);
      expect(result.partySize).toBe(2);
    });

    it('should throw BadRequestException if no slot config found', async () => {
      mockSlotConfigRepository.findByLocationId.mockResolvedValue(null);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const dateStr = futureDate.toISOString().split('T')[0]!;

      await expect(
        checkAvailabilityUseCase.execute({
          locationId: 1,
          date: dateStr,
          partySize: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if location not found', async () => {
      mockSlotConfigRepository.findByLocationId.mockResolvedValue(mockSlotConfig);
      mockLocationRepository.findById.mockResolvedValue(null);

      await expect(
        checkAvailabilityUseCase.execute({
          locationId: 999,
          date: '2026-05-01',
          partySize: 2,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if location is inactive', async () => {
      mockSlotConfigRepository.findByLocationId.mockResolvedValue(mockSlotConfig);
      mockLocationRepository.findById.mockResolvedValue({ ...mockLocation, isActive: false });

      await expect(
        checkAvailabilityUseCase.execute({
          locationId: 1,
          date: '2026-05-01',
          partySize: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return empty slots when location is closed on that day', async () => {
      mockSlotConfigRepository.findByLocationId.mockResolvedValue(mockSlotConfig);
      const closedLocation = {
        ...mockLocation,
        hours: mockLocation.hours.map((h) => ({ ...h, isOpen: false })),
      };
      mockLocationRepository.findById.mockResolvedValue(closedLocation);

      const result = await checkAvailabilityUseCase.execute({
        locationId: 1,
        date: '2026-04-25',
        partySize: 2,
      });

      expect(result.slots).toHaveLength(0);
    });

    it('should throw BadRequestException if booking too far in advance', async () => {
      mockSlotConfigRepository.findByLocationId.mockResolvedValue(mockSlotConfig);
      mockLocationRepository.findById.mockResolvedValue(mockLocation);

      const farFutureDate = new Date();
      farFutureDate.setDate(farFutureDate.getDate() + 60);
      const dateStr = farFutureDate.toISOString().split('T')[0]!;

      await expect(
        checkAvailabilityUseCase.execute({
          locationId: 1,
          date: dateStr,
          partySize: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should mark slots as unavailable when fully booked', async () => {
      mockSlotConfigRepository.findByLocationId.mockResolvedValue(mockSlotConfig);
      mockLocationRepository.findById.mockResolvedValue(mockLocation);

      const fullyBookedReservation = ReservationEntity.reconstitute({
        id: BigInt(2),
        token: 'another-token',
        locationId: BigInt(1),
        guestName: 'Jane Doe',
        guestEmail: 'jane@example.com',
        guestPhone: '+17025551235',
        partySize: 20,
        reservationDate: new Date(),
        reservationTime: '18:00',
        status: 'PENDING' as ReservationStatus,
        specialRequest: null,
        internalNote: null,
        createdByAdminId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockReservationRepository.findAll.mockResolvedValue({
        data: [fullyBookedReservation],
        total: 1,
        page: 1,
        limit: 1000,
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const dateStr = futureDate.toISOString().split('T')[0]!;

      const result = await checkAvailabilityUseCase.execute({
        locationId: 1,
        date: dateStr,
        partySize: 4,
      });

      const slot18 = result.slots.find((s) => s.time === '18:00');
      expect(slot18).toBeDefined();
      expect(slot18!.availableSeats).toBe(0);
      expect(slot18!.isAvailable).toBe(false);
    });
  });

  // ==================== CREATE RESERVATION ====================

  describe('CreateReservationUseCase', () => {
    it('should create a reservation successfully', async () => {
      mockLocationRepository.findById.mockResolvedValue(mockLocation);
      mockSlotConfigRepository.findByLocationId.mockResolvedValue(mockSlotConfig);
      mockReservationRepository.countBySlot.mockResolvedValue(0);
      mockReservationRepository.create.mockResolvedValue(mockReservation);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const dateStr = futureDate.toISOString().split('T')[0]!;

      const result = await createReservationUseCase.execute({
        locationId: 1,
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '+17025551234',
        date: dateStr,
        time: '18:00',
        partySize: 4,
      });

      expect(result.guestName).toBe('John Doe');
      expect(result.status).toBe('PENDING');
      expect(mockReservationRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if location not found', async () => {
      mockLocationRepository.findById.mockResolvedValue(null);

      await expect(
        createReservationUseCase.execute({
          locationId: 999,
          guestName: 'John',
          guestEmail: 'john@test.com',
          guestPhone: '+123',
          date: '2026-05-01',
          time: '18:00',
          partySize: 2,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if location is not active', async () => {
      mockLocationRepository.findById.mockResolvedValue({ ...mockLocation, isActive: false });

      await expect(
        createReservationUseCase.execute({
          locationId: 1,
          guestName: 'John',
          guestEmail: 'john@test.com',
          guestPhone: '+123',
          date: '2026-05-01',
          time: '18:00',
          partySize: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if not enough seats', async () => {
      mockLocationRepository.findById.mockResolvedValue(mockLocation);
      mockSlotConfigRepository.findByLocationId.mockResolvedValue(mockSlotConfig);
      mockReservationRepository.countBySlot.mockResolvedValue(18);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const dateStr = futureDate.toISOString().split('T')[0]!;

      await expect(
        createReservationUseCase.execute({
          locationId: 1,
          guestName: 'John',
          guestEmail: 'john@test.com',
          guestPhone: '+123',
          date: dateStr,
          time: '18:00',
          partySize: 4,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==================== GET BY TOKEN ====================

  describe('GetReservationByTokenUseCase', () => {
    it('should return reservation by token', async () => {
      mockReservationRepository.findByToken.mockResolvedValue(mockReservation);

      const result = await getByTokenUseCase.execute('res-token-123');

      expect(result.token).toBe('res-token-123');
      expect(result.guestName).toBe('John Doe');
    });

    it('should throw NotFoundException if not found', async () => {
      mockReservationRepository.findByToken.mockResolvedValue(null);

      await expect(getByTokenUseCase.execute('invalid-token')).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== CANCEL BY TOKEN ====================

  describe('CancelReservationByTokenUseCase', () => {
    it('should cancel a cancellable reservation', async () => {
      const cancelled = ReservationEntity.reconstitute({
        id: BigInt(1),
        token: 'res-token-123',
        locationId: BigInt(1),
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '+17025551234',
        partySize: 4,
        reservationDate: new Date('2026-04-25'),
        reservationTime: '18:00',
        status: 'CANCELLED' as ReservationStatus,
        specialRequest: null,
        internalNote: null,
        createdByAdminId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockReservationRepository.findByToken.mockResolvedValue(mockReservation);
      mockReservationRepository.updateStatus.mockResolvedValue(cancelled);

      const result = await cancelByTokenUseCase.execute('res-token-123');

      expect(result.status).toBe('CANCELLED');
    });

    it('should throw NotFoundException if not found', async () => {
      mockReservationRepository.findByToken.mockResolvedValue(null);

      await expect(cancelByTokenUseCase.execute('invalid-token')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if not cancellable', async () => {
      const completedReservation = ReservationEntity.reconstitute({
        id: BigInt(1),
        token: 'res-token-123',
        locationId: BigInt(1),
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '+17025551234',
        partySize: 4,
        reservationDate: new Date('2026-04-25'),
        reservationTime: '18:00',
        status: 'COMPLETED' as ReservationStatus,
        specialRequest: null,
        internalNote: null,
        createdByAdminId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockReservationRepository.findByToken.mockResolvedValue(completedReservation);

      await expect(cancelByTokenUseCase.execute('res-token-123')).rejects.toThrow(BadRequestException);
    });
  });

  // ==================== LIST RESERVATIONS ====================

  describe('ListReservationsUseCase', () => {
    it('should return paginated reservations', async () => {
      mockReservationRepository.findAll.mockResolvedValue({
        data: [mockReservation],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await listReservationsUseCase.execute({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should use default pagination', async () => {
      mockReservationRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await listReservationsUseCase.execute({});

      expect(mockReservationRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
      );
    });
  });

  // ==================== UPDATE STATUS ====================

  describe('UpdateReservationStatusUseCase', () => {
    it('should update reservation status', async () => {
      const confirmed = ReservationEntity.reconstitute({
        id: BigInt(1),
        token: 'res-token-123',
        locationId: BigInt(1),
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '+17025551234',
        partySize: 4,
        reservationDate: new Date('2026-04-25'),
        reservationTime: '18:00',
        status: 'CONFIRMED' as ReservationStatus,
        specialRequest: null,
        internalNote: null,
        createdByAdminId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockReservationRepository.updateStatus.mockResolvedValue(confirmed);

      const result = await updateStatusUseCase.execute(BigInt(1), { status: 'CONFIRMED' });

      expect(result.status).toBe('CONFIRMED');
    });

    it('should throw NotFoundException if not found', async () => {
      mockReservationRepository.findById.mockResolvedValue(null);

      await expect(
        updateStatusUseCase.execute(BigInt(999), { status: 'CONFIRMED' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== SLOT CONFIG ====================

  describe('GetSlotConfigUseCase', () => {
    it('should return slot config for location', async () => {
      mockSlotConfigRepository.findByLocationId.mockResolvedValue(mockSlotConfig);

      const result = await getSlotConfigUseCase.execute(BigInt(1));

      expect(result).not.toBeNull();
      expect(result!.slotDuration).toBe(30);
      expect(result!.maxGuestsPerSlot).toBe(20);
    });

    it('should return null if no config found', async () => {
      mockSlotConfigRepository.findByLocationId.mockResolvedValue(null);

      const result = await getSlotConfigUseCase.execute(BigInt(999));

      expect(result).toBeNull();
    });
  });

  describe('UpsertSlotConfigUseCase', () => {
    it('should upsert slot config', async () => {
      mockLocationRepository.findById.mockResolvedValue(mockLocation);
      mockSlotConfigRepository.upsert.mockResolvedValue(mockSlotConfig);

      const result = await upsertSlotConfigUseCase.execute(BigInt(1), {
        slotDuration: 30,
        maxGuestsPerSlot: 20,
        minAdvanceHours: 2,
        maxAdvanceDays: 30,
      });

      expect(result.slotDuration).toBe(30);
    });

    it('should throw NotFoundException if location not found', async () => {
      mockLocationRepository.findById.mockResolvedValue(null);

      await expect(
        upsertSlotConfigUseCase.execute(BigInt(999), {
          slotDuration: 30,
          maxGuestsPerSlot: 20,
          minAdvanceHours: 2,
          maxAdvanceDays: 30,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
