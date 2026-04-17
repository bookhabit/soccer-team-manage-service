import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { TextBox, AvatarImage, colors, spacing } from '@ui';
import type { MatchFeedItem as MatchFeedItemType } from '../../data/schemas/matchFeed.schema';
import { getClubLogoUrl } from '@/src/shared/utils/imageUrl';

interface MatchFeedItemProps {
  item: MatchFeedItemType;
  onPress: () => void;
}

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay >= 7) {
    return new Date(isoString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  if (diffDay >= 1) return `${diffDay}일 전`;
  if (diffHour >= 1) return `${diffHour}시간 전`;
  if (diffMin >= 1) return `${diffMin}분 전`;
  return '방금 전';
}

export function MatchFeedItem({ item, onPress }: MatchFeedItemProps) {
  const isLeague = item.type === 'LEAGUE';
  const relativeTime = formatRelativeTime(item.startAt);
  const regionLabel = `${item.province} ${item.district}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* 상단: 클럽 정보 + 날짜 */}
      <View style={styles.header}>
        <View style={styles.clubRow}>
          <AvatarImage
            source={{ uri: getClubLogoUrl(item.clubLogoUrl) }}
            size={28}
          />
          <View style={styles.clubInfo}>
            <TextBox variant="captionBold" color={colors.grey900}>
              {item.clubName}
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
        <TextBox variant="caption" color={colors.grey400}>
          {relativeTime}
        </TextBox>
      </View>

      {/* 스코어 섹션 */}
      <View style={styles.scoreSection}>
        {isLeague ? (
          <>
            <TextBox variant="body2Bold" color={colors.grey900} style={styles.teamName}>
              {item.clubName}
            </TextBox>
            <View style={styles.scoreBox}>
              <TextBox variant="heading3" color={colors.grey900}>
                {item.homeScore}
              </TextBox>
              <TextBox variant="heading3" color={colors.grey400} style={styles.scoreSep}>
                :
              </TextBox>
              <TextBox variant="heading3" color={colors.grey900}>
                {item.awayScore}
              </TextBox>
            </View>
            <TextBox variant="body2Bold" color={colors.grey700} style={styles.teamNameRight}>
              {item.opponentName ?? '상대팀'}
            </TextBox>
          </>
        ) : (
          <>
            <TextBox variant="body2Bold" color={colors.grey900} style={styles.teamName}>
              A팀
            </TextBox>
            <View style={styles.scoreBox}>
              <TextBox variant="heading3" color={colors.grey900}>
                {item.homeScore}
              </TextBox>
              <TextBox variant="heading3" color={colors.grey400} style={styles.scoreSep}>
                :
              </TextBox>
              <TextBox variant="heading3" color={colors.grey900}>
                {item.awayScore}
              </TextBox>
            </View>
            <TextBox variant="body2Bold" color={colors.grey700} style={styles.teamNameRight}>
              B팀
            </TextBox>
          </>
        )}
      </View>

      {/* 하단 메타 */}
      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <TextBox variant="caption" color={colors.grey500}>
            {regionLabel}
          </TextBox>
          <TextBox variant="caption" color={colors.grey400}>
            {' · '}
          </TextBox>
          <TextBox variant="caption" color={colors.grey500} numberOfLines={1} style={styles.locationText}>
            {item.location}
          </TextBox>
        </View>
        {isLeague && item.momUserName ? (
          <View style={styles.momRow}>
            <TextBox variant="caption" color={colors.yellow700}>
              MOM
            </TextBox>
            <TextBox variant="caption" color={colors.grey700} style={styles.momName}>
              {item.momUserName}
            </TextBox>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.grey100,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
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
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  teamName: {
    flex: 1,
    textAlign: 'right',
  },
  teamNameRight: {
    flex: 1,
    textAlign: 'left',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    gap: spacing[1],
  },
  scoreSep: {
    marginHorizontal: spacing[1],
  },
  footer: {
    gap: spacing[1],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
  },
  momRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  momName: {
    marginLeft: spacing[1],
  },
});
