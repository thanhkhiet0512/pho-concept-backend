import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from '@application/auth/services/auth.service';
import { LoginDto, RefreshTokenDto } from '@application/auth/dtos/index';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { setAuthCookies, clearAuthCookies } from '@common/helpers/set-auth-cookies.helper';
import { ThrottleAuth } from '@common/decorators/throttle.decorator';

@ApiTags('Auth - Admin')
@Controller('i')
@ThrottleAuth()
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login with email and password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
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
    const tokens = await this.authService.refresh(refreshToken);
    setAuthCookies(res, tokens);
    return tokens;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin logout' })
  async logout(
    @CurrentUser() user: { id: number },
    @Body('refresh_token') bodyToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = bodyToken || (req.cookies?.refresh_token as string) || '';
    await this.authService.logout(BigInt(user.id), refreshToken);
    clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin info' })
  async me(@CurrentUser() user: { id: number; email: string; name: string; role: string }) {
    return user;
  }
}
