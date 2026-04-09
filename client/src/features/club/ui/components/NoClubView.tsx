import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, Button, Spacing, ScreenLayout, colors, spacing } from '@ui';

interface NoClubViewProps {
  onCreateClub: () => void;
  onSearchClub: () => void;
  onJoinByCode: () => void;
}

export function NoClubView({ onCreateClub, onSearchClub, onJoinByCode }: NoClubViewProps) {
  return (
    <ScreenLayout>
      <View style={styles.wrapper}>
        <TextBox variant="heading2" color={colors.grey900} style={styles.center}>
          ⚽ 소속 팀이 없어요
        </TextBox>
        <Spacing size={2} />
        <TextBox variant="body2" color={colors.grey500} style={styles.center}>
          팀을 만들거나 가입 신청을 해보세요
        </TextBox>
        <Spacing size={8} />
        <Button variant="primary" size="large" fullWidth onPress={onCreateClub}>
          팀 만들기
        </Button>
        <Spacing size={2} />
        <Button variant="secondary" size="large" fullWidth onPress={onSearchClub}>
          팀 찾아보기
        </Button>
        <Spacing size={2} />
        <Button variant="ghost" size="medium" fullWidth onPress={onJoinByCode}>
          초대 코드로 가입
        </Button>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[6],
  },
  center: {
    textAlign: 'center',
  },
});
