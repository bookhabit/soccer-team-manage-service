import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { TextBox, Input, Spacing, ScreenLayout, colors, spacing } from '@ui';
import { MemberCard } from '../components/MemberCard';
import type { ClubMember } from '../../data/schemas/club.schema';

interface MemberListViewProps {
  members: ClubMember[];
  myUserId?: string;
  hasNextPage: boolean;
  filter: string;
  onFilterChange: (v: string) => void;
  onLoadMore: () => void;
  onSelectMember: (userId: string) => void;
}

/**
 * 팀원 목록 View.
 * - 4-state: 로딩 / 빈 상태 / 목록 표시
 */
export function MemberListView({
  members,
  myUserId,
  hasNextPage,
  filter,
  onFilterChange,
  onLoadMore,
  onSelectMember,
}: MemberListViewProps) {
  const isEmpty = members.length === 0;

  return (
    <ScreenLayout>
      <View style={styles.searchBar}>
        <Input
          placeholder="이름 또는 포지션으로 검색"
          value={filter}
          onChangeText={onFilterChange}
        />
      </View>

      {isEmpty ? (
        <View style={styles.emptyWrapper}>
          <TextBox variant="body2" color={colors.grey400}>
            {filter ? `'${filter}'에 해당하는 팀원이 없습니다.` : '팀원이 없습니다.'}
          </TextBox>
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <MemberCard
              member={item}
              isMe={item.userId === myUserId}
              onPress={() => onSelectMember(item.userId)}
            />
          )}
          onEndReached={hasNextPage ? onLoadMore : undefined}
          onEndReachedThreshold={0.5}
          ItemSeparatorComponent={() => <Spacing size={0} />}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
