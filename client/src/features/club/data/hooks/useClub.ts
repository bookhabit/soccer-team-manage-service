import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  createClub,
  getMyClub,
  getClubDetail,
  updateClub,
  getClubMembers,
  getMemberDetail,
  kickMember,
  changeRole,
  transferCaptain,
  updateMemberStats,
  leaveClub,
  createJoinRequest,
  cancelJoinRequest,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getInviteCode,
  renewInviteCode,
  joinByCode,
  startDissolveVote,
  respondDissolveVote,
  getDissolveVote,
  searchClubs,
  getRecommendedClubs,
} from '../services/club.service';
import { clubQueryKeys } from './clubQueryKeys';
import type {
  CreateClubInput,
  JoinRequestInput,
  JoinByCodeInput,
  UpdateMemberStatsInput,
  LeaveReason,
} from '../schemas/club.schema';

const DEFAULT_PAGE_SIZE = 20;

// ─── 클럽 조회 ────────────────────────────────────────────────────────────────

export function useMyClub() {
  return useQuery({
    queryKey: clubQueryKeys.myClub,
    queryFn: getMyClub,
  });
}

export function useClubDetail(clubId: string) {
  return useQuery({
    queryKey: clubQueryKeys.detail(clubId),
    queryFn: () => getClubDetail(clubId),
    throwOnError: true,
  });
}

// ─── 클럽 생성·수정 ───────────────────────────────────────────────────────────

export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateClubInput) => createClub(body),
    onSuccess: (newClub) => {
      queryClient.setQueryData(clubQueryKeys.myClub, newClub);
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.myClub });
    },
  });
}

export function useUpdateClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<CreateClubInput>) => updateClub(clubId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(clubQueryKeys.detail(clubId), updated);
    },
  });
}

// ─── 팀원 목록 ────────────────────────────────────────────────────────────────

export function useClubMembers(clubId: string, position?: string) {
  return useInfiniteQuery({
    queryKey: clubQueryKeys.members(clubId),
    queryFn: ({ pageParam }) =>
      getClubMembers(clubId, {
        cursor: pageParam as string | undefined,
        limit: DEFAULT_PAGE_SIZE,
        position,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    throwOnError: true,
  });
}

// ─── 팀원 상세 ────────────────────────────────────────────────────────────────

export function useMemberDetail(clubId: string, userId: string) {
  return useQuery({
    queryKey: clubQueryKeys.member(clubId, userId),
    queryFn: () => getMemberDetail(clubId, userId),
    throwOnError: true,
  });
}

// ─── 팀원 액션 ────────────────────────────────────────────────────────────────

export function useKickMember(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) => kickMember(clubId, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.members(clubId) });
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.detail(clubId) });
    },
  });
}

export function useChangeRole(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetUserId, role }: { targetUserId: string; role: 'VICE_CAPTAIN' | 'MEMBER' }) =>
      changeRole(clubId, targetUserId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.members(clubId) });
    },
  });
}

export function useTransferCaptain(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) => transferCaptain(clubId, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.myClub });
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.detail(clubId) });
    },
  });
}

export function useUpdateMemberStats(clubId: string, targetUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateMemberStatsInput) => updateMemberStats(clubId, targetUserId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(clubQueryKeys.member(clubId, targetUserId), updated);
    },
  });
}

export function useLeaveClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: LeaveReason) => leaveClub(clubId, reason),
    onSuccess: () => {
      queryClient.setQueryData(clubQueryKeys.myClub, null);
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.myClub });
      router.replace('/(app)' as any);
    },
  });
}

// ─── 가입 신청 ────────────────────────────────────────────────────────────────

export function useJoinRequests(clubId: string) {
  return useInfiniteQuery({
    queryKey: clubQueryKeys.joinRequests(clubId),
    queryFn: ({ pageParam }) =>
      getJoinRequests(clubId, {
        cursor: pageParam as string | undefined,
        limit: DEFAULT_PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    throwOnError: true,
  });
}

export function useCreateJoinRequest(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: JoinRequestInput) => createJoinRequest(clubId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.detail(clubId) });
    },
  });
}

export function useCancelJoinRequest(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelJoinRequest(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.detail(clubId) });
    },
  });
}

export function useApproveJoinRequest(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => approveJoinRequest(clubId, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.joinRequests(clubId) });
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.detail(clubId) });
    },
  });
}

export function useRejectJoinRequest(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => rejectJoinRequest(clubId, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubQueryKeys.joinRequests(clubId) });
    },
  });
}

// ─── 초대 코드 ────────────────────────────────────────────────────────────────

export function useInviteCode(clubId: string) {
  return useQuery({
    queryKey: clubQueryKeys.inviteCode(clubId),
    queryFn: () => getInviteCode(clubId),
  });
}

export function useRenewInviteCode(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => renewInviteCode(clubId),
    onSuccess: (updated) => {
      queryClient.setQueryData(clubQueryKeys.inviteCode(clubId), updated);
    },
  });
}

export function useJoinByCode() {
  return useMutation({
    mutationFn: (body: JoinByCodeInput) => joinByCode(body),
  });
}

// ─── 해체 투표 ────────────────────────────────────────────────────────────────

export function useDissolveVote(clubId: string) {
  return useQuery({
    queryKey: clubQueryKeys.dissolveVote(clubId),
    queryFn: () => getDissolveVote(clubId),
  });
}

export function useStartDissolveVote(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startDissolveVote(clubId),
    onSuccess: (vote) => {
      // 즉시 해체(1인) 시 myClub null 처리
      if (vote.status === 'APPROVED') {
        queryClient.setQueryData(clubQueryKeys.myClub, null);
        queryClient.invalidateQueries({ queryKey: clubQueryKeys.myClub });
      } else {
        queryClient.setQueryData(clubQueryKeys.dissolveVote(clubId), vote);
      }
    },
  });
}

export function useRespondDissolveVote(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agreed: boolean) => respondDissolveVote(clubId, agreed),
    onSuccess: (vote) => {
      queryClient.setQueryData(clubQueryKeys.dissolveVote(clubId), vote);
      if (vote.status === 'APPROVED') {
        queryClient.setQueryData(clubQueryKeys.myClub, null);
        queryClient.invalidateQueries({ queryKey: clubQueryKeys.myClub });
      }
    },
  });
}

// ─── 클럽 검색 ────────────────────────────────────────────────────────────────

export function useClubSearch(params: { name?: string; regionId?: string; nearby?: boolean }) {
  return useInfiniteQuery({
    queryKey: clubQueryKeys.search(params),
    queryFn: ({ pageParam }) =>
      searchClubs({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Object.values(params).some(Boolean),
  });
}

export function useRecommendedClubs() {
  return useInfiniteQuery({
    queryKey: clubQueryKeys.recommended,
    queryFn: ({ pageParam }) =>
      getRecommendedClubs({ cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
