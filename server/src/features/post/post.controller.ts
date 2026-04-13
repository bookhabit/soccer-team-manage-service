import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostType } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  PostResponseDto,
  PostPageResponseDto,
  CommentPageResponseDto,
  CommentResponseDto,
} from './dto/post-response.dto';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('clubs/:clubId/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: '게시글 목록 (커서 페이지네이션)' })
  @ApiResponse({ status: 200, type: PostPageResponseDto })
  getPosts(
    @Param('clubId') clubId: string,
    @CurrentUser() user: JwtPayload,
    @Query('type') type?: PostType,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postService.getPosts(clubId, user.sub, {
      type,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post()
  @ApiOperation({ summary: '게시글 작성' })
  @ApiResponse({ status: 201, type: PostResponseDto })
  @ApiResponse({ status: 403, description: 'CLUB_NO_PERMISSION — 공지사항은 관리자만' })
  createPost(
    @Param('clubId') clubId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePostDto,
  ) {
    return this.postService.createPost(clubId, user.sub, dto);
  }

  @Get(':postId')
  @ApiOperation({ summary: '게시글 상세 — 조회 시 viewCount 증가' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  @ApiResponse({ status: 404, description: 'POST_NOT_FOUND' })
  getPostDetail(
    @Param('clubId') clubId: string,
    @Param('postId') postId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postService.getPostDetail(clubId, postId, user.sub);
  }

  @Patch(':postId')
  @ApiOperation({ summary: '게시글 수정 (작성자 본인)' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  @ApiResponse({ status: 403, description: 'POST_NO_EDIT_PERMISSION' })
  updatePost(
    @Param('clubId') clubId: string,
    @Param('postId') postId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: Partial<CreatePostDto>,
  ) {
    return this.postService.updatePost(clubId, postId, user.sub, dto);
  }

  @Delete(':postId')
  @ApiOperation({ summary: '게시글 삭제 (작성자 or 주장)' })
  @ApiResponse({ status: 403, description: 'POST_NO_DELETE_PERMISSION' })
  deletePost(
    @Param('clubId') clubId: string,
    @Param('postId') postId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postService.deletePost(clubId, postId, user.sub);
  }

  // ─── 댓글 ─────────────────────────────────────────────────────────────────

  @Get(':postId/comments')
  @ApiOperation({ summary: '댓글 목록' })
  @ApiResponse({ status: 200, type: CommentPageResponseDto })
  getComments(
    @Param('clubId') clubId: string,
    @Param('postId') postId: string,
    @CurrentUser() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postService.getComments(clubId, postId, user.sub, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post(':postId/comments')
  @ApiOperation({ summary: '댓글 작성' })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  createComment(
    @Param('clubId') clubId: string,
    @Param('postId') postId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postService.createComment(clubId, postId, user.sub, dto);
  }

  @Delete(':postId/comments/:commentId')
  @ApiOperation({ summary: '댓글 삭제 (작성자 or 주장)' })
  @ApiResponse({ status: 403, description: 'COMMENT_NO_DELETE_PERMISSION' })
  deleteComment(
    @Param('clubId') clubId: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postService.deleteComment(clubId, postId, commentId, user.sub);
  }
}
