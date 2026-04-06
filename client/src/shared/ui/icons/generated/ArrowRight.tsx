import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from '../types';

export function ArrowRightIcon({ size = 24, color = '#191f28', strokeWidth = 1.8 }: IconProps) {
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
      <Path d="M5 12h14M14 5l7 7-7 7" />
    </Svg>
  );
}
