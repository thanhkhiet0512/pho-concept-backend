import { CateringPackageEntity } from '../entities/catering-package.entity';

export abstract class CateringPackageRepositoryPort {
  abstract findAll(): Promise<CateringPackageEntity[]>;
  abstract findById(id: bigint): Promise<CateringPackageEntity | null>;
}
