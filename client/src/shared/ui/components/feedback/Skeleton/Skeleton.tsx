import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
};

export function Skeleton({ width = '100%', height = 16, borderRadius = 6 }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.grey200,
  },
});
