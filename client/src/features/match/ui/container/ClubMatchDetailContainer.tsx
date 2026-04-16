import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton, ScreenLayout, Spacing, useToast, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMyClub } from '@/src/features/club/data/hooks/useClub';
import { useMyProfile } from '@/src/features/auth/data/hooks/useAuth';
import {
  useMatchDetail,
  useAttendances,
  useMomResult,
  useSubmitMomVote,
  useMatchComments,
  useCreateComment,
  useDeleteComment,
  useRegisterVideo,
  useDeleteVideo,
  useSubmitOpponentRating,
} from '../../data/hooks/useMatch';
import { ClubMatchDetailView } from '../view/ClubMatchDetailView';
import type { Goal, MatchVideo } from '../../data/schemas/match.schema';
import type { SubmitOpponentRatingInput } from '../../data/schemas/match.schema';

interface ClubMatchDetailContainerProps {
  matchId: string;
}

function ClubMatchDetailSkeleton() {
  return (
    <ScreenLayout>
      <View style={styles.skeleton}>
        <Skeleton width="60%" height={28} />
        <Spacing size={2} />
        <Skeleton width="40%" height={20} />
        <Spacing size={4} />
        <Skeleton width="100%" height={48} borderRadius={8} />
        <Spacing size={3} />
        <Skeleton width="100%" height={160} borderRadius={12} />
      </View>
    </ScreenLayout>
  );
}

function ClubMatchDetailContent({ matchId }: ClubMatchDetailContainerProps) {
  const [selectedMomUserId, setSelectedMomUserId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingReview, setRatingReview] = useState('');
  const [ratingMvpName, setRatingMvpName] = useState('');
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);

  const { toast } = useToast();
  const { data: club } = useMyClub();
  const { data: profile } = useMyProfile();
  const clubId = club?.id ?? '';
  const myUserId = profile?.id ?? '';

  const { data: match } = useMatchDetail(clubId, matchId);
  const { data: attendances } = useAttendances(clubId, matchId);
  const { data: momResult } = useMomResult(clubId, matchId);
  const { data: commentsData } = useMatchComments(clubId, matchId);

  const { mutate: submitMomVote, isPending: isSubmittingMom } = useSubmitMomVote(clubId, matchId);
  const { mutate: createComment, isPending: isSubmittingComment } = useCreateComment(clubId, matchId);
  const { mutate: deleteComment } = useDeleteComment(clubId, matchId);
  const { mutate: registerVideo, isPending: isSubmittingVideo } = useRegisterVideo(clubId, matchId);
  const { mutate: deleteVideo } = useDeleteVideo(clubId, matchId);
  const { mutate: submitOpponentRating, isPending: isSubmittingRating } = useSubmitOpponentRating(
    clubId,
    matchId,
  );

  const comments = commentsData.pages.flatMap((p) => p.items);
  const videos: MatchVideo[] = (match as any).videos ?? [];
  const goals: Goal[] = (match as any).goals ?? [];

  const participantNames = attendances.reduce<Record<string, string>>((acc, a) => {
    if (a.user.name) acc[a.userId] = a.user.name;
    return acc;
  }, {});

  const hasVotedMom = momResult?.winners.some((w) => w.userId === myUserId) ?? false;
  const isMomDeadlinePassed = new Date(match.startAt).setHours(23, 59, 59, 999) < Date.now();

  const handleSubmitMom = () => {
    if (!selectedMomUserId) return;
    submitMomVote(selectedMomUserId, {
      onSuccess: () => {
        toast.success('MOM 투표가 완료되었습니다.');
        setSelectedMomUserId(null);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.code;
        if (code === 'MATCH_006') {
          toast.warning('이미 투표하셨습니다.');
        } else if (code === 'MATCH_005') {
          toast.warning('투표가 마감되었습니다.');
        } else {
          toast.error('MOM 투표에 실패했습니다.');
        }
      },
    });
  };

  const handleSubmitComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    createComment(
      { content: trimmed },
      {
        onSuccess: () => setCommentInput(''),
        onError: () => toast.error('댓글 등록에 실패했습니다.'),
      },
    );
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId, {
      onError: () => toast.error('댓글 삭제에 실패했습니다.'),
    });
  };

  const handleRegisterVideo = () => {
    const url = videoUrlInput.trim();
    if (!url) return;
    registerVideo(url, {
      onSuccess: () => {
        toast.success('영상이 등록되었습니다.');
        setVideoUrlInput('');
      },
      onError: () => toast.error('영상 등록에 실패했습니다.'),
    });
  };

  const handleDeleteVideo = (videoId: string) => {
    deleteVideo(videoId, {
      onError: () => toast.error('영상 삭제에 실패했습니다.'),
    });
  };

  const handleSubmitRating = (dto: SubmitOpponentRatingInput) => {
    submitOpponentRating(dto, {
      onSuccess: () => {
        toast.success('상대팀 평가가 등록되었습니다.');
        setHasSubmittedRating(true);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.code;
        if (code === 'MATCH_008') {
          toast.warning('이미 평가를 제출하셨습니다.');
        } else {
          toast.error('평가 제출에 실패했습니다.');
        }
      },
    });
  };

  return (
    <ClubMatchDetailView
      match={match}
      goals={goals}
      momResult={momResult}
      comments={comments}
      videos={videos}
      participants={attendances}
      myUserId={myUserId}
      hasVotedMom={hasVotedMom}
      isMomDeadlinePassed={isMomDeadlinePassed}
      selectedMomUserId={selectedMomUserId}
      commentInput={commentInput}
      videoUrlInput={videoUrlInput}
      ratingScore={ratingScore}
      ratingReview={ratingReview}
      ratingMvpName={ratingMvpName}
      isSubmittingMom={isSubmittingMom}
      isSubmittingComment={isSubmittingComment}
      isSubmittingVideo={isSubmittingVideo}
      isSubmittingRating={isSubmittingRating}
      hasSubmittedRating={hasSubmittedRating}
      participantNames={participantNames}
      onMomSelect={setSelectedMomUserId}
      onSubmitMom={handleSubmitMom}
      onCommentChange={setCommentInput}
      onSubmitComment={handleSubmitComment}
      onDeleteComment={handleDeleteComment}
      onVideoUrlChange={setVideoUrlInput}
      onRegisterVideo={handleRegisterVideo}
      onDeleteVideo={handleDeleteVideo}
      onRatingScoreChange={setRatingScore}
      onRatingReviewChange={setRatingReview}
      onRatingMvpNameChange={setRatingMvpName}
      onSubmitRating={handleSubmitRating}
    />
  );
}

export function ClubMatchDetailContainer({ matchId }: ClubMatchDetailContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<ClubMatchDetailSkeleton />}>
      <ClubMatchDetailContent matchId={matchId} />
    </AsyncBoundary>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    padding: spacing[4],
  },
});
