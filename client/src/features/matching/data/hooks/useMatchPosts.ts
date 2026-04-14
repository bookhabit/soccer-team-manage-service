import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  getMatchPosts,
  getMyMatchPosts,
  getMatchPostDetail,
  createMatchPost,
  updateMatchPost,
  deleteMatchPost,
  getMatchContact,
} from '../services/matchPost.service';
import { matchQueryKeys } from './matchQueryKeys';
import type { CreateMatchPostInput, UpdateMatchPostInput, MatchPostFilters } from '../schemas/matchPost.schema';

const DEFAULT_PAGE_SIZE = 20;

// ─── 목록 조회 ────────────────────────────────────────────────────────────────

export function useMatchPosts(filters: Omit<MatchPostFilters, 'cursor'> = {}) {
  return useSuspenseInfiniteQuery({
    queryKey: matchQueryKeys.lists(filters),
    queryFn: ({ pageParam }) =>
      getMatchPosts({ ...filters, cursor: pageParam as string | undefined, limit: DEFAULT_PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useMyMatchPosts() {
  return useSuspenseQuery({
    queryKey: matchQueryKeys.my(),
    queryFn: getMyMatchPosts,
  });
}

// ─── 상세 ────────────────────────────────────────────────────────────────────

export function useMatchPostDetail(id: string) {
  return useSuspenseQuery({
    queryKey: matchQueryKeys.detail(id),
    queryFn: () => getMatchPostDetail(id),
  });
}

// ─── 연락처 (수락 후 활성화) ──────────────────────────────────────────────────

export function useMatchContact(id: string, enabled: boolean) {
  return useQuery({
    queryKey: matchQueryKeys.contact(id),
    queryFn: () => getMatchContact(id),
    enabled,
  });
}

// ─── 게시글 뮤테이션 ──────────────────────────────────────────────────────────

export function useCreateMatchPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateMatchPostInput) => createMatchPost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-posts', 'list'] });
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.my() });
    },
  });
}

export function useUpdateMatchPost(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateMatchPostInput) => updateMatchPost(id, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(matchQueryKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: ['match-posts', 'list'] });
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.my() });
    },
  });
}

export function useDeleteMatchPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMatchPost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['match-posts', 'list'] });
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.my() });
      queryClient.removeQueries({ queryKey: matchQueryKeys.detail(id) });
    },
  });
}
