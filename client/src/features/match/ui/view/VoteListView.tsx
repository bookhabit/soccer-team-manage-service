import React from 'react';
import { FlatList, View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, ScreenLayout, Spacing, EmptyState, colors, spacing } from '@ui';
import { MatchCard } from '../components/MatchCard';
import { computeMatchStatus } from '../../data/schemas/match.schema';
import type { MatchSummary } from '../../data/schemas/match.schema';

interface VoteListViewProps {
  matches: MatchSummary[];
  totalMembers: number;
  hasNextPage: boolean;
  isCaptainOrVice: boolean;
  onMatchPress: (matchId: string) => void;
  onCreateMatch: () => void;
  onLoadMore: () => void;
}

function VoteListEmpty({
  isCaptainOrVice,
  onCreateMatch,
}: {
  isCaptainOrVice: boolean;
  onCreateMatch: () => void;
}) {
  return (
    <View style={styles.empty}>
      <EmptyState message="다가오는 경기가 없습니다." />
      {isCaptainOrVice && (
        <TouchableOpacity onPress={onCreateMatch} activeOpacity={0.7} style={styles.createBtn}>
          <TextBox variant="body2Bold" color={colors.blue500}>
            + 경기 등록하기
          </TextBox>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function VoteListView({
  matches,
  totalMembers,
  hasNextPage,
  isCaptainOrVice,
  onMatchPress,
  onCreateMatch,
  onLoadMore,
}: VoteListViewProps) {
  // 다가오는 경기만 표시 (BEFORE / DURING)
  const upcoming = matches.filter((m) => {
    const status = computeMatchStatus(m.startAt, m.endAt);
    return status !== 'AFTER';
  });

  return (
    <ScreenLayout>
      {/* 헤더 */}
      <View style={styles.header}>
        <TextBox variant="heading3" color={colors.grey900}>
          경기 투표
        </TextBox>
        {isCaptainOrVice ? (
          <TouchableOpacity onPress={onCreateMatch} activeOpacity={0.7}>
            <TextBox variant="body2Bold" color={colors.blue500}>
              + 경기 등록
            </TextBox>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={upcoming}
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
          <VoteListEmpty isCaptainOrVice={isCaptainOrVice} onCreateMatch={onCreateMatch} />
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
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[10],
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing[10],
    gap: spacing[3],
  },
  createBtn: {
    paddingVertical: spacing[2],
  },
});
