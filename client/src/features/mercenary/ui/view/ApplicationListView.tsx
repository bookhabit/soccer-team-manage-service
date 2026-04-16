import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing, Flex } from '@ui';
import { MercenaryApplicationCard } from '../components/MercenaryApplicationCard';
import type { MercenaryApplicationItem } from '../../data/schemas/mercenaryPost.schema';

interface Props {
  applications: MercenaryApplicationItem[];
  onAccept: (appId: string) => void;
  onReject: (appId: string) => void;
  isLoading?: boolean;
}

export function ApplicationListView({ applications, onAccept, onReject, isLoading }: Props) {
  return (
    <FlatList
      data={applications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MercenaryApplicationCard
          app={item}
          onAccept={() => onAccept(item.id)}
          onReject={() => onReject(item.id)}
          isLoading={isLoading}
        />
      )}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Flex align="center" justify="center" style={styles.empty}>
          <TextBox variant="body2" color={colors.grey400}>지원자가 없어요</TextBox>
        </Flex>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing[4] },
  empty: { paddingTop: spacing[16] },
});
