import type { PrismaClient } from '@prisma/client';

export type AppContext = {
  prisma: PrismaClient;
};
