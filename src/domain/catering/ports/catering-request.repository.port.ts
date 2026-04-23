import { CateringRequestEntity, CateringStatus } from '../entities/catering-request.entity';
import { CateringItemEntity } from '../entities/catering-item.entity';

export interface PaginatedResult<T> {
  data: T[]; total: number; page: number; limit: number; totalPages: number;
}

export interface CreateCateringRequestData {
  locationId: bigint;
  packageId?: bigint | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  eventDate: Date;
  eventTime: string;
  guestCount: number;
  venue?: string | null;
  specialRequest?: string | null;
}

export interface QuoteLineItemData {
  menuItemId?: bigint | null;
  customName?: string | null;
  quantity: number;
  unitPrice: number;
  note?: string | null;
}

export interface QuoteCateringRequestData {
  quotedAmount: number;
  depositAmount: number;
  quotationDeadline: Date;
  items: QuoteLineItemData[];
  handledByAdminId: bigint;
  internalNote?: string | null;
}

export interface CateringListParams {
  locationId?: bigint;
  status?: CateringStatus;
  eventDate?: Date;
  page?: number;
  limit?: number;
}

export interface CateringRequestWithItems {
  request: CateringRequestEntity;
  items: CateringItemEntity[];
}

export abstract class CateringRequestRepositoryPort {
  abstract findById(id: bigint): Promise<CateringRequestEntity | null>;
  abstract findByToken(token: string): Promise<CateringRequestEntity | null>;
  abstract findByIdWithItems(id: bigint): Promise<CateringRequestWithItems | null>;
  abstract findAll(params: CateringListParams): Promise<PaginatedResult<CateringRequestEntity>>;
  abstract findExpiredQuotes(): Promise<CateringRequestEntity[]>;
  abstract create(data: CreateCateringRequestData): Promise<CateringRequestEntity>;
  abstract quote(id: bigint, data: QuoteCateringRequestData): Promise<CateringRequestEntity>;
  abstract updateStatus(id: bigint, status: CateringStatus, internalNote?: string | null): Promise<CateringRequestEntity>;
  abstract softDelete(id: bigint): Promise<void>;
}
