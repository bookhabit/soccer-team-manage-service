import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextBox, colors, spacing, AvatarImage, Flex } from '@ui';
import { MercenaryStatusBadge } from './MercenaryStatusBadge';
import type { MercenaryPostSummary } from '../../data/schemas/mercenaryPost.schema';

interface Props {
  post: MercenaryPostSummary;
  onPress: () => void;
}

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: '초급',
  AMATEUR: '아마추어',
  SEMI_PRO: '세미프로',
  PRO: '프로',
};

const POSITION_LABEL: Record<string, string> = {
  FW: 'FW',
  MF: 'MF',
  DF: 'DF',
  GK: 'GK',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
}

export function MercenaryPostCard({ post, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Flex direction="row" align="center" justify="space-between" style={styles.header}>
        <Flex direction="row" align="center" gap={spacing[2]}>
          {post.clubLogoUrl ? (
            <AvatarImage source={{ uri: post.clubLogoUrl }} size={32} />
          ) : (
            <View style={styles.logoPlaceholder} />
          )}
          <View>
            <TextBox variant="body2Bold" color={colors.grey900}>{post.clubName}</TextBox>
            <TextBox variant="caption" color={colors.grey500}>{LEVEL_LABEL[post.clubLevel] ?? post.clubLevel}</TextBox>
          </View>
        </Flex>
        <MercenaryStatusBadge status={post.status} isExpired={post.isExpired} />
      </Flex>

      <View style={styles.body}>
        <Flex direction="row" gap={spacing[1]} style={styles.positions}>
          {post.positions.map((pos) => (
            <View key={pos} style={styles.posChip}>
              <TextBox variant="captionBold" color={colors.primary}>{POSITION_LABEL[pos]}</TextBox>
            </View>
          ))}
        </Flex>

        <Flex direction="row" justify="space-between" style={styles.meta}>
          <TextBox variant="caption" color={colors.grey600}>
            {formatDate(post.matchDate)} {post.startTime}~{post.endTime}
          </TextBox>
          <TextBox variant="caption" color={colors.grey600}>
            {post.acceptedCount}/{post.requiredCount}명
          </TextBox>
        </Flex>

        <TextBox variant="caption" color={colors.grey500}>{post.regionSigungu} · {post.location}</TextBox>
        <TextBox variant="caption" color={colors.grey500}>
          {post.fee === 0 ? '무료' : `${post.fee.toLocaleString()}원`} · {LEVEL_LABEL[post.level] ?? post.level}
        </TextBox>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: { marginBottom: spacing[3] },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.grey100,
  },
  body: { gap: spacing[1] },
  positions: { marginBottom: spacing[1] },
  posChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.blue50,
  },
  meta: { marginBottom: spacing[1] },
});
