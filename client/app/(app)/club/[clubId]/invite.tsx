import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { InviteCodeContainer } from '@/src/features/club/ui/container/InviteCodeContainer';

export default function InviteScreen() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  return <InviteCodeContainer clubId={clubId} />;
}
