import React from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useMyProfile, useLogout } from '../../data/hooks/useAuth';
import { ProfileView } from '../view/ProfileView';
import type { StatItem } from '../components/StatSummary';
import { LEVEL_LABEL, FOOT_LABEL } from '@/src/shared/constants/player.constants';

/**
 * 프로필 화면 데이터 주입 및 네비게이션 핸들러를 조립하는 Container.
 */
export function ProfileContainer() {
  const { data: profile, isLoading } = useMyProfile();
  const { mutate: logout } = useLogout();

  const stats: StatItem[] = [
    { label: '경력', value: profile?.years != null ? `${profile.years}년` : '-' },
    { label: '실력', value: profile?.level ? (LEVEL_LABEL[profile.level] ?? '-') : '-' },
    { label: '주 발', value: profile?.foot ? (FOOT_LABEL[profile.foot] ?? '-') : '-' },
  ];

  return (
    <ProfileView
      profile={profile}
      isLoading={isLoading}
      stats={stats}
      onEditPress={() => router.push('/(app)/profile/edit' as Href)}
      onMannerPress={() => router.push('/(app)/profile/manner' as Href)}
      onSettingsPress={() => router.push('/(app)/profile/settings' as Href)}
      onLogout={() => logout()}
    />
  );
}
