import { ReservationEntity, SlotConfigEntity } from '../entities/reservation.entity';
import { ReservationStatus as PrismaReservationStatus } from '@prisma/client';

export type ReservationStatus = PrismaReservationStatus;

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateReservationData {
  locationId: bigint;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  partySize: number;
  reservationDate: Date;
  reservationTime: string;
  specialRequest?: string | null;
  createdByAdminId?: bigint | null;
}

export interface UpdateReservationStatusData {
  status: ReservationStatus;
  internalNote?: string | null;
}

export interface ReservationListParams {
  locationId?: bigint;
  date?: Date;
  status?: ReservationStatus;
  page?: number;
  limit?: number;
}

export interface UpsertSlotConfigData {
  slotDuration?: number;
  maxGuestsPerSlot?: number;
  minAdvanceHours?: number;
  maxAdvanceDays?: number;
}

export abstract class ReservationRepositoryPort {
  abstract findById(id: bigint): Promise<ReservationEntity | null>;
  abstract findByToken(token: string): Promise<ReservationEntity | null>;
  abstract findAll(params: ReservationListParams): Promise<PaginatedResult<ReservationEntity>>;
  abstract create(data: CreateReservationData): Promise<ReservationEntity>;
  abstract updateStatus(id: bigint, data: UpdateReservationStatusData): Promise<ReservationEntity>;
  abstract softDelete(id: bigint): Promise<void>;
  abstract countBySlot(locationId: bigint, date: Date, time: string): Promise<number>;
}

export abstract class SlotConfigRepositoryPort {
  abstract findByLocationId(locationId: bigint): Promise<SlotConfigEntity | null>;
  abstract upsert(locationId: bigint, data: UpsertSlotConfigData): Promise<SlotConfigEntity>;
}
