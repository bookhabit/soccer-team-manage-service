import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, Button, AvatarImage, Spacing, colors, spacing } from '@ui';
import type { JoinRequest } from '../../data/schemas/club.schema';
import { POSITION_LABEL, LEVEL_LABEL } from '@/src/shared/constants/player.constants';

interface JoinRequestCardProps {
  request: JoinRequest;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

/**
 * 가입 신청 관리 화면에서 사용하는 신청자 카드 컴포넌트.
 */
export function JoinRequestCard({
  request,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: JoinRequestCardProps) {
  const positionLabel = request.userPosition ? POSITION_LABEL[request.userPosition] : null;
  const levelLabel = request.userLevel ? LEVEL_LABEL[request.userLevel] : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AvatarImage source={request.userAvatarUrl ? { uri: request.userAvatarUrl } : null} size={44} />
        <View style={styles.info}>
          <TextBox variant="body1Bold" color={colors.grey900}>{request.userName}</TextBox>
          <View style={styles.metaRow}>
            {positionLabel ? (
              <TextBox variant="caption" color={colors.grey500}>{positionLabel}</TextBox>
            ) : null}
            {levelLabel ? (
              <TextBox variant="caption" color={colors.grey500}>
                {positionLabel ? ' · ' : ''}{levelLabel}
              </TextBox>
            ) : null}
            <TextBox variant="caption" color={colors.grey500}>
              {(positionLabel || levelLabel) ? ' · ' : ''}⭐ {request.userMannerScore.toFixed(1)}
            </TextBox>
          </View>
        </View>
      </View>

      {request.message ? (
        <>
          <Spacing size={2} />
          <View style={styles.messageBox}>
            <TextBox variant="body2" color={colors.grey700}>{request.message}</TextBox>
          </View>
        </>
      ) : null}

      <Spacing size={3} />

      <View style={styles.actions}>
        <View style={styles.actionBtn}>
          <Button
            variant="secondary"
            size="medium"
            fullWidth
            onPress={onReject}
            loading={isRejecting}
          >
            거절
          </Button>
        </View>
        <View style={styles.actionBtn}>
          <Button
            variant="primary"
            size="medium"
            fullWidth
            onPress={onApprove}
            loading={isApproving}
          >
            승인
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 12,
    padding: spacing[4],
    backgroundColor: colors.background,
    marginBottom: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  info: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageBox: {
    backgroundColor: colors.grey50,
    borderRadius: 8,
    padding: spacing[3],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  actionBtn: {
    flex: 1,
  },
});
