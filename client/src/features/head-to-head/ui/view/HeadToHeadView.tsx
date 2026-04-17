import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { ScreenLayout, TextBox, Spacing, EmptyState, colors, spacing } from '@ui';
import { H2HSummaryCard, H2HHistoryItem } from '../components';
import type { HeadToHeadSummary, HeadToHeadHistoryItem } from '../../data/schemas/headToHead.schema';

interface HeadToHeadViewProps {
  summary: HeadToHeadSummary;
  history: HeadToHeadHistoryItem[];
  hasNextPage: boolean;
  onLoadMore: () => void;
}

export function HeadToHeadView({
  summary,
  history,
  hasNextPage,
  onLoadMore,
}: HeadToHeadViewProps) {
  return (
    <ScreenLayout>
      <FlatList
        data={history}
        keyExtractor={(item) => item.matchId}
        renderItem={({ item }) => <H2HHistoryItem item={item} />}
        ListHeaderComponent={
          <>
            <H2HSummaryCard summary={summary} />
            <View style={styles.sectionHeader}>
              <TextBox variant="body2Bold" color={colors.grey700}>
                맞대결 이력
              </TextBox>
            </View>
          </>
        }
        ListEmptyComponent={<EmptyState message="아직 맞붙은 적이 없습니다." />}
        onEndReached={hasNextPage ? onLoadMore : undefined}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.list}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing[10],
  },
  sectionHeader: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
});
