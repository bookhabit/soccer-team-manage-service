import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { TextBox, colors, spacing, Flex } from '@ui';
import { MercenaryRecruitmentCard } from '../components/MercenaryRecruitmentCard';
import type { MercenaryRecruitmentItem } from '../../data/schemas/mercenaryAvailability.schema';

interface Props {
  recruitments: MercenaryRecruitmentItem[];
  onAccept: (availId: string, recId: string) => void;
  onReject: (availId: string, recId: string) => void;
  isLoading?: boolean;
}

export function MyRecruitmentsView({ recruitments, onAccept, onReject, isLoading }: Props) {
  return (
    <FlatList
      data={recruitments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MercenaryRecruitmentCard
          item={item}
          onAccept={() => onAccept(item.availabilityId, item.id)}
          onReject={() => onReject(item.availabilityId, item.id)}
          isLoading={isLoading}
        />
      )}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Flex align="center" justify="center" style={styles.empty}>
          <TextBox variant="body2" color={colors.grey400}>받은 영입 신청이 없어요</TextBox>
        </Flex>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing[4] },
  empty: { paddingTop: spacing[16] },
});
