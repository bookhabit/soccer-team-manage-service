import React from 'react';
import { Stack } from 'expo-router';
import { VoteListContainer } from '@/src/features/match/ui/container';

export default function ClubVoteScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '경기 투표' }} />
      <VoteListContainer />
    </>
  );
}
