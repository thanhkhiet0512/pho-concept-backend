import { Throttle } from '@nestjs/throttler';

/** 10 req/min — login, refresh token */
export const ThrottleAuth = () => Throttle({ default: { ttl: 60_000, limit: 10 } });

/** 30 req/min — public form submission (reservation, catering inquiry) */
export const ThrottlePublicWrite = () => Throttle({ default: { ttl: 60_000, limit: 30 } });

/** 120 req/min — public reads (menu, events, blog) */
export const ThrottlePublicRead = () => Throttle({ default: { ttl: 60_000, limit: 120 } });

/** Skip throttle — health check, internal endpoints */
export { SkipThrottle } from '@nestjs/throttler';
