import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/src/shared/store';
import { useMyProfile } from '@/src/features/auth/data/hooks/useAuth';

/**
 * 인증된 사용자만 접근 가능한 Protected 레이아웃.
 * accessToken이 없으면 로그인 화면으로, 온보딩 미완료 시 온보딩으로 리다이렉트합니다.
 */
export default function AppLayout() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile, isLoading } = useMyProfile();

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  // 프로필 로드 완료 후 온보딩 미완료 체크
  if (!isLoading && profile && !profile.isOnboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile/index" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/manner" />
      <Stack.Screen name="profile/withdraw" />
      <Stack.Screen name="profile/settings" />
    </Stack>
  );
}
