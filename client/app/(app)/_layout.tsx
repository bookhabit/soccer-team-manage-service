import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/src/shared/store';
import { useMyProfile } from '@/src/features/auth/data/hooks/useAuth';

/**
 * 인증된 사용자만 접근 가능한 Protected 레이아웃.
 * - 탭 그룹 `(tabs)` 이 기본 화면
 * - 클럽·프로필 서브 페이지는 탭바 위 Stack으로 push
 */
export default function AppLayout() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile, isLoading } = useMyProfile();

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isLoading && profile && !profile.isOnboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 바텀탭 그룹 */}
      <Stack.Screen name="(tabs)" />

      {/* 프로필 서브 페이지 (탭바 위로 push) */}
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/manner" />
      <Stack.Screen name="profile/settings" />
      <Stack.Screen name="profile/withdraw" />

      {/* 클럽 서브 페이지 (탭바 위로 push) */}
      <Stack.Screen name="club" />
    </Stack>
  );
}
