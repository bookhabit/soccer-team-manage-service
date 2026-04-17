import { http } from '@/src/shared/http/apiClient';
import { headToHeadPageSchema } from '../schemas/headToHead.schema';
import type { HeadToHeadPage, GetHeadToHeadParams } from '../schemas/headToHead.schema';

/**
 * 두 클럽 간 상대 전적 한 페이지를 조회한다 (커서 기반 페이지네이션).
 * @param clubId 내 클럽 ID
 * @param opponentClubId 상대 클럽 ID
 * @param params cursor?, limit?
 */
export const headToHeadService = {
  getPage: async (
    clubId: string,
    opponentClubId: string,
    params?: GetHeadToHeadParams,
  ): Promise<HeadToHeadPage> => {
    return http.get<HeadToHeadPage>(
      `/clubs/${clubId}/head-to-head/${opponentClubId}`,
      params,
      headToHeadPageSchema,
    );
  },
};
