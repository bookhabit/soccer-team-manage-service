import React from 'react';
import { View } from 'react-native';

type SpacingProps = {
  size: number;
  direction?: 'vertical' | 'horizontal';
};

export function Spacing({ size, direction = 'vertical' }: SpacingProps) {
  const px = size * 4;
  if (direction === 'horizontal') {
    return <View style={{ width: px }} />;
  }
  return <View style={{ height: px }} />;
}
