import React from 'react';
import { View, type ViewProps } from 'react-native';

type BoxProps = ViewProps & {
  padding?: number;
  paddingX?: number;
  paddingY?: number;
  margin?: number;
  borderRadius?: number;
  backgroundColor?: string;
};

export function Box({
  padding,
  paddingX,
  paddingY,
  margin,
  borderRadius,
  backgroundColor,
  style,
  children,
  ...rest
}: BoxProps) {
  return (
    <View
      style={[
        {
          ...(padding !== undefined ? { padding: padding * 4 } : {}),
          ...(paddingX !== undefined ? { paddingHorizontal: paddingX * 4 } : {}),
          ...(paddingY !== undefined ? { paddingVertical: paddingY * 4 } : {}),
          ...(margin !== undefined ? { margin: margin * 4 } : {}),
          ...(borderRadius !== undefined ? { borderRadius } : {}),
          ...(backgroundColor !== undefined ? { backgroundColor } : {}),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
