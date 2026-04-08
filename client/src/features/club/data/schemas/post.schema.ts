import { z } from 'zod';
import { cursorPageSchema } from './club.schema';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const PostTypeSchema = z.enum(['NOTICE', 'GENERAL', 'INQUIRY']);

// ─── Response Schemas ─────────────────────────────────────────────────────────

export const PostAuthorSchema = z.object({
  userId: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

export const PostSchema = z.object({
  id: z.string(),
  type: PostTypeSchema,
  title: z.string(),
  content: z.string(),
  isPinned: z.boolean(),
  viewCount: z.number().int(),
  commentCount: z.number().int(),
  author: PostAuthorSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PostListItemSchema = PostSchema.omit({ content: true }).extend({
  contentPreview: z.string(), // 2줄 미리보기
  isNew: z.boolean(),
});

export const CommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: PostAuthorSchema,
  createdAt: z.string(),
  isMine: z.boolean(),
});

export const PostPageSchema = cursorPageSchema(PostListItemSchema);
export const CommentPageSchema = cursorPageSchema(CommentSchema);

// ─── Form Input Schemas ───────────────────────────────────────────────────────

export const CreatePostInputSchema = z.object({
  type: PostTypeSchema,
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 최대 100자입니다.'),
  content: z.string().min(1, '내용을 입력해주세요.').max(2000, '본문은 최대 2,000자입니다.'),
  isPinned: z.boolean().default(false),
  sendNotification: z.boolean().default(false),
});

export const CreateCommentInputSchema = z.object({
  content: z.string().min(1, '댓글을 입력해주세요.').max(500, '댓글은 최대 500자입니다.'),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type PostType = z.infer<typeof PostTypeSchema>;
export type Post = z.infer<typeof PostSchema>;
export type PostListItem = z.infer<typeof PostListItemSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type PostPage = z.infer<typeof PostPageSchema>;
export type CommentPage = z.infer<typeof CommentPageSchema>;
export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;
