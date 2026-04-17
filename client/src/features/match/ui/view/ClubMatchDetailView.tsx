import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabView, TabBar } from 'react-native-tab-view';
import { TextBox, Button, AvatarImage, ScreenLayout, Spacing, EmptyState, colors, spacing } from '@ui';
import { getAvatarUrl } from '@/src/shared/utils/imageUrl';
import { GoalTimeline } from '../components/GoalTimeline';
import { MomVoteList } from '../components/MomVoteList';
import { OpponentRatingForm } from '../components/OpponentRatingForm';
import type {
  MatchDetail,
  Goal,
  MomResult,
  MatchComment,
  MatchVideo,
  Attendance,
} from '../../data/schemas/match.schema';
import type { SubmitOpponentRatingInput } from '../../data/schemas/match.schema';

const ALL_ROUTES = [
  { key: 'record', title: '기록' },
  { key: 'comments', title: '댓글' },
  { key: 'videos', title: '영상' },
  { key: 'rating', title: '상대팀 평가' },
];

interface ClubMatchDetailViewProps {
  match: MatchDetail;
  goals: Goal[];
  momResult: MomResult | null;
  comments: MatchComment[];
  videos: MatchVideo[];
  participants: Attendance[];
  myUserId: string;
  hasVotedMom: boolean;
  isMomDeadlinePassed: boolean;
  selectedMomUserId: string | null;
  commentInput: string;
  videoUrlInput: string;
  ratingScore: number;
  ratingReview: string;
  ratingMvpName: string;
  isSubmittingMom: boolean;
  isSubmittingComment: boolean;
  isSubmittingVideo: boolean;
  isSubmittingRating: boolean;
  hasSubmittedRating: boolean;
  participantNames: Record<string, string>;
  onMomSelect: (userId: string) => void;
  onSubmitMom: () => void;
  onCommentChange: (text: string) => void;
  onSubmitComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onVideoUrlChange: (url: string) => void;
  onRegisterVideo: () => void;
  onDeleteVideo: (videoId: string) => void;
  onRatingScoreChange: (score: number) => void;
  onRatingReviewChange: (text: string) => void;
  onRatingMvpNameChange: (name: string) => void;
  onSubmitRating: (dto: SubmitOpponentRatingInput) => void;
}

export function ClubMatchDetailView({
  match,
  goals,
  momResult,
  comments,
  videos,
  participants,
  myUserId,
  hasVotedMom,
  isMomDeadlinePassed,
  selectedMomUserId,
  commentInput,
  videoUrlInput,
  ratingScore,
  ratingReview,
  ratingMvpName,
  isSubmittingMom,
  isSubmittingComment,
  isSubmittingVideo,
  isSubmittingRating,
  hasSubmittedRating,
  participantNames,
  onMomSelect,
  onSubmitMom,
  onCommentChange,
  onSubmitComment,
  onDeleteComment,
  onVideoUrlChange,
  onRegisterVideo,
  onDeleteVideo,
  onRatingScoreChange,
  onRatingReviewChange,
  onRatingMvpNameChange,
  onSubmitRating,
}: ClubMatchDetailViewProps) {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const routes = match.type === 'LEAGUE' ? ALL_ROUTES : ALL_ROUTES.slice(0, 3);

  const startDate = new Date(match.startAt);
  const dateLabel = startDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'record':
        return (
          <RecordTab
            match={match}
            goals={goals}
            momResult={momResult}
            participants={participants}
            myUserId={myUserId}
            hasVotedMom={hasVotedMom}
            isMomDeadlinePassed={isMomDeadlinePassed}
            selectedMomUserId={selectedMomUserId}
            isSubmittingMom={isSubmittingMom}
            participantNames={participantNames}
            onMomSelect={onMomSelect}
            onSubmitMom={onSubmitMom}
          />
        );
      case 'comments':
        return (
          <CommentsTab
            comments={comments}
            myUserId={myUserId}
            commentInput={commentInput}
            isSubmittingComment={isSubmittingComment}
            onCommentChange={onCommentChange}
            onSubmitComment={onSubmitComment}
            onDeleteComment={onDeleteComment}
          />
        );
      case 'videos':
        return (
          <VideosTab
            videos={videos}
            videoUrlInput={videoUrlInput}
            isSubmittingVideo={isSubmittingVideo}
            onVideoUrlChange={onVideoUrlChange}
            onRegisterVideo={onRegisterVideo}
            onDeleteVideo={onDeleteVideo}
          />
        );
      case 'rating':
        return (
          <RatingTab
            match={match}
            score={ratingScore}
            review={ratingReview}
            mvpName={ratingMvpName}
            isSubmitting={isSubmittingRating}
            hasSubmitted={hasSubmittedRating}
            onScoreChange={onRatingScoreChange}
            onReviewChange={onRatingReviewChange}
            onMvpNameChange={onRatingMvpNameChange}
            onSubmit={onSubmitRating}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScreenLayout>
      {/* 경기 헤더 */}
      <View style={styles.matchHeader}>
        <TextBox variant="heading3" color={colors.grey900}>
          {match.title}
        </TextBox>
        {match.opponentName ? (
          <TextBox variant="body2" color={colors.grey700}>
            vs {match.opponentName}
          </TextBox>
        ) : null}
        <TextBox variant="caption" color={colors.grey500}>
          {dateLabel}
        </TextBox>
        {match.isRecordSubmitted ? (
          <TextBox variant="heading2" color={colors.grey900} style={styles.score}>
            {match.homeScore} : {match.awayScore}
          </TextBox>
        ) : (
          <TextBox variant="body2" color={colors.grey400}>
            경기 기록 미등록
          </TextBox>
        )}
      </View>

      <TabView
        style={{ flex: 1 }}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{
              backgroundColor: colors.background,
              borderBottomWidth: 1,
              borderBottomColor: colors.grey100,
              elevation: 0,
              shadowOpacity: 0,
            }}
            indicatorStyle={{ backgroundColor: colors.blue500, height: 2 }}
            activeColor={colors.blue500}
            inactiveColor={colors.grey500}
            tabStyle={{ flex: 1, paddingVertical: spacing[1], paddingHorizontal: 0 }}
            pressColor={colors.blue50}
            scrollEnabled={false}
          />
        )}
      />
    </ScreenLayout>
  );
}

