import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { TextBox, Spacing, SafeAreaWrapper, colors, spacing } from '@ui';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaWrapper>
        <View style={styles.content}>
          <TextBox variant="heading2" color={colors.grey900}>설정</TextBox>
          <Spacing size={6} />

          <TouchableOpacity onPress={() => router.push('/(app)/profile/withdraw' as any)}>
            <TextBox variant="body2" color={colors.error}>회원 탈퇴</TextBox>
          </TouchableOpacity>
        </View>
      </SafeAreaWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing[5],
  },
});
