import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CateringPackageRepositoryPort } from '@domain/catering/ports/catering-package.repository.port';
import { CateringPackageEntity } from '@domain/catering/entities/catering-package.entity';

@Injectable()
export class CateringPackageAdapter implements CateringPackageRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(data: {
    id: bigint; name: string; descriptionI18n: unknown; minGuests: number;
    maxGuests: number; basePrice: import('@prisma/client').Prisma.Decimal;
    includesI18n: unknown; isActive: boolean; sortOrder: number;
    createdAt: Date; updatedAt: Date;
  }): CateringPackageEntity {
    return CateringPackageEntity.reconstitute({
      id: data.id, name: data.name,
      descriptionI18n: data.descriptionI18n as Record<string, string>,
      minGuests: data.minGuests, maxGuests: data.maxGuests,
      basePrice: Number(data.basePrice),
      includesI18n: data.includesI18n as Record<string, string[]>,
      isActive: data.isActive, sortOrder: data.sortOrder,
      createdAt: data.createdAt, updatedAt: data.updatedAt,
    });
  }

  async findAll(): Promise<CateringPackageEntity[]> {
    const rows = await this.prisma.cateringPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((r) => this.map(r));
  }

  async findById(id: bigint): Promise<CateringPackageEntity | null> {
    const r = await this.prisma.cateringPackage.findUnique({ where: { id } });
    return r ? this.map(r) : null;
  }
}
