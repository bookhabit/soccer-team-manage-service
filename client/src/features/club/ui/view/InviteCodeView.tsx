import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, Spacing, Skeleton, ScreenLayout, colors, spacing } from '@ui';
import { InviteCodeBox } from '../components/InviteCodeBox';
import type { InviteCode } from '../../data/schemas/club.schema';

interface InviteCodeViewProps {
  inviteCode: InviteCode | undefined;
  isLoading: boolean;
  isRenewing: boolean;
  onCopy: () => void;
  onRenew: () => void;
}

/**
 * 초대 코드 확인·복사 View.
 */
export function InviteCodeView({
  inviteCode,
  isLoading,
  isRenewing,
  onCopy,
  onRenew,
}: InviteCodeViewProps) {
  return (
    <ScreenLayout>
      <View style={styles.content}>
        <TextBox variant="heading3" color={colors.grey900}>초대 코드</TextBox>
        <Spacing size={2} />
        <TextBox variant="body2" color={colors.grey500}>
          코드를 공유하면 팀원이 빠르게 가입할 수 있습니다.
        </TextBox>
        <Spacing size={6} />

        {isLoading || !inviteCode ? (
          <Skeleton width="100%" height={100} borderRadius={16} />
        ) : (
          <InviteCodeBox
            inviteCode={inviteCode}
            onCopy={onCopy}
            onRenew={onRenew}
            isRenewing={isRenewing}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[5],
  },
});
