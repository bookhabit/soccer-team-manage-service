import React from 'react';
import { router } from 'expo-router';
import { useMyProfile, useLogout } from '../../data/hooks/useAuth';
import { ProfileView } from '../view/ProfileView';

export function ProfileContainer() {
  const { data: profile, isLoading } = useMyProfile();
  const { mutate: logout } = useLogout();

  return (
    <ProfileView
      profile={profile}
      isLoading={isLoading}
      onEditPress={() => router.push('/(app)/profile/edit' as any)}
      onMannerPress={() => router.push('/(app)/profile/manner' as any)}
      onSettingsPress={() => router.push('/(app)/profile/settings' as any)}
      onLogout={() => logout()}
    />
  );
}
