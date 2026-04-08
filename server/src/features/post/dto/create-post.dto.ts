import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PostType } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ enum: PostType, example: PostType.GENERAL })
  @IsEnum(PostType)
  type!: PostType;

  @ApiProperty({ example: '이번 주 훈련 공지', maxLength: 100 })
  @IsString()
  @MinLength(1, { message: '제목을 입력해주세요.' })
  @MaxLength(100, { message: '제목은 최대 100자입니다.' })
  title!: string;

  @ApiProperty({ example: '이번 주 토요일 오전 10시에 모입니다.', maxLength: 2000 })
  @IsString()
  @MinLength(1, { message: '내용을 입력해주세요.' })
  @MaxLength(2000, { message: '본문은 최대 2,000자입니다.' })
  content!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  sendNotification?: boolean;
}
