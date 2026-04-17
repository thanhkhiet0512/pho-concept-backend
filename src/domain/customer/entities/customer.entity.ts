export class CustomerEntity {
  id!: bigint;
  createdAt!: Date;
  updatedAt!: Date;
  private _email!: string;
  private _passwordHash!: string;
  private _name!: string;
  private _phone: string | null = null;
  private _avatarUrl: string | null = null;
  private _isActive!: boolean;
  private _lastLoginAt: Date | null = null;

  static create(data: {
    email: string;
    passwordHash: string;
    name: string;
    phone?: string;
  }): CustomerEntity {
    const entity = new CustomerEntity();
    entity._email = data.email;
    entity._passwordHash = data.passwordHash;
    entity._name = data.name;
    entity._phone = data.phone || null;
    entity._isActive = true;
    return entity;
  }

  static reconstitute(data: {
    id: bigint;
    email: string;
    passwordHash: string;
    name: string;
    phone: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): CustomerEntity {
    const entity = new CustomerEntity();
    entity.id = data.id;
    entity._email = data.email;
    entity._passwordHash = data.passwordHash;
    entity._name = data.name;
    entity._phone = data.phone;
    entity._avatarUrl = data.avatarUrl;
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

  get phone(): string | null {
    return this._phone;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }
}
