import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import type { IconProps } from '../types';

export function ProfileIcon({ size = 24, color = '#191f28', strokeWidth = 1.8 }: IconProps) {
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
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
    </Svg>
  );
}
