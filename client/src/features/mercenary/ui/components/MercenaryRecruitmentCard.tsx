import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing, AvatarImage, Flex, Button } from '@ui';
import type { MercenaryRecruitmentItem } from '../../data/schemas/mercenaryAvailability.schema';

interface Props {
  item: MercenaryRecruitmentItem;
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: '초급',
  AMATEUR: '아마추어',
  SEMI_PRO: '세미프로',
  PRO: '프로',
};

export function MercenaryRecruitmentCard({ item, onAccept, onReject, isLoading }: Props) {
  const isPending = item.status === 'PENDING';

  return (
    <View style={styles.card}>
      <Flex direction="row" align="center" gap={spacing[3]}>
        {item.recruitingClubLogoUrl ? (
          <AvatarImage source={{ uri: item.recruitingClubLogoUrl }} size={44} />
        ) : (
          <View style={styles.logoPlaceholder} />
        )}
        <View style={styles.info}>
          <TextBox variant="body2Bold" color={colors.grey900}>{item.recruitingClubName}</TextBox>
          <TextBox variant="caption" color={colors.grey500}>
            {LEVEL_LABEL[item.recruitingClubLevel] ?? item.recruitingClubLevel}
          </TextBox>
        </View>
      </Flex>

      {item.message && (
        <View style={styles.message}>
          <TextBox variant="caption" color={colors.grey600}>{item.message}</TextBox>
        </View>
      )}

      {item.status === 'ACCEPTED' && (
        <View style={styles.statusBadge}>
          <TextBox variant="captionBold" color={colors.green600}>수락됨</TextBox>
        </View>
      )}
      {item.status === 'REJECTED' && (
        <View style={[styles.statusBadge, styles.rejected]}>
          <TextBox variant="captionBold" color={colors.grey500}>거절됨</TextBox>
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
  logoPlaceholder: {
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
