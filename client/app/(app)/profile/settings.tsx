import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { TextBox, Spacing, ScreenLayout, colors, spacing } from '@ui';

export default function SettingsScreen() {
  return (
    <ScreenLayout>
      <View style={styles.content}>
        <TextBox variant="heading2" color={colors.grey900}>설정</TextBox>
        <Spacing size={6} />

        <TouchableOpacity onPress={() => router.push('/(app)/profile/withdraw' as Href)}>
          <TextBox variant="body2" color={colors.error}>회원 탈퇴</TextBox>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[5],
  },
});
