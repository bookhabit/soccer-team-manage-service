import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextBox, Button, Spacing, Skeleton, ScreenLayout, ConfirmDialog, colors, spacing } from '@ui';
import { FifaCard } from '../components/FifaCard';
import type { MemberDetail, ClubRole } from '../../data/schemas/club.schema';

interface MemberDetailViewProps {
  member: MemberDetail | undefined;
  isLoading: boolean;
  myRole: ClubRole | null;
  isKickDialogOpen: boolean;
  isKicking: boolean;
  onKick: () => void;
  onOpenKickDialog: () => void;
  onCloseKickDialog: () => void;
}

/**
 * 팀원 상세 View — FIFA 카드 스타일 + 관리 액션.
 */
export function MemberDetailView({
  member,
  isLoading,
  myRole,
  isKickDialogOpen,
  isKicking,
  onKick,
  onOpenKickDialog,
  onCloseKickDialog,
}: MemberDetailViewProps) {
  if (isLoading || !member) {
    return (
      <ScreenLayout>
        <View style={styles.loadingWrapper}>
          <Skeleton width="100%" height={280} borderRadius={20} />
        </View>
      </ScreenLayout>
    );
  }

  const canManage = myRole === 'CAPTAIN' || myRole === 'VICE_CAPTAIN';
  const isMemberKickable = member.role === 'MEMBER';

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.content}>
        <FifaCard member={member} />

        {canManage && isMemberKickable ? (
          <>
            <Spacing size={5} />
            <Button variant="danger" size="medium" fullWidth onPress={onOpenKickDialog}>
              팀원 강퇴
            </Button>
          </>
        ) : null}

        <Spacing size={10} />
      </ScrollView>

      <ConfirmDialog
        isOpen={isKickDialogOpen}
        onClose={onCloseKickDialog}
        onConfirm={onKick}
        title="팀원 강퇴"
        description={`${member.name} 선수를 강퇴하시겠습니까? 강퇴된 팀원은 30일간 재가입이 제한됩니다.`}
        confirmLabel="강퇴"
        cancelLabel="취소"
        destructive
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  loadingWrapper: {
    padding: spacing[4],
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
});
