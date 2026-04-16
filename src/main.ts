import Fastify from 'fastify';
import { env } from '@config/env.js';

const app = Fastify({ logger: true });

app.get('/', async () => {
  return {
    name: 'Pho Concept API',
    version: '0.1.0',
    docs: '/api/v1/health',
  };
});

app.get('/api/v1/health', async () => {
  return {
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  };
});

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info({ event: 'server_started', module: 'bootstrap', data: { port: env.PORT } });
  } catch (error) {
    app.log.error({ err: error, context: 'bootstrap' });
    process.exit(1);
  }
};

void start();
