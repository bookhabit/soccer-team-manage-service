import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@ui';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  name: IoniconName;
  focusedName: IoniconName;
  color: string;
  focused: boolean;
}

function TabIcon({ name, focusedName, color, focused }: TabIconProps) {
  return <Ionicons name={focused ? focusedName : name} size={24} color={color} />;
}

/**
 * 바텀탭 내비게이터 (홈·클럽·투표·프로필).
 * useSafeAreaInsets로 하단 노치/홈 인디케이터 영역을 자동 반영한다.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 52 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.blue500,
        tabBarInactiveTintColor: colors.grey400,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.grey100,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: insets.bottom + (Platform.OS === 'android' ? 4 : 0),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home-outline" focusedName="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="club"
        options={{
          title: '클럽',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="people-outline" focusedName="people" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="matching"
        options={{
          title: '매칭',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="football-outline"
              focusedName="football"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mercenary"
        options={{
          title: '용병',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="person-add-outline"
              focusedName="person-add"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="person-circle-outline"
              focusedName="person-circle"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
