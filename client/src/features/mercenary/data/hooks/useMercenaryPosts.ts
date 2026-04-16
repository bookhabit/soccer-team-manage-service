import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  getMercenaryPosts,
  getMyMercenaryPosts,
  getMercenaryPostDetail,
  createMercenaryPost,
  updateMercenaryPost,
  deleteMercenaryPost,
} from '../services/mercenaryPost.service';
import { mercenaryQueryKeys } from './mercenaryQueryKeys';
import type { CreateMercenaryPostInput, MercenaryPostFilters, UpdateMercenaryPostInput } from '../schemas/mercenaryPost.schema';

const DEFAULT_PAGE_SIZE = 20;

// ─── 목록 ─────────────────────────────────────────────────────────────────────

export function useMercenaryPosts(filters: Omit<MercenaryPostFilters, 'cursor'> = {}) {
  return useSuspenseInfiniteQuery({
    queryKey: mercenaryQueryKeys.postLists(filters),
    queryFn: ({ pageParam }) =>
      getMercenaryPosts({ ...filters, cursor: pageParam as string | undefined, limit: DEFAULT_PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useMyMercenaryPosts() {
  return useSuspenseQuery({
    queryKey: mercenaryQueryKeys.myPosts(),
    queryFn: getMyMercenaryPosts,
  });
}

// ─── 상세 ─────────────────────────────────────────────────────────────────────

export function useMercenaryPostDetail(id: string) {
  return useSuspenseQuery({
    queryKey: mercenaryQueryKeys.postDetail(id),
    queryFn: () => getMercenaryPostDetail(id),
  });
}

// ─── 등록 ─────────────────────────────────────────────────────────────────────

export function useCreateMercenaryPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMercenaryPostInput) => createMercenaryPost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mercenary-posts', 'list'] });
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.myPosts() });
    },
  });
}

// ─── 수정 ─────────────────────────────────────────────────────────────────────

export function useUpdateMercenaryPost(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateMercenaryPostInput) => updateMercenaryPost(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.postDetail(id) });
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.myPosts() });
    },
  });
}

// ─── 삭제 ─────────────────────────────────────────────────────────────────────

export function useDeleteMercenaryPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMercenaryPost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['mercenary-posts', 'list'] });
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.myPosts() });
      queryClient.removeQueries({ queryKey: mercenaryQueryKeys.postDetail(id) });
    },
  });
}
