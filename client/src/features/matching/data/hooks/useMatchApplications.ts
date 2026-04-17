import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  applyMatchPost,
  getMatchApplications,
  acceptMatchApplication,
  rejectMatchApplication,
  getMyApplications,
} from '../services/matchApplication.service';
import { matchQueryKeys } from './matchQueryKeys';
import type { CreateMatchApplicationInput } from '../schemas/matchApplication.schema';

// ─── 신청 목록 (등록자) ───────────────────────────────────────────────────────

export function useMatchApplications(postId: string) {
  return useQuery({
    queryKey: matchQueryKeys.applications(postId),
    queryFn: () => getMatchApplications(postId),
    placeholderData: keepPreviousData,
  });
}

// ─── 내 신청 목록 ─────────────────────────────────────────────────────────────

export function useMyApplications() {
  return useQuery({
    queryKey: matchQueryKeys.myApplications(),
    queryFn: getMyApplications,
    placeholderData: keepPreviousData,
  });
}

// ─── 신청 뮤테이션 ────────────────────────────────────────────────────────────

export function useApplyMatchPost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateMatchApplicationInput) => applyMatchPost(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.myApplications() });
    },
  });
}

export function useAcceptApplication(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => acceptMatchApplication(postId, appId),
    onSuccess: () => {
      // 전체 목록 캐시에서 해당 게시글 status를 즉시 MATCHED로 반영 (배경 리페치 전에도 즉시 표시)
      queryClient.setQueriesData(
        { queryKey: ['match-posts', 'list'] },
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) =>
                item.id === postId ? { ...item, status: 'MATCHED' } : item,
              ),
            })),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.applications(postId) });
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: ['match-posts', 'list'] });
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.my() });
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.myApplications() });
    },
  });
}

export function useRejectApplication(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => rejectMatchApplication(postId, appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.applications(postId) });
    },
  });
}
