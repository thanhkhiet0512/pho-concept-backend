import { Injectable } from '@nestjs/common';
import { RedisService } from '@infrastructure/redis/redis.service';

@Injectable()
export class LogoutCustomerUseCase {
  private readonly REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(private readonly redisService: RedisService) {}

  async execute(refreshToken: string): Promise<void> {
    if (refreshToken) {
      await this.redisService.set(`blacklist:customer:${refreshToken}`, '1', this.REFRESH_TTL);
    }
  }
}
