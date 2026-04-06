import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import type { Edge } from 'react-native-safe-area-context';

export interface SafeAreaWrapperProps {
  children: ReactNode;
  edges?: Edge[];
}

export function SafeAreaWrapper({ children, edges = ['top', 'bottom'] }: SafeAreaWrapperProps) {
  return <SafeAreaView edges={edges}>{children}</SafeAreaView>;
}
