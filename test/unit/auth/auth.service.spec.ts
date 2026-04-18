import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@/application/auth/services/auth.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AdminRole } from '@/common/enums/admin-role.enum';
import { AuthRepositoryPort } from '@/domain/auth/ports/auth.repository.port';
import { RedisService } from '@/infrastructure/redis/redis.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAuthRepository: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockJwtService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRedisService: any;

  const TEST_PASSWORD = 'password123';
  let hashedPassword: string;

  const createMockUser = (overrides = {}) => ({
    id: BigInt(1),
    email: 'admin@test.com',
    passwordHash: hashedPassword,
    name: 'Test Admin',
    role: AdminRole.OWNER,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
  });

  beforeEach(async () => {
    mockAuthRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateLastLogin: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verifyAsync: jest.fn(),
    };

    mockRedisService = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepositoryPort, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(createMockUser());
      mockAuthRepository.updateLastLogin.mockResolvedValue(undefined);

      const result = await service.login({ email: 'admin@test.com', password: TEST_PASSWORD });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.token_type).toBe('Bearer');
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith('admin@test.com');
      expect(mockAuthRepository.updateLastLogin).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'notfound@test.com', password: 'password' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(createMockUser());

      await expect(service.login({ email: 'admin@test.com', password: 'wrongpassword' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if user is inactive', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(createMockUser({ isActive: false }));

      await expect(service.login({ email: 'admin@test.com', password: TEST_PASSWORD }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('refresh', () => {
    it('should return new tokens on valid refresh', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: '1',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: AdminRole.OWNER,
        type: 'admin',
      });
      mockAuthRepository.findById.mockResolvedValue(createMockUser());

      const result = await service.refresh('valid-refresh-token');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should throw UnauthorizedException if token type is invalid', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: '1',
        type: 'customer',
      });

      await expect(service.refresh('invalid-type-token'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: '999',
        email: 'notfound@test.com',
        name: 'Test',
        role: AdminRole.OWNER,
        type: 'admin',
      });
      mockAuthRepository.findById.mockResolvedValue(null);

      await expect(service.refresh('valid-token'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should resolve without error', async () => {
      await expect(service.logout(BigInt(1), 'some-token')).resolves.toBeUndefined();
    });
  });
});
