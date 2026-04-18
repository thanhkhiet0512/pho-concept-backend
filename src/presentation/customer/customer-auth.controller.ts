import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import {
  RegisterCustomerUseCase,
  LoginCustomerUseCase,
  RefreshTokenCustomerUseCase,
  GetCustomerProfileUseCase,
  LogoutCustomerUseCase,
} from '@application/customer/auth/use-cases';
import { RegisterCustomerDto, LoginCustomerDto, RefreshTokenDto } from '@application/customer/auth/dtos';
import { Public } from '@common/decorators/public.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { setAuthCookies, clearAuthCookies } from '@common/helpers/set-auth-cookies.helper';

@ApiTags('Auth - Customer')
@Controller('a/customer')
export class CustomerAuthController {
  constructor(
    private readonly registerUseCase: RegisterCustomerUseCase,
    private readonly loginUseCase: LoginCustomerUseCase,
    private readonly refreshUseCase: RefreshTokenCustomerUseCase,
    private readonly getProfileUseCase: GetCustomerProfileUseCase,
    private readonly logoutUseCase: LogoutCustomerUseCase,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer' })
  async register(@Body() dto: RegisterCustomerDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.registerUseCase.execute(dto);
    setAuthCookies(res, tokens);
    return tokens;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login with email and password' })
  async login(@Body() dto: LoginCustomerDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.loginUseCase.execute(dto);
    setAuthCookies(res, tokens);
    return tokens;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto.refresh_token || (req.cookies?.refresh_token as string) || '';
    const tokens = await this.refreshUseCase.execute({ refresh_token: refreshToken });
    setAuthCookies(res, tokens);
    return tokens;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer logout' })
  async logout(
    @Body('refresh_token') bodyToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = bodyToken || (req.cookies?.refresh_token as string) || '';
    await this.logoutUseCase.execute(refreshToken);
    clearAuthCookies(res);
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
