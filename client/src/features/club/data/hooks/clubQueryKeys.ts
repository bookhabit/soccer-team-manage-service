import type { PostType } from '../schemas/post.schema';

export const clubQueryKeys = {
  myClub: ['club', 'my'] as const,
  detail: (id: string) => ['club', id] as const,
  members: (id: string) => ['club', id, 'members'] as const,
  member: (clubId: string, userId: string) => ['club', clubId, 'members', userId] as const,
  joinRequests: (id: string) => ['club', id, 'join-requests'] as const,
  inviteCode: (id: string) => ['club', id, 'invite-code'] as const,
  dissolveVote: (id: string) => ['club', id, 'dissolve-vote'] as const,
  posts: (id: string, type?: PostType) => ['club', id, 'posts', type ?? 'ALL'] as const,
  post: (clubId: string, postId: string) => ['club', clubId, 'posts', postId] as const,
  comments: (clubId: string, postId: string) =>
    ['club', clubId, 'posts', postId, 'comments'] as const,
  search: (params: object) => ['club', 'search', params] as const,
  recommended: ['club', 'recommended'] as const,
} as const;
