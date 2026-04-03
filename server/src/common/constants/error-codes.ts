export const ErrorCode = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  TOKEN_REUSE_DETECTED: 'TOKEN_REUSE_DETECTED',
  MISSING_REFRESH_TOKEN: 'MISSING_REFRESH_TOKEN',

  // ─── User ──────────────────────────────────────────────────────────────────
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',

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
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
