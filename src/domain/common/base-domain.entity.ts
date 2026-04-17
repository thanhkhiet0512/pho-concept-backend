export abstract class BaseDomainEntity {
  abstract readonly id: bigint;
  abstract readonly createdAt: Date;
  abstract readonly updatedAt: Date;
}
