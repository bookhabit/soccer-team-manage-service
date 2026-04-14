import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, AvatarImage, colors, spacing } from '@ui';
import { LEVEL_LABEL } from '@/src/shared/constants/player.constants';
import type { MatchPostSummary } from '../../data/schemas/matchPost.schema';
import { MatchStatusBadge } from './MatchStatusBadge';

const GENDER_LABEL: Record<string, string> = {
  MALE: '남성',
  FEMALE: '여성',
  MIXED: '혼성',
};

interface MatchPostCardProps {
  post: MatchPostSummary;
  onPress: () => void;
}

/**
 * 매칭 게시글 목록 카드.
 */
export function MatchPostCard({ post, onPress }: MatchPostCardProps) {
  const dateLabel = new Date(post.matchDate).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
  const feeLabel = post.fee === 0 ? '무료' : `${post.fee.toLocaleString()}원`;
  const regionLabel = `${post.regionName} ${post.regionSigungu}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* 헤더: 클럽 */}
      <View style={styles.header}>
        <AvatarImage source={post.clubLogoUrl ? { uri: post.clubLogoUrl } : undefined} size={36} />
        <View style={styles.clubInfo}>
          <TextBox variant="body2Bold" color={colors.grey900}>{post.clubName}</TextBox>
          <TextBox variant="caption" color={colors.grey500}>{LEVEL_LABEL[post.clubLevel] ?? post.clubLevel}</TextBox>
        </View>
        <MatchStatusBadge status={post.status} isExpired={post.isExpired} />
      </View>

      {/* 경기 정보 */}
      <View style={styles.infoRow}>
        <TextBox variant="body1Bold" color={colors.grey900}>
          {dateLabel} · {post.startTime}–{post.endTime}
        </TextBox>
      </View>
      <TextBox variant="body2" color={colors.grey700} style={styles.location}>
        {post.location}
      </TextBox>
      <TextBox variant="caption" color={colors.grey500}>{regionLabel}</TextBox>

      {/* 태그 행 */}
      <View style={styles.tags}>
        <Tag label={`${post.playerCount}명`} />
        <Tag label={GENDER_LABEL[post.gender] ?? post.gender} />
        <Tag label={LEVEL_LABEL[post.level] ?? post.level} />
        <Tag label={feeLabel} accent={post.fee > 0} />
      </View>
    </TouchableOpacity>
  );
}

function Tag({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <View style={[styles.tag, accent && styles.tagAccent]}>
      <TextBox variant="caption" color={accent ? colors.orange600 : colors.grey600}>{label}</TextBox>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing[4],
    marginHorizontal: spacing[4],
    marginVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.grey100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  clubInfo: {
    flex: 1,
    marginLeft: spacing[2],
  },
  infoRow: {
    marginBottom: spacing[1],
  },
  location: {
    marginBottom: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginTop: spacing[3],
  },
  tag: {
    backgroundColor: colors.grey100,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagAccent: {
    backgroundColor: colors.orange50,
  },
});
