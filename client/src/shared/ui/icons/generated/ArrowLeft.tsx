import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from '../types';

export function ArrowLeftIcon({ size = 24, color = '#191f28', strokeWidth = 1.8 }: IconProps) {
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
      <Path d="M19 12H5M5 12l7 7M5 12l7-7" />
    </Svg>
  );
}
