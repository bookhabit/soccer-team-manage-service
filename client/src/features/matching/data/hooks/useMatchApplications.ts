import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
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
  return useSuspenseQuery({
    queryKey: matchQueryKeys.applications(postId),
    queryFn: () => getMatchApplications(postId),
  });
}

// ─── 내 신청 목록 ─────────────────────────────────────────────────────────────

export function useMyApplications() {
  return useSuspenseQuery({
    queryKey: matchQueryKeys.myApplications(),
    queryFn: getMyApplications,
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
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.applications(postId) });
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: ['match-posts', 'list'] });
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.my() });
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
