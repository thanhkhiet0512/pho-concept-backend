declare module 'prisma/config' {
  export type PrismaConfig = {
    schema?: string;
    migrations?: {
      path?: string;
      seed?: string;
    };
    datasource?: {
      url?: string;
    };
  };

  export function defineConfig(config: PrismaConfig): PrismaConfig;
}
