import Fastify from 'fastify';

const app = Fastify({ logger: true });

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
    const port = 3000;
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info({ event: 'server_started', module: 'bootstrap', data: { port } });
  } catch (error) {
    app.log.error({ err: error, context: 'bootstrap' });
    process.exit(1);
  }
};

void start();
