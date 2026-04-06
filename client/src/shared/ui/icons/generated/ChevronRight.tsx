import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from '../types';

export function ChevronRightIcon({ size = 24, color = '#191f28', strokeWidth = 1.8 }: IconProps) {
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
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
}
