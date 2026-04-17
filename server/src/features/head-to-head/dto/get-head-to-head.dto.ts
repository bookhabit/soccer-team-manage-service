import { IsISO8601, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetHeadToHeadDto {
  @ApiPropertyOptional({ description: '이전 페이지 마지막 경기 startAt (ISO 8601)', example: '2025-01-10T14:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  cursor?: string;

  @ApiPropertyOptional({ description: '페이지 크기 (1-50, 기본 10)', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}
