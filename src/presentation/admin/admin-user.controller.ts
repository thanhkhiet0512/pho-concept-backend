import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { AdminRole } from '@common/enums/admin-role.enum';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import {
  GetAdminUsersUseCase,
  GetAdminUserByIdUseCase,
  CreateAdminUserUseCase,
  UpdateAdminUserUseCase,
  DeleteAdminUserUseCase,
} from '@application/admin/user/use-cases';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  AdminUserResponseDto,
  AdminUserQueryDto,
} from '@application/admin/user/dtos';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminUserController {
  constructor(
    private readonly getAdminUsersUseCase: GetAdminUsersUseCase,
    private readonly getAdminUserByIdUseCase: GetAdminUserByIdUseCase,
    private readonly createAdminUserUseCase: CreateAdminUserUseCase,
    private readonly updateAdminUserUseCase: UpdateAdminUserUseCase,
    private readonly deleteAdminUserUseCase: DeleteAdminUserUseCase,
  ) {}

  @Get()
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({ status: 200, type: [AdminUserResponseDto] })
  async getUsers(@Query() query: AdminUserQueryDto) {
    const result = await this.getAdminUsersUseCase.execute(query);
    return {
      data: AdminUserResponseDto.fromEntities(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get admin user by ID' })
  @ApiResponse({ status: 200, type: AdminUserResponseDto })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.getAdminUserByIdUseCase.execute(BigInt(id));
    return {
      data: AdminUserResponseDto.fromEntity(user),
    };
  }

  @Post()
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Create new admin user' })
  @ApiResponse({ status: 201, type: AdminUserResponseDto })
  async createUser(@Body() dto: CreateAdminUserDto) {
    const user = await this.createAdminUserUseCase.execute(dto);
    return {
      data: AdminUserResponseDto.fromEntity(user),
      message: 'Admin user created successfully',
    };
  }

  @Patch(':id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update admin user' })
  @ApiResponse({ status: 200, type: AdminUserResponseDto })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminUserDto,
  ) {
    const user = await this.updateAdminUserUseCase.execute(BigInt(id), dto);
    return {
      data: AdminUserResponseDto.fromEntity(user),
      message: 'Admin user updated successfully',
    };
  }

  @Delete(':id')
  @Roles(AdminRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete admin user' })
  @ApiResponse({ status: 200 })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.deleteAdminUserUseCase.execute(BigInt(id));
    return {
      data: null,
      message: 'Admin user deleted successfully',
    };
  }
}
