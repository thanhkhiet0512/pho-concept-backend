import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  SubmitCateringInquiryUseCase,
  GetCateringByTokenUseCase,
  ListCateringRequestsUseCase,
  GetCateringRequestDetailUseCase,
  QuoteCateringRequestUseCase,
  UpdateCateringStatusUseCase,
} from '@/application/catering/use-cases/catering.use-cases';
import {
  CATERING_REQUEST_REPOSITORY_TOKEN,
  CATERING_PACKAGE_REPOSITORY_TOKEN,
} from '@/domain/catering/ports/catering.repository.token';
import { CateringRequestEntity, CateringStatus } from '@/domain/catering/entities/catering-request.entity';
import { CateringPackageEntity } from '@/domain/catering/entities/catering-package.entity';
import { CateringQueue } from '@/infrastructure/queue/catering.queue';

const mockRequest = CateringRequestEntity.reconstitute({
  id: BigInt(1),
  token: 'abc-123-def',
  locationId: BigInt(1),
  packageId: BigInt(1),
  contactName: 'John Doe',
  contactEmail: 'john@example.com',
  contactPhone: '+17025551234',
  eventDate: new Date('2026-06-15'),
  eventTime: '18:00',
  guestCount: 50,
  venue: 'Backyard party',
  specialRequest: 'No pork',
  status: 'INQUIRY',
  quotedAmount: null,
  depositAmount: null,
  depositPaidAt: null,
  quotationDeadline: null,
  internalNote: null,
  handledByAdminId: null,
  deletedAt: null,
  createdAt: new Date('2026-04-24'),
  updatedAt: new Date('2026-04-24'),
});

