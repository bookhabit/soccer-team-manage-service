import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TextBox, Spacing, AvatarImage, ScreenLayout, colors, spacing } from '@ui';
import { RecruitmentBadge } from '../components/RecruitmentBadge';
import { ClubStatsBar } from '../components/ClubStatsBar';
import type { ClubDetail } from '../../data/schemas/club.schema';
import { LEVEL_LABEL } from '@/src/shared/constants/player.constants';

interface ClubTabViewProps {
  club: ClubDetail;
  onGoMembers: () => void;
  onGoBoard: () => void;
  onGoSettings: () => void;
  onGoJoinRequests: () => void;
}

/**
 * 클럽 탭 홈 View — 클럽 대시보드.
 * 로딩: AsyncBoundary(skeleton), 미소속: EmptyBoundary(NoClubView), 에러: ErrorBoundary
 */
export function ClubTabView({
  club,
  onGoMembers,
  onGoBoard,
  onGoSettings,
  onGoJoinRequests,
}: ClubTabViewProps) {
  const isCaptainOrVice = club.myRole === 'CAPTAIN' || club.myRole === 'VICE_CAPTAIN';
  const levelLabel = LEVEL_LABEL[club.level] ?? club.level;

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 클럽 헤더 */}
        <View style={styles.clubHeader}>
          <AvatarImage
            source={club.logoUrl ? { uri: club.logoUrl } : null}
            style={styles.avatar}
          />
          <View style={styles.clubInfo}>
            <View style={styles.nameRow}>
              <TextBox variant="heading3" color={colors.grey900}>{club.name}</TextBox>
              <RecruitmentBadge status={club.recruitmentStatus} />
            </View>
            <TextBox variant="body2" color={colors.grey500}>
              {club.regionName} · {levelLabel} · {club.currentMemberCount}/{club.maxMemberCount}명
            </TextBox>
            <TextBox variant="caption" color={colors.grey500}>⭐ {club.mannerScoreAvg.toFixed(1)}</TextBox>
          </View>
          <TouchableOpacity onPress={onGoSettings}>
            <TextBox variant="body2" color={colors.grey400}>설정</TextBox>
          </TouchableOpacity>
        </View>

        {club.description ? (
          <>
            <Spacing size={3} />
            <TextBox variant="body2" color={colors.grey700}>{club.description}</TextBox>
          </>
        ) : null}

        <Spacing size={4} />

        {/* 전적 요약 (placeholder — 실제 match 도메인 연동 시 교체) */}
        <ClubStatsBar matchCount={0} winCount={0} drawCount={0} lossCount={0} />

        <Spacing size={4} />

        {/* 빠른 메뉴 */}
        <View style={styles.menuGrid}>
          <MenuButton label="팀원" onPress={onGoMembers} />
          <MenuButton label="게시판" onPress={onGoBoard} />
          {isCaptainOrVice ? (
            <MenuButton label="가입 신청" onPress={onGoJoinRequests} />
          ) : null}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

function MenuButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuBtn} onPress={onPress} activeOpacity={0.7}>
      <TextBox variant="body2Bold" color={colors.grey900}>{label}</TextBox>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  clubInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  menuBtn: {
    flex: 1,
    minWidth: '40%',
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