// ─── 탭 서브컴포넌트 ──────────────────────────────────────────────────────────

function RecordTab({
  match,
  goals,
  momResult,
  participants,
  myUserId,
  hasVotedMom,
  isMomDeadlinePassed,
  selectedMomUserId,
  isSubmittingMom,
  participantNames,
  onMomSelect,
  onSubmitMom,
}: {
  match: MatchDetail;
  goals: Goal[];
  momResult: MomResult | null;
  participants: Attendance[];
  myUserId: string;
  hasVotedMom: boolean;
  isMomDeadlinePassed: boolean;
  selectedMomUserId: string | null;
  isSubmittingMom: boolean;
  participantNames: Record<string, string>;
  onMomSelect: (userId: string) => void;
  onSubmitMom: () => void;
}) {
  const canVoteMom = match.isRecordSubmitted && !hasVotedMom && !isMomDeadlinePassed;

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <TextBox variant="body2Bold" color={colors.grey900}>
        득점 기록
      </TextBox>
      <Spacing size={2} />
      <GoalTimeline goals={goals} participantNames={participantNames} />

      <View style={styles.divider} />

      {momResult ? (
        <>
          <TextBox variant="body2Bold" color={colors.grey900}>
            MOM
          </TextBox>
          <Spacing size={2} />
          {momResult.winners.map((w) => (
            <View key={w.userId} style={styles.momWinner}>
              <TextBox variant="body2" color={colors.grey900}>
                ⭐ {w.name}
              </TextBox>
              <TextBox variant="caption" color={colors.grey500}>
                {w.votes}표
              </TextBox>
            </View>
          ))}
          <Spacing size={2} />
          <TextBox variant="caption" color={colors.grey500}>
            총 {momResult.totalVoters}명 투표
          </TextBox>
          <View style={styles.divider} />
        </>
      ) : null}

      {canVoteMom ? (
        <>
          <TextBox variant="body2Bold" color={colors.grey900}>
            MOM 투표
          </TextBox>
          <Spacing size={2} />
          <MomVoteList
            participants={participants}
            selectedUserId={selectedMomUserId}
            myUserId={myUserId}
            hasVoted={hasVotedMom}
            isDeadlinePassed={isMomDeadlinePassed}
            onSelect={onMomSelect}
          />
          {selectedMomUserId ? (
            <>
              <Spacing size={3} />
              <Button variant="primary" onPress={onSubmitMom} loading={isSubmittingMom}>
                MOM 투표하기
              </Button>
            </>
          ) : null}
          <View style={styles.divider} />
        </>
      ) : match.isRecordSubmitted && hasVotedMom ? (
        <TextBox variant="caption" color={colors.grey400}>
          이미 MOM 투표를 완료했습니다.
        </TextBox>
      ) : match.isRecordSubmitted && isMomDeadlinePassed ? (
        <TextBox variant="caption" color={colors.grey400}>
          MOM 투표가 마감되었습니다.
        </TextBox>
      ) : null}

      <Spacing size={10} />
    </ScrollView>
  );
}

