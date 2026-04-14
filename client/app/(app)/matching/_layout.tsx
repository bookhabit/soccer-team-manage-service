import { Stack } from 'expo-router';

/**
 * 매칭 기능 Stack 내비게이터.
 */
export default function MatchingLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="create"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
