import { Stack } from 'expo-router';

/**
 * 클럽 ID 기반 Stack 내비게이터.
 * board/write는 modal로 표시.
 */
export default function ClubIdLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="join" />
      <Stack.Screen name="join-requests" />
      <Stack.Screen name="members/index" />
      <Stack.Screen name="members/[memberId]" />
      <Stack.Screen name="board/index" />
      <Stack.Screen name="board/[postId]" />
      <Stack.Screen
        name="board/write"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="invite" />
      <Stack.Screen name="settings/index" />
      <Stack.Screen name="settings/dissolve" />
      <Stack.Screen name="transfer-captain" />
      <Stack.Screen name="matches/index" />
      <Stack.Screen name="vote" />
    </Stack>
  );
}
