import React from 'react';
import { useMyProfile } from '@/src/features/auth/data/hooks/useAuth';
import { MannerDetailView } from '@/src/features/auth/ui/view/MannerDetailView';

export default function MannerScreen() {
  const { data: profile, isLoading } = useMyProfile();
  return <MannerDetailView profile={profile} isLoading={isLoading} />;
}
