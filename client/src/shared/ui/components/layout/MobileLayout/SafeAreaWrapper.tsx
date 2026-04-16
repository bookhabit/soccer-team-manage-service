import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import type { Edge } from 'react-native-safe-area-context';

import type { StyleProp, ViewStyle } from 'react-native';

export interface SafeAreaWrapperProps {
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

export function SafeAreaWrapper({ children, edges = ['top', 'bottom'], style }: SafeAreaWrapperProps) {
  return <SafeAreaView style={[{ flex: 1 }, style]} edges={edges}>{children}</SafeAreaView>;
}
