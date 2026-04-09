import React from 'react';
import { useMyProfile } from '../../data/hooks/useAuth';
import { MannerDetailView } from '../view/MannerDetailView';

/**
 * 매너 온도 상세 Container.
 * useMyProfile uses enabled: !!accessToken → Suspense 불가 예외 케이스 (api.md 4.4)
 */
export function MannerDetailContainer() {
  const { data: profile, isLoading } = useMyProfile();
  return <MannerDetailView profile={profile} isLoading={isLoading} />;
}
