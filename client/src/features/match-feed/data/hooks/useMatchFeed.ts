import {
  useInfiniteQuery,
  keepPreviousData,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { matchFeedService } from '../services/matchFeed.service';
import { matchFeedQueryKeys } from './matchFeedQueryKeys';
import type { MatchFeedFilter } from '../schemas/matchFeed.schema';

const DEFAULT_PAGE_SIZE = 20;

/**
 * 피드 무한 스크롤 훅.
 * useSuspenseInfiniteQuery 사용, getNextPageParam은 nextCursor 기반.
 * queryKey: matchFeedQueryKeys.list(filter)
 */
export function useMatchFeed(filter: MatchFeedFilter = {}) {
  return useInfiniteQuery({
    queryKey: matchFeedQueryKeys.list(filter),
    queryFn: ({ pageParam }) =>
      matchFeedService.getFeedPage({
        ...filter,
        cursor: pageParam as string | undefined,
        limit: DEFAULT_PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  });
}

/**
 * 경기 상세 데이터 훅.
 * useSuspenseQuery 사용.
 * queryKey: matchFeedQueryKeys.detail(matchId)
 */
export function useMatchFeedDetail(matchId: string) {
  return useSuspenseQuery({
    queryKey: matchFeedQueryKeys.detail(matchId),
    queryFn: () => matchFeedService.getDetail(matchId),
  });
}
