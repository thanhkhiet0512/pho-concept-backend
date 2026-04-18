import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '@/app.module';

describe('Customer Auth (e2e)', () => {
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

  describe('/api/v1/a/customer/register (POST)', () => {
    it('should reject registration with invalid email', async () => {
      await agent
        .post('/api/v1/a/customer/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should reject registration with short password', async () => {
      await agent
        .post('/api/v1/a/customer/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
        })
        .expect(400);
    });
  });

  describe('/api/v1/a/customer/login (POST)', () => {
    it('should reject login with invalid credentials', async () => {
      const response = await agent
        .post('/api/v1/a/customer/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with missing fields', async () => {
      await agent
        .post('/api/v1/a/customer/login')
        .send({
          email: 'test@test.com',
        })
        .expect(400);
    });
  });

  describe('/api/v1/a/customer/me (GET)', () => {
    it('should reject unauthenticated request', async () => {
      await agent.get('/api/v1/a/customer/me').expect(401);
    });
  });
});