function CommentsTab({
  comments,
  myUserId,
  commentInput,
  isSubmittingComment,
  onCommentChange,
  onSubmitComment,
  onDeleteComment,
}: {
  comments: MatchComment[];
  myUserId: string;
  commentInput: string;
  isSubmittingComment: boolean;
  onCommentChange: (text: string) => void;
  onSubmitComment: () => void;
  onDeleteComment: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.commentsContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : keyboardVisible ? 200 : 0}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tabContent}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <AvatarImage
              source={{ uri: getAvatarUrl(item.author.avatarUrl) }}
              size={32}
            />
            <View style={styles.commentContent}>
              <View style={styles.commentHeader}>
                <TextBox variant="captionBold" color={colors.grey900}>
                  {item.author.name ?? '선수'}
                </TextBox>
                <TextBox variant="caption" color={colors.grey400}>
                  {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                </TextBox>
              </View>
              <TextBox variant="body2" color={colors.grey800}>
                {item.content}
              </TextBox>
            </View>
            {item.authorId === myUserId ? (
              <TouchableOpacity onPress={() => onDeleteComment(item.id)}>
                <TextBox variant="caption" color={colors.error}>
                  삭제
                </TextBox>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <TextBox variant="body2" color={colors.grey400}>
            첫 댓글을 남겨보세요.
          </TextBox>
        }
      />
      <View style={[styles.commentInputBar, { paddingBottom: insets.bottom || spacing[3] }]}>
        <TextInput
          style={styles.commentInput}
          placeholder="댓글을 입력하세요..."
          placeholderTextColor={colors.grey400}
          value={commentInput}
          onChangeText={onCommentChange}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!commentInput.trim() || isSubmittingComment) && styles.sendBtnDisabled,
          ]}
          onPress={onSubmitComment}
          disabled={isSubmittingComment || !commentInput.trim()}
        >
          <TextBox
            variant="body2Bold"
            color={!commentInput.trim() || isSubmittingComment ? colors.grey400 : colors.blue500}
          >
            등록
          </TextBox>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function VideosTab({
  videos,
  videoUrlInput,
  isSubmittingVideo,
  onVideoUrlChange,
  onRegisterVideo,
  onDeleteVideo,
}: {
  videos: MatchVideo[];
  videoUrlInput: string;
  isSubmittingVideo: boolean;
  onVideoUrlChange: (url: string) => void;
  onRegisterVideo: () => void;
  onDeleteVideo: (id: string) => void;
}) {
  const hasVideos = videos.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.videoInputRow}>
        <TextInput
          style={styles.videoInput}
          placeholder="YouTube URL을 입력하세요"
          placeholderTextColor={colors.grey400}
          value={videoUrlInput}
          onChangeText={onVideoUrlChange}
        />
        <Button variant="primary" onPress={onRegisterVideo} loading={isSubmittingVideo}>
          등록
        </Button>
      </View>
      <Spacing size={4} />

      {!hasVideos ? (
        <EmptyState message="등록된 영상이 없습니다." />
      ) : (
        videos.map((v) => (
          <View key={v.id} style={styles.videoItem}>
            <TextBox
              variant="body2"
              color={colors.blue500}
              numberOfLines={1}
              style={styles.videoUrl}
            >
              {v.youtubeUrl}
            </TextBox>
            <TouchableOpacity onPress={() => onDeleteVideo(v.id)}>
              <TextBox variant="caption" color={colors.error}>
                삭제
              </TextBox>
            </TouchableOpacity>
          </View>
        ))
      )}
      <Spacing size={10} />
    </ScrollView>
  );
}

function RatingTab({
  match,
  score,
  review,
  mvpName,
  isSubmitting,
  hasSubmitted,
  onScoreChange,
  onReviewChange,
  onMvpNameChange,
  onSubmit,
}: {
  match: MatchDetail;
  score: number;
  review: string;
  mvpName: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  onScoreChange: (s: number) => void;
  onReviewChange: (t: string) => void;
  onMvpNameChange: (n: string) => void;
  onSubmit: (dto: SubmitOpponentRatingInput) => void;
}) {
  if (!match.isRecordSubmitted) {
    return (
      <View style={styles.tabContent}>
        <TextBox variant="body2" color={colors.grey400}>
          경기 기록이 등록된 후 상대팀 평가가 가능합니다.
        </TextBox>
      </View>
    );
  }

  if (hasSubmitted) {
    return (
      <View style={styles.tabContent}>
        <TextBox variant="body2" color={colors.grey500}>
          상대팀 평가를 완료했습니다.
        </TextBox>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <OpponentRatingForm
        score={score}
        review={review}
        mvpName={mvpName}
        onScoreChange={onScoreChange}
        onReviewChange={onReviewChange}
        onMvpNameChange={onMvpNameChange}
      />
      <Spacing size={4} />
      <Button
        variant="primary"
        onPress={() =>
          onSubmit({ score, review: review || undefined, mvpName: mvpName || undefined })
        }
        loading={isSubmitting}
      >
        평가 제출
      </Button>
      <Spacing size={10} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  matchHeader: {
    padding: spacing[4],
    gap: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  score: {
    marginTop: spacing[1],
  },
  tabContent: {
    padding: spacing[4],
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey100,
    marginVertical: spacing[4],
  },
  momWinner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  commentsContainer: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  commentContent: {
    flex: 1,
    gap: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'center',
  },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.grey100,
    padding: spacing[3],
    gap: spacing[2],
    backgroundColor: colors.background,
  },
  commentInput: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.grey50,
    borderRadius: 20,
    fontSize: 14,
    color: colors.grey900,
  },
  sendBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  videoInputRow: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'center',
  },
  videoInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: spacing[3],
    backgroundColor: colors.grey100,
    borderRadius: 8,
    fontSize: 14,
    color: colors.grey900,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  videoUrl: {
    flex: 1,
  },
});
