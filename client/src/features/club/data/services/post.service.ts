import { http } from '@/src/shared/http/apiClient';
import {
  PostSchema,
  PostPageSchema,
  CommentPageSchema,
  CommentSchema,
} from '../schemas/post.schema';
import type {
  Post,
  PostPage,
  CommentPage,
  Comment,
  CreatePostInput,
  CreateCommentInput,
  PostType,
} from '../schemas/post.schema';

// ─── 게시글 ───────────────────────────────────────────────────────────────────

export async function getPosts(
  clubId: string,
  params?: { type?: PostType; cursor?: string; limit?: number },
): Promise<PostPage> {
  return http.get<PostPage>(`/clubs/${clubId}/posts`, params, PostPageSchema);
}

export async function getPostDetail(clubId: string, postId: string): Promise<Post> {
  return http.get<Post>(`/clubs/${clubId}/posts/${postId}`, undefined, PostSchema);
}

export async function createPost(clubId: string, body: CreatePostInput): Promise<Post> {
  return http.post<Post>(`/clubs/${clubId}/posts`, body, PostSchema);
}

export async function updatePost(
  clubId: string,
  postId: string,
  body: Partial<CreatePostInput>,
): Promise<Post> {
  return http.patch<Post>(`/clubs/${clubId}/posts/${postId}`, body, PostSchema);
}

export async function deletePost(clubId: string, postId: string): Promise<void> {
  await http.delete(`/clubs/${clubId}/posts/${postId}`);
}

// ─── 댓글 ─────────────────────────────────────────────────────────────────────

export async function getComments(
  clubId: string,
  postId: string,
  params?: { cursor?: string; limit?: number },
): Promise<CommentPage> {
  return http.get<CommentPage>(
    `/clubs/${clubId}/posts/${postId}/comments`,
    params,
    CommentPageSchema,
  );
}

export async function createComment(
  clubId: string,
  postId: string,
  body: CreateCommentInput,
): Promise<Comment> {
  return http.post<Comment>(
    `/clubs/${clubId}/posts/${postId}/comments`,
    body,
    CommentSchema,
  );
}

export async function deleteComment(
  clubId: string,
  postId: string,
  commentId: string,
): Promise<void> {
  await http.delete(`/clubs/${clubId}/posts/${postId}/comments/${commentId}`);
}
