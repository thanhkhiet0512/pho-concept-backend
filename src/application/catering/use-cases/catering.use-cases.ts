import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CateringRequestRepositoryPort, PaginatedResult, CateringRequestWithItems } from '@domain/catering/ports/catering-request.repository.port';
import { CateringPackageRepositoryPort } from '@domain/catering/ports/catering-package.repository.port';
import { CATERING_REQUEST_REPOSITORY_TOKEN, CATERING_PACKAGE_REPOSITORY_TOKEN } from '@domain/catering/ports/catering.repository.token';
import { CateringRequestEntity, CateringPackageEntity, CateringStatus } from '@domain/catering/entities';
import { SubmitCateringInquiryDto, QuoteCateringRequestDto, UpdateCateringStatusDto, ListCateringRequestsDto } from '@application/catering/dtos';
import { CateringQueue } from '@infrastructure/queue/catering.queue';

const VALID_STATUS_TRANSITIONS: Record<CateringStatus, CateringStatus[]> = {
  INQUIRY:      ['QUOTED', 'CANCELLED'],
  QUOTED:       ['DEPOSIT_PAID', 'CONFIRMED', 'CANCELLED'],
  DEPOSIT_PAID: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:    ['COMPLETED'],
  COMPLETED:    [],
  CANCELLED:    [],
};

// ─── GET PACKAGES (Public) ──────────────────────────────────────────────

@Injectable()
export class GetCateringPackagesUseCase {
  constructor(
    @Inject(CATERING_PACKAGE_REPOSITORY_TOKEN)
    private readonly packageRepository: CateringPackageRepositoryPort,
  ) {}

  async execute(): Promise<CateringPackageEntity[]> {
    return this.packageRepository.findAll();
  }
}

// ─── SUBMIT INQUIRY (Public) ─────────────────────────────────────────────

@Injectable()
export class SubmitCateringInquiryUseCase {
  private readonly logger = new Logger(SubmitCateringInquiryUseCase.name);

  constructor(
    @Inject(CATERING_REQUEST_REPOSITORY_TOKEN)
    private readonly requestRepository: CateringRequestRepositoryPort,
    @Inject(CATERING_PACKAGE_REPOSITORY_TOKEN)
    private readonly packageRepository: CateringPackageRepositoryPort,
    private readonly cateringQueue: CateringQueue,
  ) {}

  async execute(dto: SubmitCateringInquiryDto): Promise<CateringRequestEntity> {
    if (dto.packageId) {
      const pkg = await this.packageRepository.findById(BigInt(dto.packageId));
      if (!pkg) throw new NotFoundException('Catering package not found');
      if (!pkg.isActive) throw new BadRequestException('This package is no longer available');
      if (dto.guestCount < pkg.minGuests || dto.guestCount > pkg.maxGuests) {
        throw new BadRequestException(
          `Guest count must be between ${pkg.minGuests} and ${pkg.maxGuests} for this package`,
        );
      }
    }

    const request = await this.requestRepository.create({
      locationId: BigInt(dto.locationId),
      packageId: dto.packageId ? BigInt(dto.packageId) : null,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      eventDate: new Date(dto.eventDate),
      eventTime: dto.eventTime,
      guestCount: dto.guestCount,
      venue: dto.venue ?? null,
      city: dto.city ?? null,
      state: dto.state ?? null,
      zip: dto.zip ?? null,
      dietaryNotes: dto.dietaryNotes ?? null,
      specialRequest: dto.specialRequest ?? null,
    });

    try {
      await this.cateringQueue.addInquiryReceived(request.id);
    } catch (err) {
      this.logger.warn(`Failed to queue inquiry notification for request ${request.id}: ${(err as Error).message}`);
    }
    return request;
  }
}

// ─── GET BY TOKEN (Public) ───────────────────────────────────────────────

@Injectable()
export class GetCateringByTokenUseCase {
  constructor(
    @Inject(CATERING_REQUEST_REPOSITORY_TOKEN)
    private readonly requestRepository: CateringRequestRepositoryPort,
  ) {}

  async execute(token: string): Promise<CateringRequestEntity> {
    const request = await this.requestRepository.findByToken(token);
    if (!request || request.isDeleted()) throw new NotFoundException('Catering request not found');
    return request;
  }
}

// ─── LIST REQUESTS (Admin) ───────────────────────────────────────────────

