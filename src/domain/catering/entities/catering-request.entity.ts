import { CateringStatus as PrismaCateringStatus } from '@prisma/client';

export type CateringStatus = PrismaCateringStatus;

export const CANCELLABLE_STATUSES: CateringStatus[] = ['INQUIRY', 'QUOTED'];
export const ALL_STATUSES: CateringStatus[] = [
  'INQUIRY', 'QUOTED', 'DEPOSIT_PAID', 'CONFIRMED', 'COMPLETED', 'CANCELLED',
];

export class CateringRequestEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;

  private _token!: string;
  private _locationId!: bigint;
  private _packageId: bigint | null = null;
  private _contactName!: string;
  private _contactEmail!: string;
  private _contactPhone!: string;
  private _eventDate!: Date;
  private _eventTime!: string;
  private _guestCount!: number;
  private _venue: string | null = null;
  private _specialRequest: string | null = null;
  private _status!: CateringStatus;
  private _quotedAmount: number | null = null;
  private _depositAmount: number | null = null;
  private _depositPaidAt: Date | null = null;
  private _quotationDeadline: Date | null = null;
  private _internalNote: string | null = null;
  private _handledByAdminId: bigint | null = null;
  private _deletedAt: Date | null = null;

  static reconstitute(data: {
    id: bigint; token: string; locationId: bigint; packageId: bigint | null;
    contactName: string; contactEmail: string; contactPhone: string;
    eventDate: Date; eventTime: string; guestCount: number; venue: string | null;
    specialRequest: string | null; status: CateringStatus;
    quotedAmount: number | null; depositAmount: number | null;
    depositPaidAt: Date | null; quotationDeadline: Date | null;
    internalNote: string | null; handledByAdminId: bigint | null;
    deletedAt: Date | null; createdAt: Date; updatedAt: Date;
  }): CateringRequestEntity {
    const e = new CateringRequestEntity();
    e.id = data.id; e.createdAt = data.createdAt; e.updatedAt = data.updatedAt;
    e._token = data.token; e._locationId = data.locationId; e._packageId = data.packageId;
    e._contactName = data.contactName; e._contactEmail = data.contactEmail;
    e._contactPhone = data.contactPhone; e._eventDate = data.eventDate;
    e._eventTime = data.eventTime; e._guestCount = data.guestCount;
    e._venue = data.venue; e._specialRequest = data.specialRequest;
    e._status = data.status; e._quotedAmount = data.quotedAmount;
    e._depositAmount = data.depositAmount; e._depositPaidAt = data.depositPaidAt;
    e._quotationDeadline = data.quotationDeadline; e._internalNote = data.internalNote;
    e._handledByAdminId = data.handledByAdminId; e._deletedAt = data.deletedAt;
    return e;
  }

  get token(): string { return this._token; }
  get locationId(): bigint { return this._locationId; }
  get packageId(): bigint | null { return this._packageId; }
  get contactName(): string { return this._contactName; }
  get contactEmail(): string { return this._contactEmail; }
  get contactPhone(): string { return this._contactPhone; }
  get eventDate(): Date { return this._eventDate; }
  get eventTime(): string { return this._eventTime; }
  get guestCount(): number { return this._guestCount; }
  get venue(): string | null { return this._venue; }
  get specialRequest(): string | null { return this._specialRequest; }
  get status(): CateringStatus { return this._status; }
  get quotedAmount(): number | null { return this._quotedAmount; }
  get depositAmount(): number | null { return this._depositAmount; }
  get depositPaidAt(): Date | null { return this._depositPaidAt; }
  get quotationDeadline(): Date | null { return this._quotationDeadline; }
  get internalNote(): string | null { return this._internalNote; }
  get handledByAdminId(): bigint | null { return this._handledByAdminId; }
  get deletedAt(): Date | null { return this._deletedAt; }

  isQuotable(): boolean    { return this._status === 'INQUIRY'; }
  isCancellable(): boolean { return CANCELLABLE_STATUSES.includes(this._status); }
  isDeleted(): boolean     { return this._deletedAt !== null; }
  isQuoteExpired(): boolean {
    return this._quotationDeadline !== null && this._quotationDeadline < new Date();
  }
}
