import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ScreenLayout, TextBox, Button, AvatarImage, Spacing, colors, spacing } from '@ui';
import { MatchGoalTimeline } from '../components/MatchGoalTimeline';
import type { MatchFeedDetail } from '../../data/schemas/matchFeed.schema';

interface MatchFeedDetailViewProps {
  detail: MatchFeedDetail;
  onGoOpponentRecord?: () => void;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export function MatchFeedDetailView({ detail, onGoOpponentRecord }: MatchFeedDetailViewProps) {
  const isLeague = detail.type === 'LEAGUE';
  const homeTeamLabel = isLeague ? detail.clubName : 'A팀';
  const awayTeamLabel = isLeague ? (detail.opponentName ?? '상대팀') : 'B팀';
  const hasMom = detail.momList.length > 0;

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 경기 헤더 */}
        <View style={styles.header}>
          <View style={styles.clubRow}>
            <AvatarImage
              source={detail.clubLogoUrl ? { uri: detail.clubLogoUrl } : null}
              size={36}
            />
            <View style={styles.clubMeta}>
              <TextBox variant="body2Bold" color={colors.grey900}>
                {detail.clubName}
              </TextBox>
              {!isLeague && (
                <View style={styles.selfBadge}>
                  <TextBox variant="caption" color={colors.blue600}>
                    자체전
                  </TextBox>
                </View>
              )}
            </View>
          </View>
          <TextBox variant="caption" color={colors.grey500}>
            {formatDate(detail.startAt)}
          </TextBox>
          <TextBox variant="caption" color={colors.grey400}>
            {detail.province} {detail.district} · {detail.location}
          </TextBox>
        </View>

        {/* 스코어 섹션 */}
        <View style={styles.scoreSection}>
          <View style={styles.teamBlock}>
            <TextBox variant="body1" color={colors.grey700} style={styles.teamLabel}>
              {homeTeamLabel}
            </TextBox>
            <TextBox variant="heading1" color={colors.grey900}>
              {detail.homeScore}
            </TextBox>
          </View>

          <TextBox variant="heading2" color={colors.grey300} style={styles.scoreSep}>
            :
          </TextBox>

          <View style={styles.teamBlock}>
            <TextBox variant="body1" color={colors.grey700} style={styles.teamLabel}>
              {awayTeamLabel}
            </TextBox>
            <TextBox variant="heading1" color={colors.grey900}>
              {detail.awayScore}
            </TextBox>
          </View>
        </View>

        {/* MOM 섹션 */}
        {hasMom && (
          <View style={styles.section}>
            <TextBox variant="body2Bold" color={colors.grey900}>
              MOM
            </TextBox>
            <Spacing size={2} />
            <View style={styles.momList}>
              {detail.momList.map((mom) => (
                <View key={mom.userId} style={styles.momItem}>
                  <TextBox variant="caption" color={colors.yellow700}>
                    ⭐
                  </TextBox>
                  <TextBox variant="body2Bold" color={colors.grey900}>
                    {mom.userName}
                  </TextBox>
                  <TextBox variant="caption" color={colors.grey500}>
                    {mom.voteCount}표
                  </TextBox>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 득점 타임라인 */}
        <View style={styles.section}>
          <TextBox variant="body2Bold" color={colors.grey900}>
            득점 기록
          </TextBox>
          <Spacing size={2} />
          <MatchGoalTimeline goals={detail.goals} />
        </View>

        {/* 참여 인원 */}
        <View style={styles.participantRow}>
          <TextBox variant="caption" color={colors.grey500}>
            참여 인원
          </TextBox>
          <TextBox variant="captionBold" color={colors.grey700}>
            {detail.participantCount}명
          </TextBox>
        </View>

        {/* 상대 전적 보기 (LEAGUE만) */}
        {isLeague && onGoOpponentRecord && (
          <View style={styles.section}>
            <Button variant="secondary" onPress={onGoOpponentRecord}>
              상대 전적 보기
            </Button>
          </View>
        )}

        <Spacing size={10} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing[6],
  },
  header: {
    padding: spacing[4],
    gap: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[1],
  },
  clubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  selfBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    backgroundColor: colors.blue50,
    borderRadius: 4,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[4],
    gap: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  teamBlock: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[2],
  },
  teamLabel: {
    textAlign: 'center',
  },
  scoreSep: {
    marginHorizontal: spacing[2],
  },
  section: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  momList: {
    gap: spacing[2],
  },
  momItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
});
