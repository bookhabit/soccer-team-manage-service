import type { MatchFeedFilter } from '../schemas/matchFeed.schema';

export const matchFeedQueryKeys = {
  all: ['match-feed'] as const,
  list: (filter: MatchFeedFilter) =>
    [...matchFeedQueryKeys.all, 'list', filter] as const,
  detail: (matchId: string) =>
    [...matchFeedQueryKeys.all, 'detail', matchId] as const,
};
