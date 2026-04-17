import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Location (e2e)', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    agent = supertest(app.getHttpServer());
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/api/v1/p/locations (GET)', () => {
    it('should return locations (public)', async () => {
      const response = await agent
        .get('/api/v1/p/locations')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('/api/v1/i/locations (GET)', () => {
    it('should reject unauthenticated request', async () => {
      await agent.get('/api/v1/i/locations').expect(401);
    });
  });

  describe('/api/v1/i/locations (POST)', () => {
    it('should reject unauthenticated request', async () => {
      await agent
        .post('/api/v1/i/locations')
        .send({
          slug: 'test-location',
          name: 'Test Location',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
        })
        .expect(401);
    });
  });
});
