export const matchQueryKeys = {
  all: (clubId: string) => ['match', clubId] as const,
  list: (clubId: string, params?: object) => ['match', clubId, 'list', params ?? {}] as const,
  detail: (clubId: string, matchId: string) => ['match', clubId, matchId] as const,
  attendances: (clubId: string, matchId: string) =>
    ['match', clubId, matchId, 'attendances'] as const,
  lineup: (clubId: string, matchId: string) => ['match', clubId, matchId, 'lineup'] as const,
  recordHistories: (clubId: string, matchId: string) =>
    ['match', clubId, matchId, 'record-histories'] as const,
  momResult: (clubId: string, matchId: string) =>
    ['match', clubId, matchId, 'mom-result'] as const,
  comments: (clubId: string, matchId: string) => ['match', clubId, matchId, 'comments'] as const,
} as const;
