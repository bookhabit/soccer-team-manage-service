import { http } from '@/src/shared/http/apiClient';
import {
  MatchApplicationItemSchema,
  MatchApplicationListSchema,
  MyApplicationListSchema,
} from '../schemas/matchApplication.schema';
import type {
  MatchApplicationItem,
  MatchApplicationList,
  MyApplicationList,
  CreateMatchApplicationInput,
} from '../schemas/matchApplication.schema';

// ─── 신청 ─────────────────────────────────────────────────────────────────────

export async function applyMatchPost(
  postId: string,
  body: CreateMatchApplicationInput,
): Promise<MatchApplicationItem> {
  return http.post<MatchApplicationItem>(
    `/match-posts/${postId}/applications`,
    body,
    MatchApplicationItemSchema,
  );
}

// ─── 신청 목록 조회 (등록자) ──────────────────────────────────────────────────

export async function getMatchApplications(postId: string): Promise<MatchApplicationList> {
  return http.get<MatchApplicationList>(
    `/match-posts/${postId}/applications`,
    undefined,
    MatchApplicationListSchema,
  );
}

// ─── 수락 / 거절 ──────────────────────────────────────────────────────────────

export async function acceptMatchApplication(postId: string, appId: string): Promise<void> {
  return http.patch<void>(`/match-posts/${postId}/applications/${appId}/accept`);
}

export async function rejectMatchApplication(postId: string, appId: string): Promise<void> {
  return http.patch<void>(`/match-posts/${postId}/applications/${appId}/reject`);
}

// ─── 내 신청 목록 ─────────────────────────────────────────────────────────────

export async function getMyApplications(): Promise<MyApplicationList> {
  return http.get<MyApplicationList>(
    '/match-posts/my-applications',
    undefined,
    MyApplicationListSchema,
  );
}
