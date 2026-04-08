import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, Button, Spacing, Skeleton, ScreenLayout, ConfirmDialog, colors, spacing } from '@ui';
import type { DissolveVote } from '../../data/schemas/club.schema';

interface DissolveVoteViewProps {
  vote: DissolveVote | undefined;
  isLoading: boolean;
  isCaptain: boolean;
  isResponding: boolean;
  isStarting: boolean;
  isConfirmOpen: boolean;
  onStartVote: () => void;
  onAgree: () => void;
  onDisagree: () => void;
  onOpenConfirm: () => void;
  onCloseConfirm: () => void;
}

/**
 * 해체 투표 View — 투표 상태 표시 + 동의·거절 버튼.
 */
export function DissolveVoteView({
  vote,
  isLoading,
  isCaptain,
  isResponding,
  isStarting,
  isConfirmOpen,
  onStartVote,
  onAgree,
  onDisagree,
  onOpenConfirm,
  onCloseConfirm,
}: DissolveVoteViewProps) {
  if (isLoading) {
    return (
      <ScreenLayout>
        <View style={styles.content}>
          <Skeleton width="100%" height={160} borderRadius={16} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View style={styles.content}>
        {vote == null || vote.status === 'EXPIRED' || vote.status === 'REJECTED' ? (
          <>
            <TextBox variant="heading3" color={colors.grey900}>팀 해체</TextBox>
            <Spacing size={2} />
            <TextBox variant="body2" color={colors.grey500}>
              해체를 요청하면 팀원 전체에게 동의 요청이 전송됩니다.{'\n'}
              48시간 내에 과반수가 동의하면 팀이 해체됩니다.
            </TextBox>
            <Spacing size={6} />
            {isCaptain ? (
              <Button variant="danger" size="large" fullWidth onPress={onOpenConfirm} loading={isStarting}>
                해체 요청
              </Button>
            ) : (
              <TextBox variant="body2" color={colors.grey400}>주장만 해체를 요청할 수 있습니다.</TextBox>
            )}
          </>
        ) : vote.status === 'APPROVED' ? (
          <>
            <TextBox variant="heading3" color={colors.grey900}>팀이 해체되었습니다</TextBox>
            <Spacing size={2} />
            <TextBox variant="body2" color={colors.grey500}>팀이 해체 처리되었습니다.</TextBox>
          </>
        ) : (
          /* IN_PROGRESS */
          <>
            <TextBox variant="heading3" color={colors.grey900}>해체 투표 진행 중</TextBox>
            <Spacing size={4} />

            <View style={styles.voteStatus}>
              <TextBox variant="body2Bold" color={colors.grey900}>
                {vote.agreedCount} / {vote.totalCount}명 동의
              </TextBox>
              <TextBox variant="body2" color={colors.grey500}>
                {new Date(vote.expiresAt).toLocaleString('ko-KR')} 까지
              </TextBox>
            </View>

            <Spacing size={5} />

            {vote.myResponse == null ? (
              <View style={styles.buttonRow}>
                <View style={styles.btn}>
                  <Button variant="secondary" size="large" fullWidth onPress={onDisagree} loading={isResponding}>
                    반대
                  </Button>
                </View>
                <View style={styles.btn}>
                  <Button variant="danger" size="large" fullWidth onPress={onAgree} loading={isResponding}>
                    동의
                  </Button>
                </View>
              </View>
            ) : (
              <TextBox variant="body2" color={colors.grey500}>
                {vote.myResponse ? '동의' : '반대'}를 선택하셨습니다.
              </TextBox>
            )}
          </>
        )}
      </View>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={onCloseConfirm}
        onConfirm={onStartVote}
        title="팀 해체 요청"
        description="팀 해체를 요청하시겠습니까? 팀원에게 동의 요청이 전송됩니다."
        confirmLabel="요청"
        cancelLabel="취소"
        destructive
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[5],
  },
  voteStatus: {
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[1],
    backgroundColor: colors.grey50,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  btn: {
    flex: 1,
  },
});
