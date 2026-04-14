import { http } from '@/src/shared/http/apiClient';
import {
  MatchPostListSchema,
  MatchPostDetailSchema,
  MatchPostSummarySchema,
  MatchContactSchema,
} from '../schemas/matchPost.schema';
import type {
  MatchPostList,
  MatchPostDetail,
  MatchPostSummary,
  MatchContact,
  CreateMatchPostInput,
  UpdateMatchPostInput,
  MatchPostFilters,
} from '../schemas/matchPost.schema';

// ─── 목록 조회 ────────────────────────────────────────────────────────────────

export async function getMatchPosts(filters: MatchPostFilters): Promise<MatchPostList> {
  return http.get<MatchPostList>('/match-posts', filters as object, MatchPostListSchema);
}

export async function getMyMatchPosts(): Promise<{ items: MatchPostSummary[] }> {
  return http.get<{ items: MatchPostSummary[] }>('/match-posts/my');
}

// ─── 상세 ────────────────────────────────────────────────────────────────────

export async function getMatchPostDetail(id: string): Promise<MatchPostDetail> {
  return http.get<MatchPostDetail>(`/match-posts/${id}`, undefined, MatchPostDetailSchema);
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createMatchPost(body: CreateMatchPostInput): Promise<MatchPostSummary> {
  return http.post<MatchPostSummary>('/match-posts', body, MatchPostSummarySchema);
}

export async function updateMatchPost(id: string, body: UpdateMatchPostInput): Promise<MatchPostSummary> {
  return http.patch<MatchPostSummary>(`/match-posts/${id}`, body, MatchPostSummarySchema);
}

export async function deleteMatchPost(id: string): Promise<void> {
  return http.delete<void>(`/match-posts/${id}`);
}

// ─── 연락처 ───────────────────────────────────────────────────────────────────

export async function getMatchContact(id: string): Promise<MatchContact> {
  return http.get<MatchContact>(`/match-posts/${id}/contact`, undefined, MatchContactSchema);
}
