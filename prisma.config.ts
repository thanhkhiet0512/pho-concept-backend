import { defineConfig } from 'prisma/config';
import { existsSync, readFileSync } from 'fs';

// Load .env manually — Prisma v6 skips auto env loading when prisma.config.ts is present
if (existsSync('.env')) {
  const lines = readFileSync('.env', 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match && match[1] && match[2] !== undefined) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node dist/prisma/seed.js',
  },
  datasource: {
    url: process.env['DATABASE_URL'] ?? '',
  },
});
