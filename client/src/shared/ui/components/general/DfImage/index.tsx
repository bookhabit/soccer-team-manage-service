import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Animated } from 'react-native';

import { Image as ExpoImage, ImageProps as ExpoImageProps, ImageStyle } from 'expo-image';

import { colors } from '@ui/foundation/colors';
import TextBox from '../TextBox';

/** 로컬 File 객체, 서버 URL, expo-image source 모두 수용 */
type ImageSource = ExpoImageProps['source'] | File | null;

interface DfImageProps extends Omit<ExpoImageProps, 'placeholder' | 'source'> {
  /** 이미지 소스: File(로컬 미리보기), string URL, expo-image source 모두 허용 */
  source: ImageSource;
  /** 로딩 스켈레톤 표시 여부 */
  showPlaceholder?: boolean;
  /** 에러 시 표시할 컴포넌트 */
  errorComponent?: React.ReactNode;
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  /** 이미지 비율 (width / height) */
  aspectRatio?: number;
  /** 이미지 스타일 */
  style?: StyleProp<ImageStyle>;
  /** Progressive loading용 썸네일 URL */
  thumbnailSource?: string;
}

// ─── 로딩 오버레이 (shimmer) ──────────────────────────────────────────────────
function SkeletonOverlay() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[StyleSheet.absoluteFill, overlayStyles.skeleton, { opacity }]} />;
}

const overlayStyles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.grey200,
  },
});

// ─── DfImage ─────────────────────────────────────────────────────────────────
export const DfImage: React.FC<DfImageProps> = ({
  source,
  style,
  showPlaceholder = true,
  errorComponent,
  containerStyle,
  aspectRatio,
  thumbnailSource,
  ...props
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'idle'>('idle');
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // File 객체 → objectURL 변환 (언마운트 시 해제)
  useEffect(() => {
    if (source instanceof File) {
      const url = URL.createObjectURL(source);
      setObjectUrl(url);
      setStatus('loading');
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
    setStatus(source ? 'loading' : 'idle');
    return undefined;
  }, [source]);

  const resolvedSource = objectUrl
    ? { uri: objectUrl }
    : (source as ExpoImageProps['source']);

  const imageStyle: StyleProp<ImageStyle> = aspectRatio ? [style, { aspectRatio }] : style;
  const containerHeight = aspectRatio
    ? { aspectRatio }
    : (style as ViewStyle)?.height
      ? {}
      : { minHeight: 200 };

  return (
    <View style={[styles.container, containerStyle, containerHeight]}>
      {/* 로딩 스켈레톤 */}
      {status === 'loading' && showPlaceholder && <SkeletonOverlay />}

      {/* 에러 상태 */}
      {status === 'error' && (
        <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
          {errorComponent ?? (
            <View style={styles.errorContent}>
              <TextBox variant="body2" color={colors.error}>
                이미지를 불러올 수 없습니다
              </TextBox>
            </View>
          )}
        </View>
      )}

      {/* 이미지 */}
      {status !== 'error' && resolvedSource && (
        <ExpoImage
          source={resolvedSource}
          style={imageStyle}
          onLoadStart={() => setStatus('loading')}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          cachePolicy="memory-disk"
          transition={300}
          placeholder={thumbnailSource ? { uri: thumbnailSource } : undefined}
          placeholderContentFit="cover"
          {...props}
        />
      )}
    </View>
  );
};

// ─── 미리 정의된 이미지 패턴 ──────────────────────────────────────────────────
export const AvatarImage: React.FC<Omit<DfImageProps, 'aspectRatio'>> = ({ style, ...props }) => (
  <DfImage {...props} style={[styles.avatar, style]} contentFit="cover" />
);

export const ThumbnailImage: React.FC<DfImageProps> = ({
  style,
  aspectRatio = 16 / 9,
  ...props
}) => (
  <DfImage {...props} style={[styles.thumbnail, style]} aspectRatio={aspectRatio} contentFit="cover" />
);

export const CoverImage: React.FC<DfImageProps> = ({ style, aspectRatio = 2 / 1, ...props }) => (
  <DfImage {...props} style={[styles.cover, style]} aspectRatio={aspectRatio} contentFit="cover" />
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.grey100,
  },
  errorContent: {
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  thumbnail: {
    width: '100%',
    borderRadius: 8,
  },
  cover: {
    width: '100%',
    borderRadius: 0,
  },
});

export default DfImage;
