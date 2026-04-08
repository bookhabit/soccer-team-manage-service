import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
import type { InviteCode } from '../../data/schemas/club.schema';

interface InviteCodeBoxProps {
  inviteCode: InviteCode;
  onCopy: () => void;
  onRenew: () => void;
  isRenewing: boolean;
}

/**
 * 초대 코드 표시 및 복사·재발급 UI 컴포넌트.
 */
export function InviteCodeBox({ inviteCode, onCopy, onRenew, isRenewing }: InviteCodeBoxProps) {
  const expiresDate = new Date(inviteCode.expiresAt);
  const expiresLabel = expiresDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.box}>
      <TextBox variant="caption" color={colors.grey500}>초대 코드</TextBox>
      <View style={styles.codeRow}>
        <TextBox variant="heading2" color={colors.grey900} style={styles.code}>
          {inviteCode.code}
        </TextBox>
        <TouchableOpacity style={styles.copyBtn} onPress={onCopy}>
          <TextBox variant="body2Bold" color={colors.blue500}>복사</TextBox>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <TextBox variant="caption" color={inviteCode.isExpired ? colors.error : colors.grey500}>
          {inviteCode.isExpired ? '만료됨' : `${expiresLabel} 까지`}
        </TextBox>
        <TouchableOpacity onPress={onRenew} disabled={isRenewing}>
          <TextBox variant="captionBold" color={colors.blue500}>
            {isRenewing ? '재발급 중...' : '코드 재발급'}
          </TextBox>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 16,
    padding: spacing[5],
    gap: spacing[2],
    backgroundColor: colors.grey50,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  code: {
    letterSpacing: 4,
  },
  copyBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.blue50,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
