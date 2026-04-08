import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PostWriteContainer } from '@/src/features/club/ui/container/PostWriteContainer';

export default function PostWriteScreen() {
  const { clubId, postId } = useLocalSearchParams<{ clubId: string; postId?: string }>();
  return <PostWriteContainer clubId={clubId} postId={postId} />;
}
