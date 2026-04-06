import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from '../types';

export function MenuIcon({ size = 24, color = '#191f28', strokeWidth = 1.8 }: IconProps) {
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
      <Path d="M3 6h18M3 12h18M3 18h18" />
    </Svg>
  );
}
