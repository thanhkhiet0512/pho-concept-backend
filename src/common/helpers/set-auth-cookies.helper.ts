import type { Response } from 'express';
import { AuthTokens } from '@domain/auth/types/auth.types';

const COOKIE_CONFIG = {
  ACCESS_TOKEN_MAX_AGE: 24 * 60 * 60 * 1000,       // 24h
  REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60 * 1000,  // 7d
  SECURE: process.env.NODE_ENV === 'production',
  SAME_SITE: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
  DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  PATH: '/',
} as const;

function getBaseCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: COOKIE_CONFIG.SECURE,
    sameSite: COOKIE_CONFIG.SAME_SITE,
    maxAge,
    path: COOKIE_CONFIG.PATH,
    ...(COOKIE_CONFIG.DOMAIN && { domain: COOKIE_CONFIG.DOMAIN }),
  };
}

export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie('access_token', token, getBaseCookieOptions(COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE));
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refresh_token', token, getBaseCookieOptions(COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE));
}

export function setAuthCookies(res: Response, tokens: AuthTokens): void {
  setAccessTokenCookie(res, tokens.access_token);
  setRefreshTokenCookie(res, tokens.refresh_token);
}

export function clearAccessTokenCookie(res: Response): void {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: COOKIE_CONFIG.SECURE,
    sameSite: COOKIE_CONFIG.SAME_SITE,
    path: COOKIE_CONFIG.PATH,
    ...(COOKIE_CONFIG.DOMAIN && { domain: COOKIE_CONFIG.DOMAIN }),
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: COOKIE_CONFIG.SECURE,
    sameSite: COOKIE_CONFIG.SAME_SITE,
    path: COOKIE_CONFIG.PATH,
    ...(COOKIE_CONFIG.DOMAIN && { domain: COOKIE_CONFIG.DOMAIN }),
  });
}

export function clearAuthCookies(res: Response): void {
  clearAccessTokenCookie(res);
  clearRefreshTokenCookie(res);
}
