import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  CateringRequestRepositoryPort,
  CreateCateringRequestData,
  QuoteCateringRequestData,
  CateringListParams,
  CateringRequestWithItems,
  PaginatedResult,
} from '@domain/catering/ports/catering-request.repository.port';
import { CateringRequestEntity, CateringStatus } from '@domain/catering/entities/catering-request.entity';
import { CateringItemEntity } from '@domain/catering/entities/catering-item.entity';

@Injectable()
export class CateringRequestAdapter implements CateringRequestRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private mapRequest(data: {
    id: bigint; token: string; locationId: bigint; packageId: bigint | null;
    contactName: string; contactEmail: string; contactPhone: string;
    eventDate: Date; eventTime: string; guestCount: number; venue: string | null;
    specialRequest: string | null; status: CateringStatus;
    quotedAmount: Prisma.Decimal | null; depositAmount: Prisma.Decimal | null;
    depositPaidAt: Date | null; quotationDeadline: Date | null;
    internalNote: string | null; handledByAdminId: bigint | null;
    deletedAt: Date | null; createdAt: Date; updatedAt: Date;
  }): CateringRequestEntity {
    return CateringRequestEntity.reconstitute({
      ...data,
      quotedAmount: data.quotedAmount ? Number(data.quotedAmount) : null,
      depositAmount: data.depositAmount ? Number(data.depositAmount) : null,
    });
  }

  private mapItem(data: {
    id: bigint; cateringRequestId: bigint; menuItemId: bigint | null;
    customName: string | null; quantity: number; unitPrice: Prisma.Decimal;
    note: string | null; createdAt: Date; updatedAt: Date;
  }): CateringItemEntity {
    return CateringItemEntity.reconstitute({
      ...data,
      unitPrice: Number(data.unitPrice),
    });
  }

  async findById(id: bigint): Promise<CateringRequestEntity | null> {
    const r = await this.prisma.cateringRequest.findFirst({ where: { id, deletedAt: null } });
    return r ? this.mapRequest(r) : null;
  }

  async findByToken(token: string): Promise<CateringRequestEntity | null> {
    const r = await this.prisma.cateringRequest.findFirst({ where: { token, deletedAt: null } });
    return r ? this.mapRequest(r) : null;
  }

  async findByIdWithItems(id: bigint): Promise<CateringRequestWithItems | null> {
    const r = await this.prisma.cateringRequest.findFirst({
      where: { id, deletedAt: null },
      include: { items: true },
    });
    if (!r) return null;
    return {
      request: this.mapRequest(r),
      items: r.items.map((i) => this.mapItem(i)),
    };
  }

  async findAll(params: CateringListParams): Promise<PaginatedResult<CateringRequestEntity>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CateringRequestWhereInput = { deletedAt: null };
    if (params.locationId) where.locationId = params.locationId;
    if (params.status)     where.status = params.status;
    if (params.eventDate) {
      const d = new Date(params.eventDate);
      d.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      where.eventDate = { gte: d, lte: end };
    }

    const [rows, total] = await Promise.all([
      this.prisma.cateringRequest.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cateringRequest.count({ where }),
    ]);

    return { data: rows.map((r) => this.mapRequest(r)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findExpiredQuotes(): Promise<CateringRequestEntity[]> {
    const rows = await this.prisma.cateringRequest.findMany({
      where: { status: 'QUOTED', quotationDeadline: { lt: new Date() }, deletedAt: null },
    });
    return rows.map((r) => this.mapRequest(r));
  }

  async create(data: CreateCateringRequestData): Promise<CateringRequestEntity> {
    const r = await this.prisma.cateringRequest.create({
      data: {
        locationId: data.locationId,
        packageId: data.packageId ?? null,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        guestCount: data.guestCount,
        venue: data.venue ?? null,
        specialRequest: data.specialRequest ?? null,
        status: 'INQUIRY',
      },
    });
    return this.mapRequest(r);
  }

  async quote(id: bigint, data: QuoteCateringRequestData): Promise<CateringRequestEntity> {
    const r = await this.prisma.$transaction(async (tx) => {
      await tx.cateringItem.deleteMany({ where: { cateringRequestId: id } });
      await tx.cateringItem.createMany({
        data: data.items.map((item) => ({
          cateringRequestId: id,
          menuItemId: item.menuItemId ?? null,
          customName: item.customName ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          note: item.note ?? null,
        })),
      });
      return tx.cateringRequest.update({
        where: { id },
        data: {
          status: 'QUOTED',
          quotedAmount: data.quotedAmount,
          depositAmount: data.depositAmount,
          quotationDeadline: data.quotationDeadline,
          handledByAdminId: data.handledByAdminId,
          internalNote: data.internalNote ?? null,
        },
      });
    });
    return this.mapRequest(r);
  }

  async updateStatus(id: bigint, status: CateringStatus, internalNote?: string | null): Promise<CateringRequestEntity> {
    const r = await this.prisma.cateringRequest.update({
      where: { id },
      data: {
        status,
        ...(internalNote !== undefined && { internalNote }),
      },
    });
    return this.mapRequest(r);
  }

  async softDelete(id: bigint): Promise<void> {
    await this.prisma.cateringRequest.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
