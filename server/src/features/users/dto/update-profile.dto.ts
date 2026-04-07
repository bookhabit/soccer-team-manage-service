import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerPosition, PlayerFoot, PlayerLevel } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: '홍길동', minLength: 2, maxLength: 20 })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '이름은 최대 20자입니다.' })
  name?: string;

  @ApiPropertyOptional({ enum: PlayerPosition, example: PlayerPosition.MF })
  @IsOptional()
  @IsEnum(PlayerPosition, { message: '포지션은 FW, MF, DF, GK 중 하나여야 합니다.' })
  position?: PlayerPosition;

  @ApiPropertyOptional({ enum: PlayerFoot, example: PlayerFoot.RIGHT })
  @IsOptional()
  @IsEnum(PlayerFoot, { message: '주 발은 LEFT, RIGHT, BOTH 중 하나여야 합니다.' })
  foot?: PlayerFoot;

  @ApiPropertyOptional({ enum: PlayerLevel, example: PlayerLevel.AMATEUR })
  @IsOptional()
  @IsEnum(PlayerLevel, { message: '실력은 BEGINNER, AMATEUR, SEMI_PRO, PRO 중 하나여야 합니다.' })
  level?: PlayerLevel;

  @ApiPropertyOptional({ example: 'clx1234abcd' })
  @IsOptional()
  @IsString()
  preferredRegionId?: string;
}
