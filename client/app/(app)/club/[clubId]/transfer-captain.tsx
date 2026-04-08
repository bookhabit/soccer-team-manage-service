import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { TransferCaptainContainer } from '@/src/features/club/ui/container/TransferCaptainContainer';

export default function TransferCaptainScreen() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  return <TransferCaptainContainer clubId={clubId} />;
}
