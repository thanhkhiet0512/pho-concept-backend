// Re-export from Prisma
import { ReservationStatus as PrismaReservationStatus } from '@prisma/client';

export type ReservationStatus = PrismaReservationStatus;

export const CANCELLABLE_STATUSES: ReservationStatus[] = [
  'PENDING',
  'CONFIRMED',
];

export const ALL_STATUSES: ReservationStatus[] = [
  'PENDING',
  'CONFIRMED',
  'SEATED',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
];

export const ACTIVE_STATUSES: ReservationStatus[] = [
  'PENDING',
  'CONFIRMED',
  'SEATED',
];

export class SlotConfigEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _locationId!: bigint;
  private _slotDuration!: number;
  private _maxGuestsPerSlot!: number;
  private _minAdvanceHours!: number;
  private _maxAdvanceDays!: number;

  static reconstitute(data: {
    id: bigint;
    locationId: bigint;
    slotDuration: number;
    maxGuestsPerSlot: number;
    minAdvanceHours: number;
    maxAdvanceDays: number;
    createdAt: Date;
    updatedAt: Date;
  }): SlotConfigEntity {
    const entity = new SlotConfigEntity();
    entity.id = data.id;
    entity._locationId = data.locationId;
    entity._slotDuration = data.slotDuration;
    entity._maxGuestsPerSlot = data.maxGuestsPerSlot;
    entity._minAdvanceHours = data.minAdvanceHours;
    entity._maxAdvanceDays = data.maxAdvanceDays;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    return entity;
  }

  get locationId(): bigint { return this._locationId; }
  get slotDuration(): number { return this._slotDuration; }
  get maxGuestsPerSlot(): number { return this._maxGuestsPerSlot; }
  get minAdvanceHours(): number { return this._minAdvanceHours; }
  get maxAdvanceDays(): number { return this._maxAdvanceDays; }
}

export class ReservationEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _token!: string;
  private _locationId!: bigint;
  private _guestName!: string;
  private _guestEmail!: string;
  private _guestPhone!: string;
  private _partySize!: number;
  private _reservationDate!: Date;
  private _reservationTime!: string;
  private _status!: ReservationStatus;
  private _specialRequest: string | null = null;
  private _internalNote: string | null = null;
  private _createdByAdminId: bigint | null = null;
  private _deletedAt: Date | null = null;

  static create(data: {
    locationId: bigint;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    partySize: number;
    reservationDate: Date;
    reservationTime: string;
    specialRequest?: string | null;
  }): ReservationEntity {
    const entity = new ReservationEntity();
    entity._token = crypto.randomUUID();
    entity._locationId = data.locationId;
    entity._guestName = data.guestName;
    entity._guestEmail = data.guestEmail;
    entity._guestPhone = data.guestPhone;
    entity._partySize = data.partySize;
    entity._reservationDate = data.reservationDate;
    entity._reservationTime = data.reservationTime;
    entity._status = 'PENDING' as ReservationStatus;
    entity._specialRequest = data.specialRequest ?? null;
    return entity;
  }

  static reconstitute(data: {
    id: bigint;
    token: string;
    locationId: bigint;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    partySize: number;
    reservationDate: Date;
    reservationTime: string;
    status: ReservationStatus;
    specialRequest: string | null;
    internalNote: string | null;
    createdByAdminId: bigint | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): ReservationEntity {
    const entity = new ReservationEntity();
    entity.id = data.id;
    entity._token = data.token;
    entity._locationId = data.locationId;
    entity._guestName = data.guestName;
    entity._guestEmail = data.guestEmail;
    entity._guestPhone = data.guestPhone;
    entity._partySize = data.partySize;
    entity._reservationDate = data.reservationDate;
    entity._reservationTime = data.reservationTime;
    entity._status = data.status;
    entity._specialRequest = data.specialRequest;
    entity._internalNote = data.internalNote;
    entity._createdByAdminId = data.createdByAdminId;
    entity._deletedAt = data.deletedAt;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    return entity;
  }

  get token(): string { return this._token; }
  get locationId(): bigint { return this._locationId; }
  get guestName(): string { return this._guestName; }
  get guestEmail(): string { return this._guestEmail; }
  get guestPhone(): string { return this._guestPhone; }
  get partySize(): number { return this._partySize; }
  get reservationDate(): Date { return this._reservationDate; }
  get reservationTime(): string { return this._reservationTime; }
  get status(): ReservationStatus { return this._status; }
  get specialRequest(): string | null { return this._specialRequest; }
  get internalNote(): string | null { return this._internalNote; }
  get createdByAdminId(): bigint | null { return this._createdByAdminId; }
  get deletedAt(): Date | null { return this._deletedAt; }

  isOwnedByToken(token: string): boolean {
    return this._token === token;
  }

  isCancellable(): boolean {
    return CANCELLABLE_STATUSES.includes(this._status);
  }

  isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  isWalkIn(): boolean {
    return this._createdByAdminId !== null;
  }
}
