import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateMemberStatsDto {
  @ApiPropertyOptional({ minimum: 0, maximum: 99 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  speed?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 99 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  shoot?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 99 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  pass?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 99 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  dribble?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 99 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  defense?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 99 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  physical?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isStatsPublic?: boolean;
}
