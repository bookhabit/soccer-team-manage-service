import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const headToHeadResultSchema = z.enum(['WIN', 'DRAW', 'LOSS']);
export type HeadToHeadResult = z.infer<typeof headToHeadResultSchema>;

// ─── Summary ─────────────────────────────────────────────────────────────────

export const headToHeadSummarySchema = z.object({
  myClubId: z.string(),
  opponentClubId: z.string(),
  myClubName: z.string(),
  opponentClubName: z.string(),
  wins: z.number().int(),
  draws: z.number().int(),
  losses: z.number().int(),
  goalsFor: z.number().int(),
  goalsAgainst: z.number().int(),
});

export type HeadToHeadSummary = z.infer<typeof headToHeadSummarySchema>;

// ─── History Item ─────────────────────────────────────────────────────────────

export const headToHeadHistoryItemSchema = z.object({
  matchId: z.string(),
  date: z.string(),
  myScore: z.number().int(),
  opponentScore: z.number().int(),
  result: headToHeadResultSchema,
});

export type HeadToHeadHistoryItem = z.infer<typeof headToHeadHistoryItemSchema>;

// ─── Page Response ────────────────────────────────────────────────────────────

export const headToHeadPageSchema = z.object({
  summary: headToHeadSummarySchema,
  history: z.array(headToHeadHistoryItemSchema),
  nextCursor: z.string().nullable(),
  hasNextPage: z.boolean(),
});

export type HeadToHeadPage = z.infer<typeof headToHeadPageSchema>;

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface GetHeadToHeadParams {
  cursor?: string;
  limit?: number;
}
