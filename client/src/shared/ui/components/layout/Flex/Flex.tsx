import React from 'react';
import { View, type ViewProps, type FlexStyle } from 'react-native';

type FlexProps = ViewProps & {
  direction?: FlexStyle['flexDirection'];
  align?: FlexStyle['alignItems'];
  justify?: FlexStyle['justifyContent'];
  gap?: number;
  wrap?: FlexStyle['flexWrap'];
  flex?: number;
};

export function Flex({
  direction = 'row',
  align = 'stretch',
  justify = 'flex-start',
  gap = 0,
  wrap = 'nowrap',
  flex,
  style,
  children,
  ...rest
}: FlexProps) {
  return (
    <View
      style={[
        {
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          gap: gap * 4,
          flexWrap: wrap,
          ...(flex !== undefined ? { flex } : {}),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
