import React from 'react';
import { View, type ViewProps } from 'react-native';

type GridProps = ViewProps & {
  columns?: number;
  gap?: number;
  children: React.ReactNode;
};

export function Grid({ columns = 2, gap = 0, style, children, ...rest }: GridProps) {
  const gapPx = gap * 4;
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', margin: -gapPx / 2 }, style]} {...rest}>
      {React.Children.map(children, (child) => (
        <View style={{ width: `${100 / columns}%` as any, padding: gapPx / 2 }}>{child}</View>
      ))}
    </View>
  );
}
