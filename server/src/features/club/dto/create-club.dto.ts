import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ClubLevel } from '@prisma/client';

export class CreateClubDto {
  @ApiProperty({ example: 'FC 서울 드래곤즈', minLength: 2, maxLength: 30 })
  @IsString()
  @MinLength(2, { message: '팀 이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(30, { message: '팀 이름은 최대 30자입니다.' })
  name!: string;

  @ApiProperty({ example: 'clx1234regionId' })
  @IsString()
  regionId!: string;

  @ApiProperty({ enum: ClubLevel, example: ClubLevel.AMATEUR })
  @IsEnum(ClubLevel)
  level!: ClubLevel;

  @ApiProperty({ example: 25, minimum: 2, maximum: 50 })
  @IsInt()
  @Min(2, { message: '최소 2명 이상이어야 합니다.' })
  @Max(50, { message: '최대 50명까지 설정 가능합니다.' })
  maxMemberCount!: number;

  @ApiPropertyOptional({ example: '주 2회 정기 운동하는 아마추어 팀입니다.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
