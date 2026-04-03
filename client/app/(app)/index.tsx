import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMe, useLogout } from '@/src/features/auth/data/hooks/useAuth';

export default function HomeScreen() {
  const { data: me } = useMe();
  const { mutate: logout, isPending } = useLogout();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>안녕하세요, {me?.nickname ?? '...'}님!</Text>
      <Text style={styles.email}>{me?.email}</Text>

      <TouchableOpacity style={styles.button} onPress={() => logout()} disabled={isPending}>
        <Text style={styles.buttonText}>{isPending ? '로그아웃 중...' : '로그아웃'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
