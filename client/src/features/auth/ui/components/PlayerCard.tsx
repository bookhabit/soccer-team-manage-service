import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, AvatarImage, colors, spacing } from '@ui';
import { MannerBadge } from './MannerBadge';

const POSITION_LABEL: Record<string, string> = {
  FW: '공격수',
  MF: '미드필더',
  DF: '수비수',
  GK: '골키퍼',
};

interface PlayerCardProps {
  name: string | null;
  position: string | null;
  avatarUrl: string | null;
  mannerScore: number;
  jerseyNumber?: number | null;
  teamName?: string | null;
  role?: string | null;
}

export function PlayerCard({
  name,
  position,
  avatarUrl,
  mannerScore,
  jerseyNumber,
  teamName,
  role,
}: PlayerCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AvatarImage
          source={avatarUrl ? { uri: avatarUrl } : null}
          size={72}
        />
        <View style={styles.info}>
          <TextBox variant="heading2" color={colors.grey900}>
            {name ?? '탈퇴 사용자'}
          </TextBox>
          {position !== null && (
            <TextBox variant="body2" color={colors.grey500} style={styles.position}>
              {POSITION_LABEL[position] ?? position}
              {jerseyNumber !== null && jerseyNumber !== undefined && ` · #${jerseyNumber}`}
            </TextBox>
          )}
          {teamName !== null && teamName !== undefined && (
            <TextBox variant="caption" color={colors.grey400} style={styles.team}>
              {role !== null && role !== undefined ? `${teamName} · ${role}` : teamName}
            </TextBox>
          )}
        </View>
        <MannerBadge score={mannerScore} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.grey200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  info: {
    flex: 1,
  },
  position: {
    marginTop: 2,
  },
  team: {
    marginTop: 4,
  },
});
