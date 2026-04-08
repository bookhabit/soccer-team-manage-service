import { Stack } from 'expo-router';

/**
 * 클럽 기능 전체 Stack 내비게이터.
 * - create, invite-enter: modal presentation
 * - 그 외: 기본 push
 */
export default function ClubLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="create"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="search" />
      <Stack.Screen
        name="invite-enter"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="[clubId]" />
    </Stack>
  );
}
