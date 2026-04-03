import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/src/shared/store';

/**
 * 인증된 사용자만 접근 가능한 Protected 레이아웃.
 * accessToken이 없으면 로그인 화면으로 리다이렉트합니다.
 */
export default function AppLayout() {
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
