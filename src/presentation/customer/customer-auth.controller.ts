import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  RegisterCustomerUseCase,
  LoginCustomerUseCase,
  RefreshTokenCustomerUseCase,
  GetCustomerProfileUseCase,
} from '@application/customer/auth/use-cases';
import { RegisterCustomerDto, LoginCustomerDto, RefreshTokenDto } from '@application/customer/auth/dtos';
import { Public } from '@common/decorators/public.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Auth - Customer')
@Controller('a/customer')
export class CustomerAuthController {
  constructor(
    private readonly registerUseCase: RegisterCustomerUseCase,
    private readonly loginUseCase: LoginCustomerUseCase,
    private readonly refreshUseCase: RefreshTokenCustomerUseCase,
    private readonly getProfileUseCase: GetCustomerProfileUseCase,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer' })
  async register(@Body() dto: RegisterCustomerDto) {
    return this.registerUseCase.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login with email and password' })
  async login(@Body() dto: LoginCustomerDto) {
    return this.loginUseCase.execute(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshUseCase.execute(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer logout' })
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current customer profile' })
  async getProfile(@CurrentUser() user: { id: number }) {
    return this.getProfileUseCase.execute(BigInt(user.id));
  }
}
