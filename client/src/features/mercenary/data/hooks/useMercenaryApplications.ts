import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
  getMercenaryApplications,
  applyMercenaryPost,
  acceptMercenaryApplication,
  rejectMercenaryApplication,
} from '../services/mercenaryPost.service';
import { mercenaryQueryKeys } from './mercenaryQueryKeys';
import type { CreateMercenaryApplicationInput } from '../schemas/mercenaryPost.schema';

// ─── 지원자 목록 ──────────────────────────────────────────────────────────────

export function useMercenaryApplications(postId: string) {
  return useSuspenseQuery({
    queryKey: mercenaryQueryKeys.applications(postId),
    queryFn: () => getMercenaryApplications(postId),
  });
}

// ─── 지원하기 ─────────────────────────────────────────────────────────────────

export function useApplyMercenaryPost(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMercenaryApplicationInput) => applyMercenaryPost(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.postDetail(postId) });
    },
  });
}

// ─── 수락 ─────────────────────────────────────────────────────────────────────

export function useAcceptMercenaryApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, appId }: { postId: string; appId: string }) =>
      acceptMercenaryApplication(postId, appId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.applications(postId) });
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.postDetail(postId) });
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.myPosts() });
      queryClient.invalidateQueries({ queryKey: ['mercenary-posts', 'list'] });
    },
  });
}

// ─── 거절 ─────────────────────────────────────────────────────────────────────

export function useRejectMercenaryApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, appId }: { postId: string; appId: string }) =>
      rejectMercenaryApplication(postId, appId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.applications(postId) });
    },
  });
}
