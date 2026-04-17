import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  TextBox, ConfirmDialog, Spacing, ScreenLayout, colors, spacing, useToast,
} from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMyClub, useLeaveClub } from '../../data/hooks/useClub';
import type { LeaveReason } from '../../data/schemas/club.schema';
import { useUploadClubLogo } from '@/src/features/upload/data/hooks/useUpload';

function ClubSettingsContent() {
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [leaveReason] = useState<LeaveReason>('OTHER');
  const { toast } = useToast();

  const { data: club } = useMyClub();
  const { mutate: leaveClub, isPending: isLeaving } = useLeaveClub(club?.id ?? '');

  const isCaptain = club?.myRole === 'CAPTAIN';
  const isCaptainOrVice = club?.myRole === 'CAPTAIN' || club?.myRole === 'VICE_CAPTAIN';

  const { mutate: uploadLogo } = useUploadClubLogo(club?.id ?? '');

  const handleLogoChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('image', {
      uri: asset.uri,
      name: 'logo.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    uploadLogo(formData, {
      onSuccess: () => toast.success('로고가 변경되었습니다.'),
      onError: () => toast.error('로고 변경에 실패했습니다.'),
    });
  };

  const handleLeave = () => {
    leaveClub(leaveReason, {
      onSuccess: () => toast.info('팀에서 나갔습니다.'),
      onError: () => toast.error('팀 탈퇴에 실패했습니다.'),
    });
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.content}>
        <TextBox variant="heading3" color={colors.grey900}>{club?.name}</TextBox>
        <Spacing size={5} />

        {isCaptainOrVice ? (
          <SettingsRow
            label="클럽 로고 변경"
            onPress={handleLogoChange}
          />
        ) : null}

        {isCaptainOrVice ? (
          <SettingsRow
            label="초대 코드 관리"
            onPress={() => router.push(`/(app)/club/${club!.id}/invite` as Href)}
          />
        ) : null}

        {isCaptainOrVice ? (
          <SettingsRow
            label="가입 신청 관리"
            onPress={() => router.push(`/(app)/club/${club!.id}/join-requests` as Href)}
          />
        ) : null}

        {isCaptain ? (
          <SettingsRow
            label="주장 권한 이전"
            onPress={() => router.push(`/(app)/club/${club!.id}/transfer-captain` as Href)}
          />
        ) : null}

        {isCaptain ? (
          <SettingsRow
            label="팀 해체"
            onPress={() => router.push(`/(app)/club/${club!.id}/settings/dissolve` as Href)}
            danger
          />
        ) : null}

        <Spacing size={4} />

        {!isCaptain ? (
          <SettingsRow
            label="팀 나가기"
            onPress={() => setIsLeaveDialogOpen(true)}
            danger
          />
        ) : null}
      </ScrollView>

      <ConfirmDialog
        isOpen={isLeaveDialogOpen}
        onClose={() => setIsLeaveDialogOpen(false)}
        onConfirm={handleLeave}
        title="팀 나가기"
        description="정말 팀을 나가시겠습니까?"
        confirmLabel="나가기"
        cancelLabel="취소"
        destructive
      />
    </ScreenLayout>
  );
}

export function ClubSettingsContainer() {
  return (
    <AsyncBoundary>
      <ClubSettingsContent />
    </AsyncBoundary>
  );
}

function SettingsRow({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <TextBox variant="body1" color={danger ? colors.error : colors.grey900}>{label}</TextBox>
      <TextBox variant="body2" color={colors.grey400}>{'>'}</TextBox>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
});
