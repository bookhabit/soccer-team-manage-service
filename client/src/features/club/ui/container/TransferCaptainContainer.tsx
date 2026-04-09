import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { TextBox, Spacing, ConfirmDialog, ScreenLayout, Skeleton, colors, spacing, useToast } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useClubMembers, useTransferCaptain } from '../../data/hooks/useClub';
import { MemberCard } from '../components/MemberCard';
import type { ClubMember } from '../../data/schemas/club.schema';

interface TransferCaptainContainerProps {
  clubId: string;
}

function TransferCaptainSkeleton() {
  return (
    <ScreenLayout>
      <View style={{ padding: 16, gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton width="50%" height={16} />
              <Skeleton width="30%" height={12} />
            </View>
          </View>
        ))}
      </View>
    </ScreenLayout>
  );
}

function TransferCaptainContent({ clubId }: TransferCaptainContainerProps) {
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const { toast } = useToast();

  const { data, fetchNextPage, hasNextPage } = useClubMembers(clubId);
  const { mutate: transfer, isPending } = useTransferCaptain(clubId);

  const members = data.pages.flatMap((p) => p.data).filter((m) => m.role !== 'CAPTAIN');

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
          <View style={styles.empty}>
            <TextBox variant="body2" color={colors.grey400}>이전 가능한 팀원이 없습니다.</TextBox>
          </View>
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

export function TransferCaptainContainer({ clubId }: TransferCaptainContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<TransferCaptainSkeleton />}>
      <TransferCaptainContent clubId={clubId} />
    </AsyncBoundary>
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
