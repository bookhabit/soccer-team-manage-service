import { useMutation, useQueryClient, useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  getMercenaryAvailabilities,
  getMyMercenaryAvailabilities,
  getMercenaryAvailabilityDetail,
  getMyRecruitments,
  createMercenaryAvailability,
  updateMercenaryAvailability,
  deleteMercenaryAvailability,
  recruitMercenary,
  acceptMercenaryRecruitment,
  rejectMercenaryRecruitment,
} from '../services/mercenaryAvailability.service';
import { mercenaryQueryKeys } from './mercenaryQueryKeys';
import type { CreateMercenaryAvailabilityInput, MercenaryAvailabilityFilters, UpdateMercenaryAvailabilityInput, CreateMercenaryRecruitmentInput } from '../schemas/mercenaryAvailability.schema';

const DEFAULT_PAGE_SIZE = 20;

// ─── 목록 ─────────────────────────────────────────────────────────────────────

export function useMercenaryAvailabilities(filters: Omit<MercenaryAvailabilityFilters, 'cursor'> = {}) {
  return useSuspenseInfiniteQuery({
    queryKey: mercenaryQueryKeys.availabilityLists(filters),
    queryFn: ({ pageParam }) =>
      getMercenaryAvailabilities({
        ...filters,
        cursor: pageParam as string | undefined,
        limit: DEFAULT_PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useMyMercenaryAvailabilities() {
  return useSuspenseQuery({
    queryKey: mercenaryQueryKeys.myAvailabilities(),
    queryFn: getMyMercenaryAvailabilities,
  });
}

export function useMyRecruitments() {
  return useSuspenseQuery({
    queryKey: mercenaryQueryKeys.myRecruitments(),
    queryFn: getMyRecruitments,
  });
}

// ─── 상세 ─────────────────────────────────────────────────────────────────────

export function useMercenaryAvailabilityDetail(id: string) {
  return useSuspenseQuery({
    queryKey: mercenaryQueryKeys.availabilityDetail(id),
    queryFn: () => getMercenaryAvailabilityDetail(id),
  });
}

// ─── 등록 ─────────────────────────────────────────────────────────────────────

export function useCreateMercenaryAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMercenaryAvailabilityInput) => createMercenaryAvailability(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mercenary-availabilities', 'list'] });
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.myAvailabilities() });
    },
  });
}

// ─── 수정 ─────────────────────────────────────────────────────────────────────

export function useUpdateMercenaryAvailability(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateMercenaryAvailabilityInput) => updateMercenaryAvailability(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.availabilityDetail(id) });
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.myAvailabilities() });
    },
  });
}

// ─── 삭제 ─────────────────────────────────────────────────────────────────────

export function useDeleteMercenaryAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMercenaryAvailability(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['mercenary-availabilities', 'list'] });
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.myAvailabilities() });
      queryClient.removeQueries({ queryKey: mercenaryQueryKeys.availabilityDetail(id) });
    },
  });
}

// ─── 영입 신청 ────────────────────────────────────────────────────────────────

export function useRecruitMercenary(availId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMercenaryRecruitmentInput) => recruitMercenary(availId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.availabilityDetail(availId) });
    },
  });
}

// ─── 영입 신청 수락/거절 ──────────────────────────────────────────────────────

export function useAcceptMercenaryRecruitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ availId, recId }: { availId: string; recId: string }) =>
      acceptMercenaryRecruitment(availId, recId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.myRecruitments() });
    },
  });
}

export function useRejectMercenaryRecruitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ availId, recId }: { availId: string; recId: string }) =>
      rejectMercenaryRecruitment(availId, recId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mercenaryQueryKeys.myRecruitments() });
    },
  });
}
