import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-1)
  limit?: number = 20;
}

export interface PaginatedResult<T> {
  list: T[];
  pagination: {
    limit: number | undefined;
    offset: number;
    nextOffset: number | null;
    hasNext: boolean;
    total: number;
  };
}
