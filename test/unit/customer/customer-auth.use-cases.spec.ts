import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { RegisterCustomerUseCase } from '../../../src/application/customer/auth/use-cases/register-customer.use-case';
import { LoginCustomerUseCase } from '../../../src/application/customer/auth/use-cases/login-customer.use-case';
import { UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('CustomerAuth Use Cases', () => {
  let registerUseCase: RegisterCustomerUseCase;
  let loginUseCase: LoginCustomerUseCase;
  let mockCustomerRepository: any;
  let mockJwtService: any;

  const TEST_PASSWORD = 'password123';
  let hashedPassword: string;

  const mockCustomer = {
    id: BigInt(1),
    email: 'test@example.com',
    name: 'Test Customer',
    passwordHash: '$2a$10$hashedpassword',
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
    mockCustomer.passwordHash = hashedPassword;
  });

  beforeEach(async () => {
    mockCustomerRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterCustomerUseCase,
        LoginCustomerUseCase,
        { provide: 'CustomerRepository', useValue: mockCustomerRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    registerUseCase = module.get<RegisterCustomerUseCase>(RegisterCustomerUseCase);
    loginUseCase = module.get<LoginCustomerUseCase>(LoginCustomerUseCase);
  });

  describe('RegisterCustomerUseCase', () => {
    it('should register a new customer successfully', async () => {
      mockCustomerRepository.findByEmail.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(mockCustomer);

      const result = await registerUseCase.execute({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test Customer',
        phone: '1234567890',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.token_type).toBe('Bearer');
      expect(mockCustomerRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockCustomerRepository.findByEmail.mockResolvedValue(mockCustomer);

      await expect(
        registerUseCase.execute({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test Customer',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('LoginCustomerUseCase', () => {
    it('should login successfully with valid credentials', async () => {
      mockCustomerRepository.findByEmail.mockResolvedValue(mockCustomer);
      mockCustomerRepository.updateLastLogin.mockResolvedValue(undefined);

      const result = await loginUseCase.execute({
        email: 'test@example.com',
        password: TEST_PASSWORD,
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockCustomerRepository.updateLastLogin).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if customer not found', async () => {
      mockCustomerRepository.findByEmail.mockResolvedValue(null);

      await expect(
        loginUseCase.execute({
          email: 'notfound@example.com',
          password: TEST_PASSWORD,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockCustomerRepository.findByEmail.mockResolvedValue(mockCustomer);

      await expect(
        loginUseCase.execute({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if customer is inactive', async () => {
      const inactiveCustomer = { ...mockCustomer, isActive: false };
      mockCustomerRepository.findByEmail.mockResolvedValue(inactiveCustomer);

      await expect(
        loginUseCase.execute({
          email: 'test@example.com',
          password: TEST_PASSWORD,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
