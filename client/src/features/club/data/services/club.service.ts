import { http } from '@/src/shared/http/apiClient';
import {
  ClubDetailSchema,
  ClubMemberPageSchema,
  MemberDetailSchema,
  JoinRequestPageSchema,
  InviteCodeSchema,
  DissolveVoteSchema,
  ClubPreviewPageSchema,
} from '../schemas/club.schema';
import type {
  ClubDetail,
  ClubMember,
  ClubMemberPage,
  MemberDetail,
  JoinRequestPage,
  InviteCode,
  DissolveVote,
  ClubPreviewPage,
  CreateClubInput,
  JoinRequestInput,
  JoinByCodeInput,
  UpdateMemberStatsInput,
  LeaveReason,
} from '../schemas/club.schema';

// ─── 클럽 CRUD ────────────────────────────────────────────────────────────────

export async function createClub(body: CreateClubInput): Promise<ClubDetail> {
  return http.post<ClubDetail>('/clubs', body, ClubDetailSchema);
}

export async function getMyClub(): Promise<ClubDetail | null> {
  return http.get<ClubDetail | null>('/clubs/my', undefined, ClubDetailSchema.nullable());
}

export async function getClubDetail(clubId: string): Promise<ClubDetail> {
  return http.get<ClubDetail>(`/clubs/${clubId}`, undefined, ClubDetailSchema);
}

export async function updateClub(
  clubId: string,
  body: Partial<CreateClubInput>,
): Promise<ClubDetail> {
  return http.patch<ClubDetail>(`/clubs/${clubId}`, body, ClubDetailSchema);
}

// ─── 팀원 관리 ────────────────────────────────────────────────────────────────

export async function getClubMembers(
  clubId: string,
  params?: { cursor?: string; limit?: number; position?: string },
): Promise<ClubMemberPage> {
  return http.get<ClubMemberPage>(`/clubs/${clubId}/members`, params, ClubMemberPageSchema);
}

export async function getMemberDetail(clubId: string, userId: string): Promise<MemberDetail> {
  return http.get<MemberDetail>(
    `/clubs/${clubId}/members/${userId}`,
    undefined,
    MemberDetailSchema,
  );
}

export async function kickMember(clubId: string, targetUserId: string): Promise<void> {
  await http.delete(`/clubs/${clubId}/members/${targetUserId}/kick`);
}

export async function changeRole(
  clubId: string,
  targetUserId: string,
  role: 'VICE_CAPTAIN' | 'MEMBER',
): Promise<void> {
  await http.patch(`/clubs/${clubId}/members/${targetUserId}/role`, { role });
}

export async function transferCaptain(clubId: string, targetUserId: string): Promise<void> {
  await http.post(`/clubs/${clubId}/transfer-captain`, { targetUserId });
}

export async function updateMemberStats(
  clubId: string,
  targetUserId: string,
  body: UpdateMemberStatsInput,
): Promise<MemberDetail> {
  return http.patch<MemberDetail>(
    `/clubs/${clubId}/members/${targetUserId}/stats`,
    body,
    MemberDetailSchema,
  );
}

export async function leaveClub(clubId: string, reason: LeaveReason): Promise<void> {
  await http.delete(`/clubs/${clubId}/leave`, { reason });
}

// ─── 가입 신청 ────────────────────────────────────────────────────────────────

export async function createJoinRequest(
  clubId: string,
  body: JoinRequestInput,
): Promise<void> {
  await http.post(`/clubs/${clubId}/join-requests`, body);
}

export async function cancelJoinRequest(clubId: string): Promise<void> {
  await http.delete(`/clubs/${clubId}/join-requests/mine`);
}

export async function getJoinRequests(
  clubId: string,
  params?: { cursor?: string; limit?: number },
): Promise<JoinRequestPage> {
  return http.get<JoinRequestPage>(
    `/clubs/${clubId}/join-requests`,
    params,
    JoinRequestPageSchema,
  );
}

export async function approveJoinRequest(clubId: string, requestId: string): Promise<void> {
  await http.patch(`/clubs/${clubId}/join-requests/${requestId}/approve`, {});
}

export async function rejectJoinRequest(clubId: string, requestId: string): Promise<void> {
  await http.patch(`/clubs/${clubId}/join-requests/${requestId}/reject`, {});
}

// ─── 초대 코드 ────────────────────────────────────────────────────────────────

export async function getInviteCode(clubId: string): Promise<InviteCode> {
  return http.get<InviteCode>(`/clubs/${clubId}/invite-code`, undefined, InviteCodeSchema);
}

export async function renewInviteCode(clubId: string): Promise<InviteCode> {
  return http.post<InviteCode>(`/clubs/${clubId}/invite-code/renew`, {}, InviteCodeSchema);
}

export async function joinByCode(body: JoinByCodeInput): Promise<void> {
  await http.post('/clubs/join-by-code', body);
}

// ─── 해체 투표 ────────────────────────────────────────────────────────────────

export async function startDissolveVote(clubId: string): Promise<DissolveVote> {
  return http.post<DissolveVote>(
    `/clubs/${clubId}/dissolve-vote`,
    {},
    DissolveVoteSchema,
  );
}

export async function respondDissolveVote(
  clubId: string,
  agreed: boolean,
): Promise<DissolveVote> {
  return http.patch<DissolveVote>(
    `/clubs/${clubId}/dissolve-vote/respond`,
    { agreed },
    DissolveVoteSchema,
  );
}

export async function getDissolveVote(clubId: string): Promise<DissolveVote | null> {
  return http.get<DissolveVote | null>(
    `/clubs/${clubId}/dissolve-vote`,
    undefined,
    DissolveVoteSchema.nullable(),
  );
}

// ─── 클럽 검색 ────────────────────────────────────────────────────────────────

export async function searchClubs(params: {
  name?: string;
  regionId?: string;
  nearby?: boolean;
  cursor?: string;
}): Promise<ClubPreviewPage> {
  return http.get<ClubPreviewPage>('/clubs/search', params, ClubPreviewPageSchema);
}

export async function getRecommendedClubs(params?: { cursor?: string }): Promise<ClubPreviewPage> {
  return http.get<ClubPreviewPage>('/clubs/recommended', params, ClubPreviewPageSchema);
}
