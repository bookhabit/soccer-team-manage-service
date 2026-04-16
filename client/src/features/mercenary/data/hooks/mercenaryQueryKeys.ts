import type { MercenaryPostFilters } from '../schemas/mercenaryPost.schema';
import type { MercenaryAvailabilityFilters } from '../schemas/mercenaryAvailability.schema';

export const mercenaryQueryKeys = {
  postLists: (filters?: MercenaryPostFilters) =>
    ['mercenary-posts', 'list', filters ?? {}] as const,
  myPosts: () => ['mercenary-posts', 'my'] as const,
  postDetail: (id: string) => ['mercenary-posts', id] as const,
  applications: (postId: string) => ['mercenary-posts', postId, 'applications'] as const,

  availabilityLists: (filters?: MercenaryAvailabilityFilters) =>
    ['mercenary-availabilities', 'list', filters ?? {}] as const,
  myAvailabilities: () => ['mercenary-availabilities', 'my'] as const,
  availabilityDetail: (id: string) => ['mercenary-availabilities', id] as const,
  myRecruitments: () => ['mercenary-availabilities', 'my-recruitments'] as const,
};
