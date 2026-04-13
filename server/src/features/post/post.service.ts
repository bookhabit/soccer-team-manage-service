import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClubRole, PostType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubMembershipService } from '../../common/services/club-membership.service';
import { ErrorCode } from '../../common/constants/error-codes';
import type { CreatePostDto } from './dto/create-post.dto';
import type { CreateCommentDto } from './dto/create-comment.dto';

const CURSOR_DEFAULT_LIMIT = 20;
const CONTENT_PREVIEW_LENGTH = 100;

const POST_AUTHOR_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
} as const;

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membership: ClubMembershipService,
  ) {}

  // ─── 게시글 목록 ──────────────────────────────────────────────────────────

  async getPosts(
    clubId: string,
    userId: string,
    params: { type?: PostType; cursor?: string; limit?: number },
  ) {
    await this.membership.assertMember(clubId,userId);

    const limit = params.limit ?? CURSOR_DEFAULT_LIMIT;
    const since = new Date();
    since.setDate(since.getDate() - 1); // NEW 뱃지: 24시간 이내

    const posts = await this.prisma.post.findMany({
      where: {
        clubId,
        ...(params.type ? { type: params.type } : {}),
      },
      take: limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        isPinned: true,
        viewCount: true,
        commentCount: true,
        createdAt: true,
        updatedAt: true,
        author: { select: POST_AUTHOR_SELECT },
      },
    });

    const hasMore = posts.length > limit;
    const data = posts.slice(0, limit).map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      contentPreview: p.content.slice(0, CONTENT_PREVIEW_LENGTH),
      isPinned: p.isPinned,
      viewCount: p.viewCount,
      commentCount: p.commentCount,
      isNew: p.createdAt >= since,
      author: { userId: p.author.id, name: p.author.name, avatarUrl: p.author.avatarUrl },
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return { data, nextCursor: hasMore ? posts[limit - 1]!.id : null };
  }

  // ─── 게시글 상세 (조회수 Redis INCR — 현재는 직접 DB 업데이트로 대체) ─────

  async getPostDetail(clubId: string, postId: string, userId: string) {
    await this.membership.assertMember(clubId,userId);

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        isPinned: true,
        viewCount: true,
        commentCount: true,
        createdAt: true,
        updatedAt: true,
        clubId: true,
        author: { select: POST_AUTHOR_SELECT },
      },
    });

    if (!post || post.clubId !== clubId) {
      throw new NotFoundException({ code: ErrorCode.POST_NOT_FOUND, message: '게시글을 찾을 수 없습니다.' });
    }

    // Redis 통합 전 임시: DB 직접 증가
    // TODO: Redis INCR post:{id}:views → 임계값 도달 시 flush
    await this.prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });

    return {
      id: post.id,
      type: post.type,
      title: post.title,
      content: post.content,
      isPinned: post.isPinned,
      viewCount: post.viewCount + 1,
      commentCount: post.commentCount,
      author: { userId: post.author.id, name: post.author.name, avatarUrl: post.author.avatarUrl },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  // ─── 게시글 작성 ──────────────────────────────────────────────────────────

  async createPost(clubId: string, authorId: string, dto: CreatePostDto) {
    const member = await this.membership.assertMember(clubId,authorId);

    // 공지사항은 관리자만
    if (
      dto.type === PostType.NOTICE &&
      member.role !== ClubRole.CAPTAIN &&
      member.role !== ClubRole.VICE_CAPTAIN
    ) {
      throw new ForbiddenException({
        code: ErrorCode.CLUB_NO_PERMISSION,
        message: '공지사항은 주장·부주장만 작성할 수 있습니다.',
      });
    }

    const post = await this.prisma.post.create({
      data: {
        clubId,
        authorId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        isPinned: dto.isPinned ?? false,
      },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        isPinned: true,
        viewCount: true,
        commentCount: true,
        createdAt: true,
        updatedAt: true,
        author: { select: POST_AUTHOR_SELECT },
      },
    });

    return {
      ...post,
      author: { userId: post.author.id, name: post.author.name, avatarUrl: post.author.avatarUrl },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  // ─── 게시글 수정 ──────────────────────────────────────────────────────────

  async updatePost(
    clubId: string,
    postId: string,
    userId: string,
    dto: Partial<CreatePostDto>,
  ) {
    await this.membership.assertMember(clubId,userId);

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, clubId: true },
    });

    if (!post || post.clubId !== clubId) {
      throw new NotFoundException({ code: ErrorCode.POST_NOT_FOUND, message: '게시글을 찾을 수 없습니다.' });
    }
    if (post.authorId !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.POST_NO_EDIT_PERMISSION,
        message: '작성자만 수정할 수 있습니다.',
      });
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: dto,
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        isPinned: true,
        viewCount: true,
        commentCount: true,
        createdAt: true,
        updatedAt: true,
        author: { select: POST_AUTHOR_SELECT },
      },
    });

    return {
      ...updated,
      author: { userId: updated.author.id, name: updated.author.name, avatarUrl: updated.author.avatarUrl },
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  // ─── 게시글 삭제 ──────────────────────────────────────────────────────────

  async deletePost(clubId: string, postId: string, userId: string) {
    const member = await this.membership.assertMember(clubId,userId);

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, clubId: true },
    });

    if (!post || post.clubId !== clubId) {
      throw new NotFoundException({ code: ErrorCode.POST_NOT_FOUND, message: '게시글을 찾을 수 없습니다.' });
    }

    const isAuthor = post.authorId === userId;
    const isCaptain = member.role === ClubRole.CAPTAIN;

    if (!isAuthor && !isCaptain) {
      throw new ForbiddenException({
        code: ErrorCode.POST_NO_DELETE_PERMISSION,
        message: '작성자 또는 주장만 삭제할 수 있습니다.',
      });
    }

    await this.prisma.post.delete({ where: { id: postId } });
  }

  // ─── 댓글 목록 ────────────────────────────────────────────────────────────

  async getComments(
    clubId: string,
    postId: string,
    userId: string,
    params: { cursor?: string; limit?: number },
  ) {
    await this.membership.assertMember(clubId,userId);

    const limit = params.limit ?? CURSOR_DEFAULT_LIMIT;
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      take: limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorId: true,
        author: { select: POST_AUTHOR_SELECT },
      },
    });

    const hasMore = comments.length > limit;
    const data = comments.slice(0, limit).map((c) => ({
      id: c.id,
      content: c.content,
      author: { userId: c.author.id, name: c.author.name, avatarUrl: c.author.avatarUrl },
      createdAt: c.createdAt.toISOString(),
      isMine: c.authorId === userId,
    }));

    return { data, nextCursor: hasMore ? comments[limit - 1]!.id : null };
  }

  // ─── 댓글 작성 ────────────────────────────────────────────────────────────

  async createComment(clubId: string, postId: string, authorId: string, dto: CreateCommentDto) {
    await this.membership.assertMember(clubId,authorId);

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { clubId: true },
    });
    if (!post || post.clubId !== clubId) {
      throw new NotFoundException({ code: ErrorCode.POST_NOT_FOUND, message: '게시글을 찾을 수 없습니다.' });
    }

    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: { postId, authorId, content: dto.content },
        select: {
          id: true,
          content: true,
          createdAt: true,
          authorId: true,
          author: { select: POST_AUTHOR_SELECT },
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    return {
      id: comment.id,
      content: comment.content,
      author: { userId: comment.author.id, name: comment.author.name, avatarUrl: comment.author.avatarUrl },
      createdAt: comment.createdAt.toISOString(),
      isMine: true,
    };
  }

  // ─── 댓글 삭제 ────────────────────────────────────────────────────────────

  async deleteComment(clubId: string, postId: string, commentId: string, userId: string) {
    const member = await this.membership.assertMember(clubId,userId);

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    });

    if (!comment || comment.postId !== postId) {
      throw new NotFoundException({ code: ErrorCode.POST_NOT_FOUND, message: '댓글을 찾을 수 없습니다.' });
    }

    const isAuthor = comment.authorId === userId;
    const isCaptain = member.role === ClubRole.CAPTAIN;

    if (!isAuthor && !isCaptain) {
      throw new ForbiddenException({
        code: ErrorCode.COMMENT_NO_DELETE_PERMISSION,
        message: '작성자 또는 주장만 댓글을 삭제할 수 있습니다.',
      });
    }

    await this.prisma.$transaction([
      this.prisma.comment.delete({ where: { id: commentId } }),
      this.prisma.post.update({
        where: { id: postId },
        data: { commentCount: { decrement: 1 } },
      }),
    ]);
  }
}
