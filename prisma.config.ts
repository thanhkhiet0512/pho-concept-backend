import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma Configuration File
 * In Prisma ORM v7, datasource URL is configured here instead of schema.prisma
 * Multi-file schema: All .prisma files in prisma/schema/ directory will be loaded
 * See: https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */
export default defineConfig({
  // Point to schema directory for multi-file schema support
  // Prisma will automatically load all .prisma files in this directory and subdirectories
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node dist/prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL || '',
  },
});
