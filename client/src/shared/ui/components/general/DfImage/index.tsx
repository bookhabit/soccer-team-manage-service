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
  // 1. 초기 상태를 바로 loading으로 하거나, source 존재 여부에 따라 결정
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'idle'>(
    source ? 'loading' : 'idle',
  );
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (source instanceof File) {
      const url = URL.createObjectURL(source);
      setObjectUrl(url);
      setStatus('loading');
      return () => URL.revokeObjectURL(url);
    }

    // source가 변경될 때마다 상태 업데이트
    setObjectUrl(null);
    setStatus(source ? 'loading' : 'idle');
  }, [source]);

  const resolvedSource = objectUrl ? { uri: objectUrl } : (source as ExpoImageProps['source']);

  const flattenStyle = StyleSheet.flatten(style);
  const hasHeight = flattenStyle?.height !== undefined;

  // 2. width가 고정되어 있다면 '100%'를 해제해야 아바타 레이아웃이 안 깨짐
  const containerWidth: ViewStyle = flattenStyle?.width
    ? { width: flattenStyle.width }
    : { width: '100%' as const }; // 'as const'를 붙여 리터럴 타입임을 명시

  const containerHeight: ViewStyle = aspectRatio
    ? { aspectRatio }
    : hasHeight
      ? {}
      : { minHeight: 200 };

  return (
    <View style={[styles.container, containerStyle, containerWidth, containerHeight]}>
      {/* 3. 로딩 중이거나 source가 아예 없을 때(idle) placeholder 표시 여부 결정 */}
      {(status === 'loading' || status === 'idle') && showPlaceholder && !source && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.grey100 }]} />
      )}

      {status === 'loading' && showPlaceholder && <SkeletonOverlay />}

      {/* 에러 상태 - 아바타 크기일 땐 문구 숨기기 가이드 추가 */}
      {status === 'error' && (
        <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
          {errorComponent ?? (
            <TextBox variant="caption" color={colors.error}>
              !
            </TextBox>
          )}
        </View>
      )}

      {/* 이미지 렌더링: source가 있을 때만 실행 */}
      {resolvedSource && (
        <ExpoImage
          source={resolvedSource}
          style={[style, status === 'loading' && { opacity: 0 }]} // 로딩 중엔 숨김
          onLoadStart={() => setStatus('loading')}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          {...props}
        />
      )}
    </View>
  );
};

// ─── 미리 정의된 이미지 패턴 ──────────────────────────────────────────────────
interface AvatarImageProps extends Omit<DfImageProps, 'aspectRatio'> {
  /** 아바타 지름 (px). borderRadius는 자동으로 size/2 적용. 기본값 48 */
  size?: number;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ size = 48, style, ...props }) => (
  <DfImage
    {...props}
    style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
    contentFit="cover"
    errorComponent={
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.grey200,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TextBox variant="caption" color={colors.grey400}>
          No Img
        </TextBox>
      </View>
    }
  />
);

export const ThumbnailImage: React.FC<DfImageProps> = ({
  style,
  aspectRatio = 16 / 9,
  ...props
}) => (
  <DfImage
    {...props}
    style={[styles.thumbnail, style]}
    aspectRatio={aspectRatio}
    contentFit="cover"
  />
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
