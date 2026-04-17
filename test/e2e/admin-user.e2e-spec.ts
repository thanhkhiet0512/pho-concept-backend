import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Admin User (e2e)', () => {
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

  describe('/api/v1/admin/users (GET)', () => {
    it('should reject unauthenticated request', async () => {
      await agent.get('/api/v1/admin/users').expect(401);
    });
  });

  describe('/api/v1/admin/users (POST)', () => {
    it('should reject unauthenticated request', async () => {
      await agent
        .post('/api/v1/admin/users')
        .send({
          email: 'newadmin@test.com',
          password: 'Password123!',
          name: 'New Admin',
          role: 'staff',
        })
        .expect(401);
    });
  });

  describe('/api/v1/admin/users/:id (GET)', () => {
    it('should reject unauthenticated request', async () => {
      await agent.get('/api/v1/admin/users/1').expect(401);
    });
  });

  describe('/api/v1/admin/users/:id (PATCH)', () => {
    it('should reject unauthenticated request', async () => {
      await agent
        .patch('/api/v1/admin/users/1')
        .send({ name: 'Updated Name' })
        .expect(401);
    });
  });

  describe('/api/v1/admin/users/:id (DELETE)', () => {
    it('should reject unauthenticated request', async () => {
      await agent.delete('/api/v1/admin/users/1').expect(401);
    });
  });
});
