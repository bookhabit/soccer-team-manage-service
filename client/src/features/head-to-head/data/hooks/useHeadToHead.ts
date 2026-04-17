import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { headToHeadService } from '../services/headToHead.service';
import type { HeadToHeadHistoryItem, HeadToHeadSummary } from '../schemas/headToHead.schema';

const H2H_QUERY_KEYS = {
  detail: (clubId: string, opponentClubId: string) =>
    ['head-to-head', clubId, opponentClubId] as const,
};

interface UseHeadToHeadResult {
  summary: HeadToHeadSummary;
  history: HeadToHeadHistoryItem[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

/**
 * 두 클럽 간 상대 전적을 무한 스크롤로 조회한다.
 * - summary는 첫 페이지에서 고정 (cursor 갱신 시 변경 없음)
 * - history는 모든 페이지 누적
 */
export function useHeadToHead(clubId: string, opponentClubId: string): UseHeadToHeadResult {
  const query = useSuspenseInfiniteQuery({
    queryKey: H2H_QUERY_KEYS.detail(clubId, opponentClubId),
    queryFn: ({ pageParam }) =>
      headToHeadService.getPage(clubId, opponentClubId, {
        cursor: pageParam as string | undefined,
        limit: 10,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const firstPage = query.data.pages[0];
  const history: HeadToHeadHistoryItem[] = query.data.pages.flatMap((p) => p.history);

  return {
    summary: firstPage.summary,
    history,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}

export { H2H_QUERY_KEYS };
