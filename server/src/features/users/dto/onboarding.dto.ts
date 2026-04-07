import {
  IsEnum, IsInt, IsOptional, IsString,
  MaxLength, Min, Max, MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerPosition, PlayerFoot, PlayerLevel, Gender } from '@prisma/client';

export class OnboardingDto {
  @ApiProperty({ example: '홍길동', minLength: 2, maxLength: 20 })
  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '이름은 최대 20자입니다.' })
  name!: string;

  @ApiProperty({ example: 1995, minimum: 1950, maximum: 2010 })
  @IsInt()
  @Min(1950, { message: '출생 연도는 1950 이상이어야 합니다.' })
  @Max(2010, { message: '출생 연도는 2010 이하여야 합니다.' })
  birthYear!: number;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  @IsOptional()
  @IsEnum(Gender, { message: '성별은 MALE 또는 FEMALE이어야 합니다.' })
  gender?: Gender;

  @ApiProperty({ enum: PlayerPosition, example: PlayerPosition.MF })
  @IsEnum(PlayerPosition, { message: '포지션은 FW, MF, DF, GK 중 하나여야 합니다.' })
  position!: PlayerPosition;

  @ApiProperty({ enum: PlayerFoot, example: PlayerFoot.RIGHT })
  @IsEnum(PlayerFoot, { message: '주 발은 LEFT, RIGHT, BOTH 중 하나여야 합니다.' })
  foot!: PlayerFoot;

  @ApiProperty({ example: 5, minimum: 0, maximum: 50 })
  @IsInt()
  @Min(0, { message: '경력은 0 이상이어야 합니다.' })
  @Max(50, { message: '경력은 50 이하여야 합니다.' })
  years!: number;

  @ApiProperty({ enum: PlayerLevel, example: PlayerLevel.AMATEUR })
  @IsEnum(PlayerLevel, { message: '실력은 BEGINNER, AMATEUR, SEMI_PRO, PRO 중 하나여야 합니다.' })
  level!: PlayerLevel;

  @ApiPropertyOptional({ example: 'clx1234abcd' })
  @IsOptional()
  @IsString()
  preferredRegionId?: string;
}
