import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing, AvatarImage, Flex, Button } from '@ui';
import type { MercenaryApplicationItem } from '../../data/schemas/mercenaryPost.schema';

interface Props {
  app: MercenaryApplicationItem;
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

const POSITION_LABEL: Record<string, string> = {
  FW: '공격수(FW)',
  MF: '미드필더(MF)',
  DF: '수비수(DF)',
  GK: '골키퍼(GK)',
};

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
};

export function MercenaryApplicationCard({ app, onAccept, onReject, isLoading }: Props) {
  const isPending = app.status === 'PENDING';

  return (
    <View style={styles.card}>
      <Flex direction="row" align="center" gap={spacing[3]}>
        {app.applicantAvatarUrl ? (
          <AvatarImage source={{ uri: app.applicantAvatarUrl }} size={44} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <View style={styles.info}>
          <TextBox variant="body2Bold" color={colors.grey900}>
            {app.applicantName}
          </TextBox>
          <Flex direction="row" gap={spacing[2]}>
            {app.applicantPosition && (
              <TextBox variant="caption" color={colors.grey600}>
                {POSITION_LABEL[app.applicantPosition] ?? app.applicantPosition}
              </TextBox>
            )}
            {app.applicantLevel && (
              <TextBox variant="caption" color={colors.grey600}>
                {LEVEL_LABEL[app.applicantLevel] ?? app.applicantLevel}
              </TextBox>
            )}
          </Flex>
          <Flex direction="row" gap={spacing[3]}>
            <TextBox variant="caption" color={colors.grey500}>
              매너 {app.applicantMannerScore.toFixed(1)}°
            </TextBox>
            <TextBox variant="caption" color={colors.grey500}>
              용병 {app.mercenaryMatchCount}회
            </TextBox>
          </Flex>
        </View>
      </Flex>

      {app.message && (
        <View style={styles.message}>
          <TextBox variant="caption" color={colors.grey600}>
            {app.message}
          </TextBox>
        </View>
      )}

      {app.status === 'ACCEPTED' && (
        <View style={styles.statusBadge}>
          <TextBox variant="captionBold" color={colors.green600}>
            수락됨
          </TextBox>
        </View>
      )}
      {app.status === 'REJECTED' && (
        <View style={[styles.statusBadge, styles.rejected]}>
          <TextBox variant="captionBold" color={colors.grey500}>
            거절됨
          </TextBox>
        </View>
      )}

      {isPending && (
        <Flex direction="row" gap={spacing[2]} style={styles.actions}>
          <Button
            variant="secondary"
            size="small"
            style={styles.actionBtn}
            onPress={onReject}
            disabled={isLoading}
          >
            거절
          </Button>
          <Button
            variant="primary"
            size="small"
            style={styles.actionBtn}
            onPress={onAccept}
            disabled={isLoading}
          >
            수락
          </Button>
        </Flex>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.grey100,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.grey100,
  },
  info: { flex: 1, gap: spacing[1] },
  message: {
    marginTop: spacing[3],
    padding: spacing[3],
    backgroundColor: colors.grey50,
    borderRadius: 8,
  },
  statusBadge: {
    marginTop: spacing[2],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.green50,
    alignSelf: 'flex-start',
  },
  rejected: { backgroundColor: colors.grey100 },
  actions: { marginTop: spacing[3] },
  actionBtn: { flex: 1 },
});
