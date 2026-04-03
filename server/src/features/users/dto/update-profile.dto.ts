import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerPosition } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: '홍길동', minLength: 2, maxLength: 20 })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 최대 20자입니다.' })
  nickname?: string;

  @ApiPropertyOptional({ enum: PlayerPosition, example: PlayerPosition.MF })
  @IsOptional()
  @IsEnum(PlayerPosition, { message: '포지션은 FW, MF, DF, GK 중 하나여야 합니다.' })
  position?: PlayerPosition;

  @ApiPropertyOptional({ example: 3, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: '실력은 1 이상이어야 합니다.' })
  @Max(5, { message: '실력은 5 이하여야 합니다.' })
  skillLevel?: number;
}
