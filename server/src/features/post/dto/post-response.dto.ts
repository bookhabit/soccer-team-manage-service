import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '@prisma/client';

// ─── 공통 ─────────────────────────────────────────────────────────────────────

export class PostAuthorDto {
  @ApiProperty({ example: 'clx1234userId' })
  userId!: string;

  @ApiProperty({ example: '홍길동' })
  name!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png', nullable: true })
  avatarUrl!: string | null;
}

// ─── 게시글 ───────────────────────────────────────────────────────────────────

export class PostResponseDto {
  @ApiProperty({ example: 'clx1234postId' })
  id!: string;

  @ApiProperty({ enum: PostType, example: PostType.GENERAL })
  type!: PostType;

  @ApiProperty({ example: '정기 훈련 공지' })
  title!: string;

  @ApiProperty({ example: '이번 주 토요일 오전 10시에 훈련이 있습니다.' })
  content!: string;

  @ApiProperty({ example: false })
  isPinned!: boolean;

  @ApiProperty({ example: 42 })
  viewCount!: number;

  @ApiProperty({ example: 5 })
  commentCount!: number;

  @ApiProperty({ type: PostAuthorDto })
  author!: PostAuthorDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: string;
}

export class PostListItemResponseDto {
  @ApiProperty({ example: 'clx1234postId' })
  id!: string;

  @ApiProperty({ enum: PostType, example: PostType.GENERAL })
  type!: PostType;

  @ApiProperty({ example: '정기 훈련 공지' })
  title!: string;

  @ApiProperty({ example: '이번 주 토요일 오전 10시에...' })
  contentPreview!: string;

  @ApiProperty({ example: false })
  isPinned!: boolean;

  @ApiProperty({ example: 42 })
  viewCount!: number;

  @ApiProperty({ example: 5 })
  commentCount!: number;

  @ApiProperty({ example: false })
  isNew!: boolean;

  @ApiProperty({ type: PostAuthorDto })
  author!: PostAuthorDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: string;
}

export class PostPageResponseDto {
  @ApiProperty({ type: [PostListItemResponseDto] })
  data!: PostListItemResponseDto[];

  @ApiPropertyOptional({ example: 'clx1234cursor', nullable: true })
  nextCursor!: string | null;
}

// ─── 댓글 ─────────────────────────────────────────────────────────────────────

export class CommentResponseDto {
  @ApiProperty({ example: 'clx1234commentId' })
  id!: string;

  @ApiProperty({ example: '수고하셨습니다!' })
  content!: string;

  @ApiProperty({ type: PostAuthorDto })
  author!: PostAuthorDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: true })
  isMine!: boolean;
}

export class CommentPageResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  data!: CommentResponseDto[];

  @ApiPropertyOptional({ example: 'clx1234cursor', nullable: true })
  nextCursor!: string | null;
}