@Injectable()
export class ListCateringRequestsUseCase {
  constructor(
    @Inject(CATERING_REQUEST_REPOSITORY_TOKEN)
    private readonly requestRepository: CateringRequestRepositoryPort,
  ) {}

  async execute(dto: ListCateringRequestsDto): Promise<PaginatedResult<CateringRequestEntity>> {
    return this.requestRepository.findAll({
      locationId: dto.locationId ? BigInt(dto.locationId) : undefined,
      status: dto.status,
      eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
    });
  }
}

// ─── GET DETAIL (Admin) ──────────────────────────────────────────────────

@Injectable()
export class GetCateringRequestDetailUseCase {
  constructor(
    @Inject(CATERING_REQUEST_REPOSITORY_TOKEN)
    private readonly requestRepository: CateringRequestRepositoryPort,
  ) {}

  async execute(id: bigint): Promise<CateringRequestWithItems> {
    const result = await this.requestRepository.findByIdWithItems(id);
    if (!result || result.request.isDeleted()) throw new NotFoundException('Catering request not found');
    return result;
  }
}

// ─── QUOTE (Admin) ───────────────────────────────────────────────────────

@Injectable()
export class QuoteCateringRequestUseCase {
  private readonly logger = new Logger(QuoteCateringRequestUseCase.name);

  constructor(
    @Inject(CATERING_REQUEST_REPOSITORY_TOKEN)
    private readonly requestRepository: CateringRequestRepositoryPort,
    private readonly cateringQueue: CateringQueue,
  ) {}

  async execute(id: bigint, dto: QuoteCateringRequestDto, adminId: bigint): Promise<CateringRequestEntity> {
    const request = await this.requestRepository.findById(id);
    if (!request || request.isDeleted()) throw new NotFoundException('Catering request not found');
    if (!request.isQuotable()) {
      throw new BadRequestException(`Cannot quote a request with status "${request.status}"`);
    }
    if (dto.items.length === 0) throw new BadRequestException('Quote must have at least one item');
    for (const item of dto.items) {
      if (!item.menuItemId && !item.customName) {
        throw new BadRequestException('Each item must have either a menuItemId or a customName');
      }
    }
    if (dto.depositAmount > dto.quotedAmount) {
      throw new BadRequestException('Deposit cannot exceed quoted amount');
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + dto.quotationDeadlineDays);

    const eventDate = new Date(request.eventDate);
    if (deadline >= eventDate) {
      throw new BadRequestException('Quotation deadline must be before the event date');
    }

    const quoted = await this.requestRepository.quote(id, {
      quotedAmount: dto.quotedAmount,
      depositAmount: dto.depositAmount,
      quotationDeadline: deadline,
      items: dto.items.map((item) => ({
        menuItemId: item.menuItemId ? BigInt(item.menuItemId) : null,
        customName: item.customName ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        note: item.note ?? null,
      })),
      handledByAdminId: adminId,
      internalNote: dto.internalNote ?? null,
    });

    try {
      await this.cateringQueue.addQuoteSent(quoted.id);
    } catch (err) {
      this.logger.warn(`Failed to queue quote notification for request ${quoted.id}: ${(err as Error).message}`);
    }
    return quoted;
  }
}

// ─── UPDATE STATUS (Admin) ───────────────────────────────────────────────

@Injectable()
export class UpdateCateringStatusUseCase {
  private readonly logger = new Logger(UpdateCateringStatusUseCase.name);

  constructor(
    @Inject(CATERING_REQUEST_REPOSITORY_TOKEN)
    private readonly requestRepository: CateringRequestRepositoryPort,
    private readonly cateringQueue: CateringQueue,
  ) {}

  async execute(id: bigint, dto: UpdateCateringStatusDto): Promise<CateringRequestEntity> {
    const request = await this.requestRepository.findById(id);
    if (!request || request.isDeleted()) throw new NotFoundException('Catering request not found');

    const validTransitions = VALID_STATUS_TRANSITIONS[request.status];
    if (!validTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from "${request.status}" to "${dto.status}"`,
      );
    }

    const updated = await this.requestRepository.updateStatus(id, dto.status, dto.internalNote);
    try {
      await this.cateringQueue.addStatusChanged(updated.id, dto.status);
    } catch (err) {
      this.logger.warn(`Failed to queue status change notification for request ${updated.id}: ${(err as Error).message}`);
    }
    return updated;
  }
}
