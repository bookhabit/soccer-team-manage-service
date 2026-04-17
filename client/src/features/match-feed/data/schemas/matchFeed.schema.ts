import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const MatchTypeSchema = z.enum(['LEAGUE', 'SELF']);
export type MatchType = z.infer<typeof MatchTypeSchema>;

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

export const matchGoalItemSchema = z.object({
  scorerUserId: z.string(),
  scorerUserName: z.string(),
  assistUserId: z.string().nullable(),
  assistUserName: z.string().nullable(),
  quarterNumber: z.number().int().nullable(),
  team: z.string().nullable(),
});

export const momItemSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  voteCount: z.number().int(),
});

// ─── Feed Item ────────────────────────────────────────────────────────────────

export const matchFeedItemSchema = z.object({
  id: z.string(),
  type: MatchTypeSchema,
  clubId: z.string(),
  clubName: z.string(),
  clubLogoUrl: z.string().nullable(),
  homeScore: z.number().int(),
  awayScore: z.number().int(),
  opponentName: z.string().nullable(),
  momUserName: z.string().nullable(),
  momUserId: z.string().nullable(),
  province: z.string(),
  district: z.string(),
  location: z.string(),
  startAt: z.string(),
});

// ─── Feed Page ────────────────────────────────────────────────────────────────

export const matchFeedPageSchema = z.object({
  items: z.array(matchFeedItemSchema),
  nextCursor: z.string().nullable(),
});

// ─── Detail ───────────────────────────────────────────────────────────────────

export const matchFeedDetailSchema = z.object({
  id: z.string(),
  type: MatchTypeSchema,
  clubId: z.string(),
  clubName: z.string(),
  clubLogoUrl: z.string().nullable(),
  homeScore: z.number().int(),
  awayScore: z.number().int(),
  opponentName: z.string().nullable(),
  opponentClubId: z.string().nullable(),
  goals: z.array(matchGoalItemSchema),
  momList: z.array(momItemSchema),
  participantCount: z.number().int(),
  province: z.string(),
  district: z.string(),
  location: z.string(),
  startAt: z.string(),
});

// ─── Filter ───────────────────────────────────────────────────────────────────

export const matchFeedFilterSchema = z.object({
  province: z.string().optional(),
  district: z.string().optional(),
  type: MatchTypeSchema.optional(),
  myClub: z.boolean().optional(),
  myMatches: z.boolean().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type MatchGoalItem = z.infer<typeof matchGoalItemSchema>;
export type MomItem = z.infer<typeof momItemSchema>;
export type MatchFeedItem = z.infer<typeof matchFeedItemSchema>;
export type MatchFeedPage = z.infer<typeof matchFeedPageSchema>;
export type MatchFeedDetail = z.infer<typeof matchFeedDetailSchema>;
export type MatchFeedFilter = z.infer<typeof matchFeedFilterSchema>;
