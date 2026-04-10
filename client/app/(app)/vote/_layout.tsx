import { Stack } from 'expo-router';

/**
 * 경기 투표 기능 Stack 내비게이터.
 */
export default function VoteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="create"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="[matchId]" />
    </Stack>
  );
}
