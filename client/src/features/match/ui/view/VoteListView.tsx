import React from 'react';
import { FlatList, View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, ScreenLayout, Spacing, colors, spacing } from '@ui';
import { MatchCard } from '../components/MatchCard';
import { computeMatchStatus } from '../../data/schemas/match.schema';
import type { MatchSummary } from '../../data/schemas/match.schema';

type FilterTab = 'upcoming' | 'past';

interface VoteListViewProps {
  matches: MatchSummary[];
  activeTab: FilterTab;
  totalMembers: number;
  hasNextPage: boolean;
  isCaptainOrVice: boolean;
  onTabChange: (tab: FilterTab) => void;
  onMatchPress: (matchId: string) => void;
  onCreateMatch: () => void;
  onLoadMore: () => void;
}

export function VoteListView({
  matches,
  activeTab,
  totalMembers,
  hasNextPage,
  isCaptainOrVice,
  onTabChange,
  onMatchPress,
  onCreateMatch,
  onLoadMore,
}: VoteListViewProps) {
  const filtered = matches.filter((m) => {
    const status = computeMatchStatus(m.startAt, m.endAt);
    return activeTab === 'upcoming' ? status !== 'AFTER' : status === 'AFTER';
  });

  return (
    <ScreenLayout>
      {/* 헤더 */}
      <View style={styles.header}>
        <TextBox variant="heading3" color={colors.grey900}>경기 투표</TextBox>
        {isCaptainOrVice ? (
          <TouchableOpacity onPress={onCreateMatch} activeOpacity={0.7}>
            <TextBox variant="body2Bold" color={colors.blue500}>+ 경기 등록</TextBox>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 필터 탭 */}
      <View style={styles.tabs}>
        {(['upcoming', 'past'] as FilterTab[]).map((tab) => {
          const label = tab === 'upcoming' ? '다가오는 경기' : '지난 경기';
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabChange(tab)}
              activeOpacity={0.7}
            >
              <TextBox
                variant={isActive ? 'body2Bold' : 'body2'}
                color={isActive ? colors.blue500 : colors.grey500}
              >
                {label}
              </TextBox>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <Spacing size={3} />}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            totalMembers={totalMembers}
            onPress={() => onMatchPress(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <TextBox variant="body2" color={colors.grey400}>등록된 경기가 없습니다.</TextBox>
          </View>
        }
        onEndReached={hasNextPage ? onLoadMore : undefined}
        onEndReachedThreshold={0.3}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  tab: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.grey200,
  },
  tabActive: {
    borderColor: colors.blue500,
    backgroundColor: colors.blue50,
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing[10],
  },
});
