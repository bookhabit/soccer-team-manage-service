import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import type { IconProps } from '../types';

export function HistoryIcon({ size = 24, color = '#191f28', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect x="3" y="4" width="18" height="16" rx="2" />
      <Path d="M7 9H17M7 13H13" />
    </Svg>
  );
}
