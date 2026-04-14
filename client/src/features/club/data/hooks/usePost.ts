import { useMutation, useQuery, useQueryClient, useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  deleteComment,
} from '../services/post.service';
import { clubQueryKeys } from './clubQueryKeys';
import type { CreatePostInput, CreateCommentInput, PostType } from '../schemas/post.schema';

const DEFAULT_PAGE_SIZE = 20;

// ─── 게시글 목록 ──────────────────────────────────────────────────────────────

export function usePosts(clubId: string, type?: PostType) {
  return useSuspenseInfiniteQuery({
    queryKey: clubQueryKeys.posts(clubId, type),
    queryFn: ({ pageParam }) =>
      getPosts(clubId, {
        type,
        cursor: pageParam as string | undefined,
        limit: DEFAULT_PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

// ─── 게시글 상세 — 조회 시 Redis viewCount INCR 트리거 ───────────────────────

export function usePostDetail(clubId: string, postId: string) {
  return useSuspenseQuery({
    queryKey: clubQueryKeys.post(clubId, postId),
    queryFn: () => getPostDetail(clubId, postId),
  });
}

/** non-suspense 버전 — 수정 폼 초기화용 */
export function usePostDetailQuery(
  clubId: string,
  postId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: clubQueryKeys.post(clubId, postId),
    queryFn: () => getPostDetail(clubId, postId),
    enabled: options?.enabled ?? true,
  });
}

// ─── 게시글 작성·수정·삭제 ────────────────────────────────────────────────────

export function useCreatePost(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePostInput) => createPost(clubId, body),
    onSuccess: () => {
      // ['club', clubId, 'posts'] prefix matches all tabs (전체·공지·일반·문의)
      queryClient.invalidateQueries({ queryKey: ['club', clubId, 'posts'] });
    },
  });
}

export function useUpdatePost(clubId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<CreatePostInput>) => updatePost(clubId, postId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(clubQueryKeys.post(clubId, postId), updated);
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.posts(clubId) });
    },
  });
}

export function useDeletePost(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(clubId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club', clubId, 'posts'] });
    },
  });
}

// ─── 댓글 ─────────────────────────────────────────────────────────────────────

export function useComments(clubId: string, postId: string) {
  return useSuspenseInfiniteQuery({
    queryKey: clubQueryKeys.comments(clubId, postId),
    queryFn: ({ pageParam }) =>
      getComments(clubId, postId, {
        cursor: pageParam as string | undefined,
        limit: DEFAULT_PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useCreateComment(clubId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCommentInput) => createComment(clubId, postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.comments(clubId, postId) });
      // commentCount 반영을 위해 post detail도 무효화
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.post(clubId, postId) });
    },
  });
}

export function useDeleteComment(clubId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(clubId, postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.comments(clubId, postId) });
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.post(clubId, postId) });
    },
  });
}
