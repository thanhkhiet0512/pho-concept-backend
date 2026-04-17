import type { Request } from 'express';

export function extractJwtFromRequest(req: Request | undefined | null): string | null {
  if (!req) return null;

  if (req.cookies?.access_token) {
    return req.cookies.access_token as string;
  }

  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    return auth.substring(7);
  }

  return null;
}

export function extractRefreshTokenFromRequest(req: Request | undefined | null): string | null {
  if (!req) return null;

  if (req.cookies?.refresh_token) {
    return req.cookies.refresh_token as string;
  }

  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    return auth.substring(7);
  }

  return null;
}
