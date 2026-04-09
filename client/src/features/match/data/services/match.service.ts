import { http } from '@/src/shared/http/apiClient';
import {
  AttendanceSchema,
  LineupSchema,
  MatchCommentPageSchema,
  MatchDetailSchema,
  MatchPageSchema,
  MatchVideoSchema,
  MomResultSchema,
  OpponentRatingSchema,
  RecordHistorySchema,
} from '../schemas/match.schema';
import type {
  Attendance,
  CreateCommentInput,
  CreateMatchInput,
  Lineup,
  MatchCommentPage,
  MatchDetail,
  MatchPage,
  MatchVideo,
  MomResult,
  OpponentRating,
  RecordHistory,
  RecordInput,
  SaveLineupInput,
  SubmitOpponentRatingInput,
  UpdateMatchInput,
} from '../schemas/match.schema';
import { z } from 'zod';

const base = (clubId: string) => `/clubs/${clubId}/matches`;
const matchBase = (clubId: string, matchId: string) => `${base(clubId)}/${matchId}`;

// ─── 경기 CRUD ────────────────────────────────────────────────────────────────

export async function getMatches(
  clubId: string,
  params?: { type?: string; cursor?: string; limit?: number },
): Promise<MatchPage> {
  return http.get<MatchPage>(base(clubId), params, MatchPageSchema);
}

export async function getMatchDetail(clubId: string, matchId: string): Promise<MatchDetail> {
  return http.get<MatchDetail>(matchBase(clubId, matchId), undefined, MatchDetailSchema);
}

export async function createMatch(clubId: string, body: CreateMatchInput): Promise<MatchDetail> {
  return http.post<MatchDetail>(base(clubId), body, MatchDetailSchema);
}

export async function updateMatch(
  clubId: string,
  matchId: string,
  body: UpdateMatchInput,
): Promise<MatchDetail> {
  return http.patch<MatchDetail>(matchBase(clubId, matchId), body, MatchDetailSchema);
}

export async function deleteMatch(clubId: string, matchId: string): Promise<void> {
  return http.delete<void>(matchBase(clubId, matchId));
}

// ─── 투표 응답 ────────────────────────────────────────────────────────────────

export async function submitAttendance(
  clubId: string,
  matchId: string,
  response: 'ATTEND' | 'ABSENT' | 'UNDECIDED',
): Promise<void> {
  return http.post<void>(`${matchBase(clubId, matchId)}/attendances`, { response });
}

export async function getAttendances(clubId: string, matchId: string): Promise<Attendance[]> {
  return http.get<Attendance[]>(
    `${matchBase(clubId, matchId)}/attendances`,
    undefined,
    z.array(AttendanceSchema),
  );
}

// ─── 포지션 배정 ──────────────────────────────────────────────────────────────

export async function getLineup(clubId: string, matchId: string): Promise<Lineup> {
  return http.get<Lineup>(`${matchBase(clubId, matchId)}/lineup`, undefined, LineupSchema);
}

export async function saveLineup(
  clubId: string,
  matchId: string,
  body: SaveLineupInput,
): Promise<Lineup> {
  return http.put<Lineup>(`${matchBase(clubId, matchId)}/lineup`, body, LineupSchema);
}

export async function addParticipant(
  clubId: string,
  matchId: string,
  userId: string,
): Promise<void> {
  return http.post<void>(`${matchBase(clubId, matchId)}/participants`, { userId });
}

export async function removeParticipant(
  clubId: string,
  matchId: string,
  userId: string,
): Promise<void> {
  return http.delete<void>(`${matchBase(clubId, matchId)}/participants/${userId}`);
}

// ─── 경기 기록 ────────────────────────────────────────────────────────────────

export async function submitRecord(
  clubId: string,
  matchId: string,
  body: RecordInput,
): Promise<void> {
  return http.post<void>(`${matchBase(clubId, matchId)}/record`, body);
}

export async function updateRecord(
  clubId: string,
  matchId: string,
  body: Partial<RecordInput>,
): Promise<void> {
  return http.patch<void>(`${matchBase(clubId, matchId)}/record`, body);
}

export async function getRecordHistories(
  clubId: string,
  matchId: string,
): Promise<RecordHistory[]> {
  return http.get<RecordHistory[]>(
    `${matchBase(clubId, matchId)}/record/histories`,
    undefined,
    z.array(RecordHistorySchema),
  );
}

// ─── MOM 투표 ─────────────────────────────────────────────────────────────────

export async function submitMomVote(
  clubId: string,
  matchId: string,
  targetUserId: string,
): Promise<void> {
  return http.post<void>(`${matchBase(clubId, matchId)}/mom-votes`, { targetUserId });
}

export async function getMomResult(clubId: string, matchId: string): Promise<MomResult> {
  return http.get<MomResult>(
    `${matchBase(clubId, matchId)}/mom-votes/result`,
    undefined,
    MomResultSchema,
  );
}

// ─── 댓글 ─────────────────────────────────────────────────────────────────────

export async function getComments(
  clubId: string,
  matchId: string,
  params?: { cursor?: string; limit?: number },
): Promise<MatchCommentPage> {
  return http.get<MatchCommentPage>(
    `${matchBase(clubId, matchId)}/comments`,
    params,
    MatchCommentPageSchema,
  );
}

export async function createComment(
  clubId: string,
  matchId: string,
  body: CreateCommentInput,
): Promise<void> {
  return http.post<void>(`${matchBase(clubId, matchId)}/comments`, body);
}

export async function deleteComment(
  clubId: string,
  matchId: string,
  commentId: string,
): Promise<void> {
  return http.delete<void>(`${matchBase(clubId, matchId)}/comments/${commentId}`);
}

// ─── 영상 ─────────────────────────────────────────────────────────────────────

export async function registerVideo(
  clubId: string,
  matchId: string,
  youtubeUrl: string,
): Promise<MatchVideo> {
  return http.post<MatchVideo>(
    `${matchBase(clubId, matchId)}/videos`,
    { youtubeUrl },
    MatchVideoSchema,
  );
}

export async function deleteVideo(
  clubId: string,
  matchId: string,
  videoId: string,
): Promise<void> {
  return http.delete<void>(`${matchBase(clubId, matchId)}/videos/${videoId}`);
}

// ─── 상대팀 평가 ──────────────────────────────────────────────────────────────

export async function submitOpponentRating(
  clubId: string,
  matchId: string,
  body: SubmitOpponentRatingInput,
): Promise<OpponentRating> {
  return http.post<OpponentRating>(
    `${matchBase(clubId, matchId)}/opponent-rating`,
    body,
    OpponentRatingSchema,
  );
}