const mockPackage = CateringPackageEntity.reconstitute({
  id: BigInt(1),
  name: 'Package S',
  descriptionI18n: { en: 'Small gathering' },
  minGuests: 10,
  maxGuests: 60,
  basePrice: 45.0,
  includesI18n: { en: ['Pho Bar'] },
  isActive: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('Catering Request Use Cases', () => {
  let submitInquiryUseCase: SubmitCateringInquiryUseCase;
  let getByTokenUseCase: GetCateringByTokenUseCase;
  let listRequestsUseCase: ListCateringRequestsUseCase;
  let getDetailUseCase: GetCateringRequestDetailUseCase;
  let quoteRequestUseCase: QuoteCateringRequestUseCase;
  let updateStatusUseCase: UpdateCateringStatusUseCase;
  let mockRequestRepository: any;
  let mockPackageRepository: any;
  let mockCateringQueue: any;

  beforeEach(async () => {
    mockRequestRepository = {
      findById: jest.fn(),
      findByToken: jest.fn(),
      findByIdWithItems: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      quote: jest.fn(),
      updateStatus: jest.fn(),
      softDelete: jest.fn(),
    };

    mockPackageRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    mockCateringQueue = {
      addInquiryReceived: jest.fn(),
      addQuoteSent: jest.fn(),
      addStatusChanged: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmitCateringInquiryUseCase,
        GetCateringByTokenUseCase,
        ListCateringRequestsUseCase,
        GetCateringRequestDetailUseCase,
        QuoteCateringRequestUseCase,
        UpdateCateringStatusUseCase,
        { provide: CATERING_REQUEST_REPOSITORY_TOKEN, useValue: mockRequestRepository },
        { provide: CATERING_PACKAGE_REPOSITORY_TOKEN, useValue: mockPackageRepository },
        { provide: CateringQueue, useValue: mockCateringQueue },
      ],
    }).compile();

    submitInquiryUseCase = module.get<SubmitCateringInquiryUseCase>(SubmitCateringInquiryUseCase);
    getByTokenUseCase = module.get<GetCateringByTokenUseCase>(GetCateringByTokenUseCase);
    listRequestsUseCase = module.get<ListCateringRequestsUseCase>(ListCateringRequestsUseCase);
    getDetailUseCase = module.get<GetCateringRequestDetailUseCase>(GetCateringRequestDetailUseCase);
    quoteRequestUseCase = module.get<QuoteCateringRequestUseCase>(QuoteCateringRequestUseCase);
    updateStatusUseCase = module.get<UpdateCateringStatusUseCase>(UpdateCateringStatusUseCase);
  });

  describe('SubmitCateringInquiryUseCase', () => {
    it('should submit inquiry without package', async () => {
      mockRequestRepository.create.mockResolvedValue(mockRequest);

      const result = await submitInquiryUseCase.execute({
        locationId: 1,
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
        contactPhone: '+17025551234',
        eventDate: '2026-06-15',
        eventTime: '18:00',
        guestCount: 50,
      });

      expect(result.contactName).toBe('John Doe');
      expect(result.status).toBe('INQUIRY');
      expect(mockRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          locationId: BigInt(1),
          contactName: 'John Doe',
          contactEmail: 'john@example.com',
          guestCount: 50,
        }),
      );
      expect(mockCateringQueue.addInquiryReceived).toHaveBeenCalledWith(mockRequest.id);
    });

    it('should submit inquiry with valid package', async () => {
      mockPackageRepository.findById.mockResolvedValue(mockPackage);
      mockRequestRepository.create.mockResolvedValue(mockRequest);

      await submitInquiryUseCase.execute({
        locationId: 1,
        packageId: 1,
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
        contactPhone: '+17025551234',
        eventDate: '2026-06-15',
        eventTime: '18:00',
        guestCount: 50,
      });

      expect(mockPackageRepository.findById).toHaveBeenCalledWith(BigInt(1));
      expect(mockRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ packageId: BigInt(1) }),
      );
    });

    it('should throw NotFoundException if package not found', async () => {
      mockPackageRepository.findById.mockResolvedValue(null);

      await expect(
        submitInquiryUseCase.execute({
          locationId: 1,
          packageId: 999,
          contactName: 'John',
          contactEmail: 'john@test.com',
          contactPhone: '+123',
          eventDate: '2026-06-15',
          eventTime: '18:00',
          guestCount: 50,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if package is inactive', async () => {
      const inactivePackage = CateringPackageEntity.reconstitute({
        ...mockPackage,
        isActive: false,
      } as any);
      mockPackageRepository.findById.mockResolvedValue(inactivePackage);

      await expect(
        submitInquiryUseCase.execute({
          locationId: 1,
          packageId: 1,
          contactName: 'John',
          contactEmail: 'john@test.com',
          contactPhone: '+123',
          eventDate: '2026-06-15',
          eventTime: '18:00',
          guestCount: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if guest count exceeds package limits', async () => {
      mockPackageRepository.findById.mockResolvedValue(mockPackage);

      await expect(
        submitInquiryUseCase.execute({
          locationId: 1,
          packageId: 1,
          contactName: 'John',
          contactEmail: 'john@test.com',
          contactPhone: '+123',
          eventDate: '2026-06-15',
          eventTime: '18:00',
          guestCount: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('GetCateringByTokenUseCase', () => {
    it('should return request by token', async () => {
      mockRequestRepository.findByToken.mockResolvedValue(mockRequest);

      const result = await getByTokenUseCase.execute('abc-123-def');

      expect(result.token).toBe('abc-123-def');
      expect(result.contactName).toBe('John Doe');
    });

    it('should throw NotFoundException if token not found', async () => {
      mockRequestRepository.findByToken.mockResolvedValue(null);

      await expect(getByTokenUseCase.execute('invalid-token')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if request is deleted', async () => {
      const deletedRequest = CateringRequestEntity.reconstitute({
        ...mockRequest,
        _deletedAt: new Date(),
      } as any);
      mockRequestRepository.findByToken.mockResolvedValue(deletedRequest);

      await expect(getByTokenUseCase.execute('abc-123-def')).rejects.toThrow(NotFoundException);
    });
  });

  describe('ListCateringRequestsUseCase', () => {
    it('should return paginated requests', async () => {
      mockRequestRepository.findAll.mockResolvedValue({
        data: [mockRequest],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await listRequestsUseCase.execute({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should filter by status', async () => {
      mockRequestRepository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

      await listRequestsUseCase.execute({ status: 'INQUIRY' });

      expect(mockRequestRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'INQUIRY' }),
      );
    });

    it('should use default pagination', async () => {
      mockRequestRepository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

      await listRequestsUseCase.execute({});

      expect(mockRequestRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
      );
    });
  });

  describe('GetCateringRequestDetailUseCase', () => {
    it('should return request with items', async () => {
      const resultWithItems = {
        request: mockRequest,
        items: [],
      };
      mockRequestRepository.findByIdWithItems.mockResolvedValue(resultWithItems);

      const result = await getDetailUseCase.execute(BigInt(1));

      expect(result.request.id).toBe(BigInt(1));
      expect(result.items).toEqual([]);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRequestRepository.findByIdWithItems.mockResolvedValue(null);

      await expect(getDetailUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });

  describe('QuoteCateringRequestUseCase', () => {
    it('should quote an INQUIRY request', async () => {
      const quotedRequest = CateringRequestEntity.reconstitute({
        ...mockRequest,
        status: 'QUOTED' as CateringStatus,
        quotedAmount: 950,
        depositAmount: 200,
        quotationDeadline: new Date(),
      } as any);
      mockRequestRepository.findById.mockResolvedValue(mockRequest);
      mockRequestRepository.quote.mockResolvedValue(quotedRequest);

      const result = await quoteRequestUseCase.execute(
        BigInt(1),
        {
          quotedAmount: 950,
          depositAmount: 200,
          quotationDeadlineDays: 7,
          items: [{ menuItemId: 1, quantity: 10, unitPrice: 95 }],
        },
        BigInt(1),
      );

      expect(result.status).toBe('QUOTED');
      expect(mockCateringQueue.addQuoteSent).toHaveBeenCalledWith(quotedRequest.id);
    });

    it('should throw NotFoundException if request not found', async () => {
      mockRequestRepository.findById.mockResolvedValue(null);

      await expect(
        quoteRequestUseCase.execute(
          BigInt(999),
          { quotedAmount: 950, depositAmount: 200, quotationDeadlineDays: 7, items: [] },
          BigInt(1),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if request is not quotable', async () => {
      const unquotableRequest = CateringRequestEntity.reconstitute({
        id: BigInt(1),
        token: 'abc-123',
        locationId: BigInt(1),
        packageId: null,
        contactName: 'John',
        contactEmail: 'john@test.com',
        contactPhone: '+123',
        eventDate: new Date(),
        eventTime: '18:00',
        guestCount: 50,
        venue: null,
        specialRequest: null,
        status: 'QUOTED',
        quotedAmount: 950,
        depositAmount: 200,
        depositPaidAt: null,
        quotationDeadline: new Date(),
        internalNote: null,
        handledByAdminId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockRequestRepository.findById.mockResolvedValue(unquotableRequest);

      await expect(
        quoteRequestUseCase.execute(
          BigInt(1),
          { quotedAmount: 950, depositAmount: 200, quotationDeadlineDays: 7, items: [{ menuItemId: 1, quantity: 10, unitPrice: 95 }] },
          BigInt(1),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no items provided', async () => {
      mockRequestRepository.findById.mockResolvedValue(mockRequest);

      await expect(
        quoteRequestUseCase.execute(
          BigInt(1),
          { quotedAmount: 950, depositAmount: 200, quotationDeadlineDays: 7, items: [] },
          BigInt(1),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if item has neither menuItemId nor customName', async () => {
      mockRequestRepository.findById.mockResolvedValue(mockRequest);

      await expect(
        quoteRequestUseCase.execute(
          BigInt(1),
          { quotedAmount: 950, depositAmount: 200, quotationDeadlineDays: 7, items: [{ quantity: 1, unitPrice: 10 }] },
          BigInt(1),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if deposit exceeds quoted amount', async () => {
      mockRequestRepository.findById.mockResolvedValue(mockRequest);

      await expect(
        quoteRequestUseCase.execute(
          BigInt(1),
          { quotedAmount: 100, depositAmount: 200, quotationDeadlineDays: 7, items: [{ customName: 'Test', quantity: 1, unitPrice: 100 }] },
          BigInt(1),
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UpdateCateringStatusUseCase', () => {
    it('should transition from INQUIRY to QUOTED', async () => {
      const updatedRequest = CateringRequestEntity.reconstitute({
        ...mockRequest,
        status: 'QUOTED' as CateringStatus,
      } as any);
      mockRequestRepository.findById.mockResolvedValue(mockRequest);
      mockRequestRepository.updateStatus.mockResolvedValue(updatedRequest);

      const result = await updateStatusUseCase.execute(BigInt(1), { status: 'QUOTED' });

      expect(result.status).toBe('QUOTED');
      expect(mockCateringQueue.addStatusChanged).toHaveBeenCalledWith(updatedRequest.id, 'QUOTED');
    });

    it('should transition from INQUIRY to CANCELLED', async () => {
      const cancelledRequest = CateringRequestEntity.reconstitute({
        ...mockRequest,
        status: 'CANCELLED' as CateringStatus,
      } as any);
      mockRequestRepository.findById.mockResolvedValue(mockRequest);
      mockRequestRepository.updateStatus.mockResolvedValue(cancelledRequest);

      const result = await updateStatusUseCase.execute(BigInt(1), { status: 'CANCELLED' });

      expect(result.status).toBe('CANCELLED');
    });

    it('should throw NotFoundException if request not found', async () => {
      mockRequestRepository.findById.mockResolvedValue(null);

      await expect(
        updateStatusUseCase.execute(BigInt(999), { status: 'QUOTED' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid transition', async () => {
      mockRequestRepository.findById.mockResolvedValue(mockRequest);

      await expect(
        updateStatusUseCase.execute(BigInt(1), { status: 'COMPLETED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when cancelling non-cancellable status', async () => {
      const confirmedRequest = CateringRequestEntity.reconstitute({
        id: BigInt(1),
        token: 'abc-123',
        locationId: BigInt(1),
        packageId: null,
        contactName: 'John',
        contactEmail: 'john@test.com',
        contactPhone: '+123',
        eventDate: new Date(),
        eventTime: '18:00',
        guestCount: 50,
        venue: null,
        specialRequest: null,
        status: 'CONFIRMED',
        quotedAmount: 950,
        depositAmount: 200,
        depositPaidAt: null,
        quotationDeadline: null,
        internalNote: null,
        handledByAdminId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockRequestRepository.findById.mockResolvedValue(confirmedRequest);

      await expect(
        updateStatusUseCase.execute(BigInt(1), { status: 'CANCELLED' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
