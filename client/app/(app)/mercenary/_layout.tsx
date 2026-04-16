import { Stack } from 'expo-router';

export default function MercenaryLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: '용병', headerShown: false }} />
      <Stack.Screen name="post/create" options={{ title: '용병 구함 등록', presentation: 'modal' }} />
      <Stack.Screen name="post/[id]" options={{ title: '용병 구함' }} />
      <Stack.Screen name="post/[id]/edit" options={{ title: '용병 구함 수정', presentation: 'modal' }} />
      <Stack.Screen name="post/[id]/applications" options={{ title: '지원자 관리' }} />
      <Stack.Screen name="availability/create" options={{ title: '용병 가능 등록', presentation: 'modal' }} />
      <Stack.Screen name="availability/[id]" options={{ title: '용병 가능' }} />
      <Stack.Screen name="availability/[id]/edit" options={{ title: '용병 가능 수정', presentation: 'modal' }} />
      <Stack.Screen name="my-recruitments" options={{ title: '영입 신청 목록' }} />
    </Stack>
  );
}
