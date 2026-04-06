export const ErrorCode = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  TOKEN_REUSE_DETECTED: 'TOKEN_REUSE_DETECTED',
  MISSING_REFRESH_TOKEN: 'MISSING_REFRESH_TOKEN',

  // ─── User ──────────────────────────────────────────────────────────────────
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
