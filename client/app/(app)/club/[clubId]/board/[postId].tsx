import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PostDetailContainer } from '@/src/features/club/ui/container/PostDetailContainer';

export default function PostDetailScreen() {
  const { clubId, postId } = useLocalSearchParams<{ clubId: string; postId: string }>();
  return <PostDetailContainer clubId={clubId} postId={postId} />;
}
