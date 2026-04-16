import { http } from '@/src/shared/http/apiClient';
import {
  matchFeedPageSchema,
  matchFeedDetailSchema,
} from '../schemas/matchFeed.schema';
import type {
  MatchFeedPage,
  MatchFeedDetail,
  MatchFeedFilter,
} from '../schemas/matchFeed.schema';

// ─── 파라미터 타입 ────────────────────────────────────────────────────────────

export interface GetFeedPageParams extends MatchFeedFilter {
  cursor?: string;
  limit?: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const matchFeedService = {
  /**
   * 피드 목록 한 페이지를 조회한다 (커서 기반 페이지네이션).
   * @param params cursor?, limit?, 필터 조건
   * @returns matchFeedPageSchema 파싱 결과
   */
  getFeedPage: async (params: GetFeedPageParams): Promise<MatchFeedPage> => {
    // boolean 파라미터를 axios params로 전달할 때 문자열로 직렬화
    const query: Record<string, unknown> = { ...params };
    if (typeof params.myClub === 'boolean') {
      query.myClub = String(params.myClub);
    }
    if (typeof params.myMatches === 'boolean') {
      query.myMatches = String(params.myMatches);
    }
    return http.get<MatchFeedPage>('/match-feed', query, matchFeedPageSchema);
  },

  /**
   * 단일 경기 공개 결과 상세를 조회한다.
   * @param matchId 경기 ID
   * @returns matchFeedDetailSchema 파싱 결과
   */
  getDetail: async (matchId: string): Promise<MatchFeedDetail> => {
    return http.get<MatchFeedDetail>(
      `/match-feed/${matchId}`,
      undefined,
      matchFeedDetailSchema,
    );
  },
};
