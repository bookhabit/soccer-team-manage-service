import type { MatchPostFilters } from '../schemas/matchPost.schema';

export const matchQueryKeys = {
  lists: (filters?: MatchPostFilters) => ['match-posts', 'list', filters ?? {}] as const,
  my: () => ['match-posts', 'my'] as const,
  detail: (id: string) => ['match-posts', id] as const,
  applications: (postId: string) => ['match-posts', postId, 'applications'] as const,
  myApplications: () => ['match-posts', 'my-applications'] as const,
  contact: (id: string) => ['match-posts', id, 'contact'] as const,
} as const;
