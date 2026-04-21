import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  GetAdminUsersUseCase,
  GetAdminUserByIdUseCase,
  CreateAdminUserUseCase,
  UpdateAdminUserUseCase,
  DeleteAdminUserUseCase,
  ChangeAdminPasswordUseCase,
} from '@/application/admin/user/use-cases/admin-user.use-cases';
import { AdminRole } from '@/common/enums/admin-role.enum';
import { ADMIN_USER_REPOSITORY } from '@/domain/auth/ports/admin-user.repository.token';
import * as bcrypt from 'bcrypt';

describe('AdminUser Use Cases', () => {
  let getAdminUsersUseCase: GetAdminUsersUseCase;
  let getAdminUserByIdUseCase: GetAdminUserByIdUseCase;
  let createAdminUserUseCase: CreateAdminUserUseCase;
  let updateAdminUserUseCase: UpdateAdminUserUseCase;
  let deleteAdminUserUseCase: DeleteAdminUserUseCase;
  let changePasswordUseCase: ChangeAdminPasswordUseCase;
  let mockAdminUserRepository: any;

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
    mockAdminUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAdminUsersUseCase,
        GetAdminUserByIdUseCase,
        CreateAdminUserUseCase,
        UpdateAdminUserUseCase,
        DeleteAdminUserUseCase,
        ChangeAdminPasswordUseCase,
        { provide: ADMIN_USER_REPOSITORY, useValue: mockAdminUserRepository },
      ],
    }).compile();

    getAdminUsersUseCase = module.get<GetAdminUsersUseCase>(GetAdminUsersUseCase);
    getAdminUserByIdUseCase = module.get<GetAdminUserByIdUseCase>(GetAdminUserByIdUseCase);
    createAdminUserUseCase = module.get<CreateAdminUserUseCase>(CreateAdminUserUseCase);
    updateAdminUserUseCase = module.get<UpdateAdminUserUseCase>(UpdateAdminUserUseCase);
    deleteAdminUserUseCase = module.get<DeleteAdminUserUseCase>(DeleteAdminUserUseCase);
    changePasswordUseCase = module.get<ChangeAdminPasswordUseCase>(ChangeAdminPasswordUseCase);
  });

  describe('GetAdminUsersUseCase', () => {
    it('should return paginated admin users', async () => {
      const mockResult = {
        data: [createMockUser()],
        total: 1,
      };
      mockAdminUserRepository.findAll.mockResolvedValue(mockResult);

      const result = await getAdminUsersUseCase.execute({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by role', async () => {
      mockAdminUserRepository.findAll.mockResolvedValue({ data: [], total: 0 });

      await getAdminUsersUseCase.execute({ role: AdminRole.OWNER });

      expect(mockAdminUserRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ role: AdminRole.OWNER }),
      );
    });
  });

  describe('GetAdminUserByIdUseCase', () => {
    it('should return admin user by id', async () => {
      mockAdminUserRepository.findById.mockResolvedValue(createMockUser());

      const result = await getAdminUserByIdUseCase.execute(BigInt(1));

      expect(result.id).toBe(BigInt(1));
      expect(result.email).toBe('admin@test.com');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockAdminUserRepository.findById.mockResolvedValue(null);

      await expect(getAdminUserByIdUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });

  describe('CreateAdminUserUseCase', () => {
    it('should create admin user successfully', async () => {
      mockAdminUserRepository.findByEmail.mockResolvedValue(null);
      mockAdminUserRepository.create.mockResolvedValue(createMockUser({ email: 'newadmin@test.com' }));

      const result = await createAdminUserUseCase.execute({
        email: 'newadmin@test.com',
        password: TEST_PASSWORD,
        name: 'New Admin',
        role: AdminRole.STAFF,
      });

      expect(result).toBeDefined();
      expect(mockAdminUserRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockAdminUserRepository.findByEmail.mockResolvedValue(createMockUser());

      await expect(
        createAdminUserUseCase.execute({
          email: 'admin@test.com',
          password: TEST_PASSWORD,
          name: 'New Admin',
          role: AdminRole.STAFF,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('UpdateAdminUserUseCase', () => {
    it('should update admin user successfully', async () => {
      const updatedUser = createMockUser({ name: 'Updated Name' });
      mockAdminUserRepository.findById.mockResolvedValue(createMockUser());
      mockAdminUserRepository.update.mockResolvedValue(updatedUser);

      const result = await updateAdminUserUseCase.execute(BigInt(1), { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockAdminUserRepository.findById.mockResolvedValue(null);

      await expect(
        updateAdminUserUseCase.execute(BigInt(999), { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DeleteAdminUserUseCase', () => {
    it('should delete admin user successfully', async () => {
      mockAdminUserRepository.findById.mockResolvedValue(createMockUser());
      mockAdminUserRepository.delete.mockResolvedValue(undefined);

      await expect(deleteAdminUserUseCase.execute(BigInt(1))).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockAdminUserRepository.findById.mockResolvedValue(null);

      await expect(deleteAdminUserUseCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });

  describe('ChangeAdminPasswordUseCase', () => {
    it('should change password successfully', async () => {
      const userWithPassword = createMockUser({ passwordHash: hashedPassword });
      mockAdminUserRepository.findById.mockResolvedValue(userWithPassword);
      mockAdminUserRepository.updatePassword.mockResolvedValue(undefined);

      await expect(
        changePasswordUseCase.execute(BigInt(1), TEST_PASSWORD, 'newPassword456'),
      ).resolves.toBeUndefined();
    });

    it('should throw ConflictException if current password is wrong', async () => {
      const userWithPassword = createMockUser({ passwordHash: hashedPassword });
      mockAdminUserRepository.findById.mockResolvedValue(userWithPassword);

      await expect(
        changePasswordUseCase.execute(BigInt(1), 'wrongPassword', 'newPassword456'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
