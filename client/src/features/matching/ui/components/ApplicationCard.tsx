import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, AvatarImage, Button, colors, spacing } from '@ui';
import { LEVEL_LABEL } from '@/src/shared/constants/player.constants';
import type { MatchApplicationItem } from '../../data/schemas/matchApplication.schema';

interface ApplicationCardProps {
  application: MatchApplicationItem;
  onAccept: () => void;
  onReject: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

/**
 * 신청 목록 아이템 카드. 등록자가 수락/거절할 수 있다.
 */
export function ApplicationCard({
  application,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: ApplicationCardProps) {
  const isPending = application.status === 'PENDING';
  const isAccepted = application.status === 'ACCEPTED';

  const statusColor = isAccepted
    ? colors.green600
    : application.status === 'REJECTED'
    ? colors.grey400
    : colors.blue500;

  const statusLabel = isAccepted ? '수락됨' : application.status === 'REJECTED' ? '거절됨' : '대기중';

  return (
    <View style={styles.card}>
      {/* 클럽 정보 */}
      <View style={styles.header}>
        <AvatarImage
          source={application.applicantClubLogoUrl ? { uri: application.applicantClubLogoUrl } : undefined}
          size={40}
        />
        <View style={styles.clubInfo}>
          <TextBox variant="body1Bold" color={colors.grey900}>{application.applicantClubName}</TextBox>
          <TextBox variant="caption" color={colors.grey500}>
            {LEVEL_LABEL[application.applicantClubLevel] ?? application.applicantClubLevel}
          </TextBox>
        </View>
        <TextBox variant="captionBold" color={statusColor}>{statusLabel}</TextBox>
      </View>

      {/* 메시지 */}
      {application.message && (
        <View style={styles.messageBox}>
          <TextBox variant="body2" color={colors.grey700}>{application.message}</TextBox>
        </View>
      )}

      {/* 신청일 */}
      <TextBox variant="caption" color={colors.grey400} style={styles.date}>
        {new Date(application.createdAt).toLocaleDateString('ko-KR')}
      </TextBox>

      {/* 수락/거절 버튼 (PENDING 상태만) */}
      {isPending && (
        <View style={styles.actions}>
          <View style={styles.btnWrap}>
            <Button
              variant="secondary"
              size="small"
              fullWidth
              onPress={onReject}
              loading={isRejecting}
              disabled={isAccepting}
            >
              거절
            </Button>
          </View>
          <View style={styles.btnWrap}>
            <Button
              variant="primary"
              size="small"
              fullWidth
              onPress={onAccept}
              loading={isAccepting}
              disabled={isRejecting}
            >
              수락
            </Button>
          </View>
        </View>
      )}
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
    marginBottom: spacing[2],
  },
  clubInfo: {
    flex: 1,
    marginLeft: spacing[2],
  },
  messageBox: {
    backgroundColor: colors.grey50,
    borderRadius: 8,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  date: {
    marginBottom: spacing[2],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  btnWrap: { flex: 1 },
});
