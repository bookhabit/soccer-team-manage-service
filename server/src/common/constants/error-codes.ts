export const ErrorCode = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  TOKEN_REUSE_DETECTED: 'TOKEN_REUSE_DETECTED',
  MISSING_REFRESH_TOKEN: 'MISSING_REFRESH_TOKEN',

  // ─── User ──────────────────────────────────────────────────────────────────
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ONBOARDING_ALREADY_DONE: 'ONBOARDING_ALREADY_DONE',
  USER_DELETED: 'USER_DELETED',
  USER_RESTRICTED: 'USER_RESTRICTED',

  // ─── Region ────────────────────────────────────────────────────────────────
  REGION_NOT_FOUND: 'REGION_NOT_FOUND',

  // ─── Team ──────────────────────────────────────────────────────────────────
  TEAM_NOT_FOUND: 'TEAM_NOT_FOUND',
  NAME_ALREADY_EXISTS: 'NAME_ALREADY_EXISTS',
  ALREADY_MEMBER: 'ALREADY_MEMBER',
  NOT_MEMBER: 'NOT_MEMBER',
  NOT_CAPTAIN: 'NOT_CAPTAIN',
  CAPTAIN_CANNOT_LEAVE: 'CAPTAIN_CANNOT_LEAVE',
  JOIN_REQUEST_ALREADY_SENT: 'JOIN_REQUEST_ALREADY_SENT',
  JOIN_REQUEST_NOT_FOUND: 'JOIN_REQUEST_NOT_FOUND',
  JOIN_REQUEST_ALREADY_PROCESSED: 'JOIN_REQUEST_ALREADY_PROCESSED',

  // ─── Match ─────────────────────────────────────────────────────────────────
  MATCH_NOT_FOUND: 'MATCH_NOT_FOUND',
  MATCH_NOT_OPEN: 'MATCH_NOT_OPEN',
  MATCH_ALREADY_FINALIZED: 'MATCH_ALREADY_FINALIZED',
  SAME_TEAM: 'SAME_TEAM',
  NOT_HOME_CAPTAIN: 'NOT_HOME_CAPTAIN',

  // ─── Match Domain (MATCH_001–010) ──────────────────────────────────────────
  MATCH_001: 'MATCH_001', // 존재하지 않는 경기 404
  MATCH_002: 'MATCH_002', // 경기 수정/삭제 권한 없음 (관리자 아님) 403
  MATCH_003: 'MATCH_003', // 투표 마감 후 투표 변경 불가 422
  MATCH_004: 'MATCH_004', // 경기 종료 전 기록 입력 불가 422
  MATCH_005: 'MATCH_005', // MOM 투표 마감 (경기 당일 자정 경과) 422
  MATCH_006: 'MATCH_006', // 이미 MOM 투표 완료 (1인 1표) 409
  MATCH_007: 'MATCH_007', // 상대팀 평가 불가 (매칭전 아님 또는 기록 미등록) 422
  MATCH_008: 'MATCH_008', // 이미 제출한 상대팀 평가 409
  MATCH_009: 'MATCH_009', // 마감된 투표 수정 불가 422
  MATCH_010: 'MATCH_010', // 존재하지 않는 참여 선수 404

  // ─── Club ──────────────────────────────────────────────────────────────────
  CLUB_NOT_FOUND: 'CLUB_NOT_FOUND',
  CLUB_NO_PERMISSION: 'CLUB_NO_PERMISSION',
  CLUB_ALREADY_MEMBER: 'CLUB_ALREADY_MEMBER',
  CLUB_FULL: 'CLUB_FULL',
  CLUB_BANNED: 'CLUB_BANNED',
  CLUB_JOIN_REQUEST_DUPLICATE: 'CLUB_JOIN_REQUEST_DUPLICATE',
  CLUB_INVITE_CODE_EXPIRED: 'CLUB_INVITE_CODE_EXPIRED',
  CLUB_INVITE_CODE_INVALID: 'CLUB_INVITE_CODE_INVALID',
  CLUB_CAPTAIN_CANNOT_LEAVE: 'CLUB_CAPTAIN_CANNOT_LEAVE',
  CLUB_DISSOLVE_VOTE_IN_PROGRESS: 'CLUB_DISSOLVE_VOTE_IN_PROGRESS',
  CLUB_DISSOLVE_VOTE_EXPIRED: 'CLUB_DISSOLVE_VOTE_EXPIRED',
  CLUB_JOIN_REQUEST_NOT_FOUND: 'CLUB_JOIN_REQUEST_NOT_FOUND',

  // ─── Post ──────────────────────────────────────────────────────────────────
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  POST_NO_EDIT_PERMISSION: 'POST_NO_EDIT_PERMISSION',
  POST_NO_DELETE_PERMISSION: 'POST_NO_DELETE_PERMISSION',

  // ─── Comment ───────────────────────────────────────────────────────────────
  COMMENT_NO_DELETE_PERMISSION: 'COMMENT_NO_DELETE_PERMISSION',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
