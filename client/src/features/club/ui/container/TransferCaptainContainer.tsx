import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { TextBox, Spacing, ConfirmDialog, ScreenLayout, colors, spacing, useToast } from '@ui';
import { useClubMembers, useTransferCaptain } from '../../data/hooks/useClub';
import { MemberCard } from '../components/MemberCard';
import type { ClubMember } from '../../data/schemas/club.schema';

interface TransferCaptainContainerProps {
  clubId: string;
}

/**
 * 주장 권한 이전 Container.
 * 팀원 목록에서 선택 → 확인 다이얼로그 → 이전 처리.
 */
export function TransferCaptainContainer({ clubId }: TransferCaptainContainerProps) {
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const { toast } = useToast();

  const { data, isLoading, fetchNextPage, hasNextPage } = useClubMembers(clubId);
  const { mutate: transfer, isPending } = useTransferCaptain(clubId);

  const members = (data?.pages.flatMap((p) => p.data) ?? []).filter(
    (m) => m.role !== 'CAPTAIN',
  );

  const handleConfirm = () => {
    if (!selectedMember) return;
    transfer(selectedMember.userId, {
      onSuccess: () => {
        toast.success(`${selectedMember.name}에게 주장 권한을 이전했습니다.`);
        setSelectedMember(null);
        router.replace('/(app)/club' as any);
      },
      onError: () => {
        toast.error('권한 이전에 실패했습니다.');
        setSelectedMember(null);
      },
    });
  };

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <TextBox variant="body2" color={colors.grey500}>
          권한을 이전할 팀원을 선택하세요
        </TextBox>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <MemberCard member={item} onPress={() => setSelectedMember(item)} />
        )}
        onEndReached={hasNextPage ? () => fetchNextPage() : undefined}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <TextBox variant="body2" color={colors.grey400}>이전 가능한 팀원이 없습니다.</TextBox>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <Spacing size={0} />}
      />

      <ConfirmDialog
        isOpen={selectedMember != null}
        onClose={() => setSelectedMember(null)}
        onConfirm={handleConfirm}
        title="주장 권한 이전"
        description={`${selectedMember?.name ?? ''}에게 주장 권한을 이전하시겠습니까?\n이전 후 본인은 일반 팀원이 됩니다.`}
        confirmLabel="이전"
        cancelLabel="취소"
        destructive
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing[10],
  },
});
