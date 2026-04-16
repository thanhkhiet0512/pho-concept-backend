export type PrismaClientLike = {
  $disconnect: () => Promise<void>;
};

export const prisma = {
  $disconnect: async () => undefined,
} satisfies PrismaClientLike;
