import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing, Flex, AvatarImage, BottomCTASingle, Button, Spacing } from '@ui';
import type { MercenaryAvailabilityDetail } from '../../data/schemas/mercenaryAvailability.schema';

interface Props {
  avail: MercenaryAvailabilityDetail;
  onRecruit: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isRecruiting?: boolean;
}

const POSITION_LABEL: Record<string, string> = {
  FW: 'FW 공격수',
  MF: 'MF 미드필더',
  DF: 'DF 수비수',
  GK: 'GK 골키퍼',
};

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function MercenaryAvailabilityDetailView({ avail, onRecruit, onEdit, onDelete, isRecruiting }: Props) {
  const sortedDates = [...avail.availableDates].sort();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* 개인 정보 */}
        <Flex direction="row" align="center" gap={spacing[4]} style={styles.section}>
          {avail.userAvatarUrl ? (
            <AvatarImage source={{ uri: avail.userAvatarUrl }} size={64} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <View>
            <TextBox variant="heading3" color={colors.grey900}>{avail.userName}</TextBox>
            <Flex direction="row" gap={spacing[2]}>
              {avail.age && (
                <TextBox variant="body2" color={colors.grey500}>{avail.age}세</TextBox>
              )}
              {avail.userLevel && (
                <TextBox variant="body2" color={colors.grey500}>
                  {LEVEL_LABEL[avail.userLevel] ?? avail.userLevel}
                </TextBox>
              )}
            </Flex>
          </View>
        </Flex>

        {/* 용병 가능 정보 */}
        <View style={styles.section}>
          <TextBox variant="body2Bold" color={colors.grey700}>용병 가능 정보</TextBox>
          <Spacing size={2} />
          <InfoRow label="포지션" value={avail.positions.map((p) => POSITION_LABEL[p] ?? p).join(', ')} />
          <InfoRow label="가능 날짜" value={sortedDates.map(formatDate).join(', ')} />
          <InfoRow label="가능 지역" value={avail.regionNames.join(', ')} />
          {avail.timeSlot && <InfoRow label="가능 시간" value={avail.timeSlot} />}
          <InfoRow label="참가비" value={avail.acceptsFee ? '참가비 있어도 됨' : '무료만'} />
        </View>

        {/* 자기소개 */}
        {avail.bio && (
          <View style={styles.section}>
            <TextBox variant="body2Bold" color={colors.grey700}>자기소개</TextBox>
            <Spacing size={2} />
            <TextBox variant="body2" color={colors.grey600}>{avail.bio}</TextBox>
          </View>
        )}

        {/* 플레이어 정보 */}
        <View style={styles.section}>
          <TextBox variant="body2Bold" color={colors.grey700}>플레이어 정보</TextBox>
          <Spacing size={2} />
          <InfoRow label="매너 점수" value={`${avail.mannerScore.toFixed(1)}°`} />
          <InfoRow label="용병 경기" value={`${avail.mercenaryMatchCount}회`} />
          {avail.userLevel && (
            <InfoRow label="실력" value={LEVEL_LABEL[avail.userLevel] ?? avail.userLevel} />
          )}
        </View>

        {/* 본인 액션 */}
        {avail.isOwnPost && (
          <View style={styles.section}>
            <Flex direction="row" gap={spacing[2]}>
              {!avail.isExpired && (
                <Button variant="secondary" size="small" onPress={onEdit} style={styles.actionBtn}>
                  수정
                </Button>
              )}
              <Button variant="danger" size="small" onPress={onDelete} style={styles.actionBtn}>
                삭제
              </Button>
            </Flex>
          </View>
        )}
      </ScrollView>

      {/* 영입 신청 CTA (관리자에게만) */}
      {!avail.isOwnPost && (
        <BottomCTASingle safeArea>
          <Button
            variant="primary"
            onPress={onRecruit}
            disabled={!avail.canRecruit || isRecruiting}
            fullWidth
          >
            {avail.alreadyRecruited
              ? '신청 완료'
              : avail.isExpired
              ? '만료된 게시글'
              : '영입 신청'}
          </Button>
        </BottomCTASingle>
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex direction="row" style={styles.infoRow}>
      <TextBox variant="body2" color={colors.grey500} style={styles.infoLabel}>{label}</TextBox>
      <TextBox variant="body2" color={colors.grey900} style={styles.infoValue}>{value}</TextBox>
    </Flex>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing[4], paddingBottom: spacing[24] },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.grey100,
  },
  section: {
    marginBottom: spacing[5],
    paddingBottom: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  infoRow: { marginBottom: spacing[2] },
  infoLabel: { width: 80, flexShrink: 0 },
  infoValue: { flex: 1 },
  actionBtn: { flex: 1 },
});
