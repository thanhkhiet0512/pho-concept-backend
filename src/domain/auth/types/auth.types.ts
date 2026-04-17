import { AdminRole } from '@common/enums/admin-role.enum';

export interface CustomerJwtPayload {
  sub: number;
  email: string;
  name: string;
  type: 'customer';
  iat?: number;
  exp?: number;
}

export interface AdminJwtPayload {
  sub: number;
  email: string;
  name: string;
  role: AdminRole;
  type: 'admin';
  iat?: number;
  exp?: number;
}

export type JwtPayload = CustomerJwtPayload | AdminJwtPayload;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: string;
  refresh_expires_in: string;
}

export interface AuthCustomerInfo {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  type: 'customer';
}

export interface AuthAdminInfo {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
  type: 'admin';
}
