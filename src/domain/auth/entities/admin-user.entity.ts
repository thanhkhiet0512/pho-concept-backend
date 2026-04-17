import { AdminRole } from '@common/enums/admin-role.enum';

export class AdminUserEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _email!: string;
  private _passwordHash!: string;
  private _name!: string;
  private _role!: AdminRole;
  private _isActive!: boolean;
  private _lastLoginAt: Date | null = null;

  static create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: AdminRole;
  }): AdminUserEntity {
    const entity = new AdminUserEntity();
    entity._email = data.email;
    entity._passwordHash = data.passwordHash;
    entity._name = data.name;
    entity._role = data.role;
    entity._isActive = true;
    return entity;
  }

  static reconstitute(data: {
    id: bigint;
    email: string;
    passwordHash: string;
    name: string;
    role: AdminRole;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): AdminUserEntity {
    const entity = new AdminUserEntity();
    entity.id = data.id;
    entity._email = data.email;
    entity._passwordHash = data.passwordHash;
    entity._name = data.name;
    entity._role = data.role;
    entity._isActive = data.isActive;
    entity._lastLoginAt = data.lastLoginAt;
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;
    return entity;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get name(): string {
    return this._name;
  }

  get role(): AdminRole {
    return this._role;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }
}
