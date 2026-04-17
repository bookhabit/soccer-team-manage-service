import {
  useInfiniteQuery,
  keepPreviousData,
  useMutation,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getMatches,
  getMatchDetail,
  createMatch,
  updateMatch,
  deleteMatch,
  submitAttendance,
  getAttendances,
  getLineup,
  saveLineup,
  addParticipant,
  removeParticipant,
  submitRecord,
  updateRecord,
  getRecordHistories,
  submitMomVote,
  getMomResult,
  getComments,
  createComment,
  deleteComment,
  registerVideo,
  deleteVideo,
  submitOpponentRating,
} from '../services/match.service';
import { matchQueryKeys } from './matchQueryKeys';
import type {
  CreateMatchInput,
  MatchHistoryFilter,
  UpdateMatchInput,
  RecordInput,
  SaveLineupInput,
  CreateCommentInput,
  SubmitOpponentRatingInput,
} from '../schemas/match.schema';

const DEFAULT_PAGE_SIZE = 20;

// ─── 경기 목록·상세 ───────────────────────────────────────────────────────────

export function useMatches(clubId: string, filter: MatchHistoryFilter = {}) {
  return useInfiniteQuery({
    queryKey: matchQueryKeys.list(clubId, filter),
    queryFn: ({ pageParam }) =>
      getMatches(clubId, { ...filter, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  });
}

export function useMatchDetail(clubId: string, matchId: string) {
  return useSuspenseQuery({
    queryKey: matchQueryKeys.detail(clubId, matchId),
    queryFn: () => getMatchDetail(clubId, matchId),
  });
}

// ─── 경기 생성·수정·삭제 ──────────────────────────────────────────────────────

export function useCreateMatch(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMatchInput) => createMatch(clubId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.all(clubId) });
    },
  });
}

export function useUpdateMatch(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateMatchInput) => updateMatch(clubId, matchId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.detail(clubId, matchId) });
    },
  });
}

export function useDeleteMatch(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => deleteMatch(clubId, matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.all(clubId) });
    },
  });
}

// ─── 투표 응답 ────────────────────────────────────────────────────────────────

export function useAttendances(clubId: string, matchId: string) {
  return useSuspenseQuery({
    queryKey: matchQueryKeys.attendances(clubId, matchId),
    queryFn: () => getAttendances(clubId, matchId),
  });
}

export function useSubmitAttendance(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (response: 'ATTEND' | 'ABSENT' | 'UNDECIDED') =>
      submitAttendance(clubId, matchId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.attendances(clubId, matchId) });
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.detail(clubId, matchId) });
    },
  });
}

// ─── 포지션 배정 ──────────────────────────────────────────────────────────────

export function useLineup(clubId: string, matchId: string) {
  return useSuspenseQuery({
    queryKey: matchQueryKeys.lineup(clubId, matchId),
    queryFn: () => getLineup(clubId, matchId),
  });
}

export function useSaveLineup(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SaveLineupInput) => saveLineup(clubId, matchId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.lineup(clubId, matchId) });
    },
  });
}

export function useAddParticipant(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => addParticipant(clubId, matchId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.lineup(clubId, matchId) });
    },
  });
}

export function useRemoveParticipant(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeParticipant(clubId, matchId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.lineup(clubId, matchId) });
    },
  });
}

// ─── 경기 기록 ────────────────────────────────────────────────────────────────

export function useSubmitRecord(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RecordInput) => submitRecord(clubId, matchId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.detail(clubId, matchId) });
    },
  });
}

export function useUpdateRecord(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<RecordInput>) => updateRecord(clubId, matchId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.detail(clubId, matchId) });
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.recordHistories(clubId, matchId) });
    },
  });
}

export function useRecordHistories(clubId: string, matchId: string) {
  return useSuspenseQuery({
    queryKey: matchQueryKeys.recordHistories(clubId, matchId),
    queryFn: () => getRecordHistories(clubId, matchId),
  });
}

// ─── MOM 투표 ─────────────────────────────────────────────────────────────────

export function useMomResult(clubId: string, matchId: string) {
  return useSuspenseQuery({
    queryKey: matchQueryKeys.momResult(clubId, matchId),
    queryFn: () => getMomResult(clubId, matchId),
  });
}

export function useSubmitMomVote(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: string) => submitMomVote(clubId, matchId, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.momResult(clubId, matchId) });
    },
  });
}

// ─── 댓글 ─────────────────────────────────────────────────────────────────────

export function useMatchComments(clubId: string, matchId: string) {
  return useSuspenseInfiniteQuery({
    queryKey: matchQueryKeys.comments(clubId, matchId),
    queryFn: ({ pageParam }) =>
      getComments(clubId, matchId, { cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useCreateComment(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCommentInput) => createComment(clubId, matchId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.comments(clubId, matchId) });
    },
  });
}

export function useDeleteComment(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(clubId, matchId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.comments(clubId, matchId) });
    },
  });
}

// ─── 영상 ─────────────────────────────────────────────────────────────────────

export function useRegisterVideo(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (youtubeUrl: string) => registerVideo(clubId, matchId, youtubeUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.detail(clubId, matchId) });
    },
  });
}

export function useDeleteVideo(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => deleteVideo(clubId, matchId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.detail(clubId, matchId) });
    },
  });
}

// ─── 상대팀 평가 ──────────────────────────────────────────────────────────────

export function useSubmitOpponentRating(clubId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SubmitOpponentRatingInput) =>
      submitOpponentRating(clubId, matchId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchQueryKeys.detail(clubId, matchId) });
    },
  });
}
