import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Auth (e2e)', () => {
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

  describe('/api/v1/i/login (POST)', () => {
    it('should reject login with invalid credentials', async () => {
      const response = await agent
        .post('/api/v1/i/login')
        .send({
          email: 'invalid@test.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with missing fields', async () => {
      await agent
        .post('/api/v1/i/login')
        .send({
          email: 'test@test.com',
        })
        .expect(400);
    });
  });

  describe('/api/v1/i/refresh (POST)', () => {
    it('should reject refresh with invalid token', async () => {
      await agent
        .post('/api/v1/i/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });

  describe('/api/v1/i/me (GET)', () => {
    it('should reject unauthenticated request', async () => {
      await agent.get('/api/v1/i/me').expect(401);
    });
  });
});
