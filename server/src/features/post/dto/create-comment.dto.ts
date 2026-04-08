import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: '좋은 공지 감사합니다!', maxLength: 500 })
  @IsString()
  @MinLength(1, { message: '댓글을 입력해주세요.' })
  @MaxLength(500, { message: '댓글은 최대 500자입니다.' })
  content!: string;
}
