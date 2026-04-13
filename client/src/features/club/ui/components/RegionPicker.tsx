import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors } from '@ui/foundation/colors';
import { typography } from '@ui/foundation/typography';
import { ChevronDownIcon } from '@ui/icons';
import type { Region } from '@/src/shared/services/region.service';

const SHEET_ANIMATION_DURATION = 250;

interface RegionPickerProps {
  label?: string;
  regions: Region[];
  value?: string;       // 선택된 regionId
  onChange?: (regionId: string) => void;
  errorMessage?: string;
  disabled?: boolean;
}

export function RegionPicker({
  label,
  regions,
  value,
  onChange,
  errorMessage,
  disabled,
}: RegionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;

  // 선택된 region 찾기
  const selectedRegion = regions.find((r) => r.id === value);
  const displayLabel = selectedRegion
    ? `${selectedRegion.name} ${selectedRegion.sigungu}`
    : undefined;

  // 시/도 목록 (중복 제거, 가나다 정렬)
  const provinces = useMemo(() => {
    const unique = [...new Set(regions.map((r) => r.name))];
    return unique.sort((a, b) => a.localeCompare(b, 'ko'));
  }, [regions]);

  // 선택된 시/도의 시/군/구 목록
  const districts = useMemo(() => {
    const province = selectedProvince ?? provinces[0];
    return regions
      .filter((r) => r.name === province)
      .sort((a, b) => a.sigungu.localeCompare(b.sigungu, 'ko'));
  }, [regions, selectedProvince, provinces]);

  const activeProvince = selectedProvince ?? provinces[0];

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: SHEET_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: SHEET_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (onDone: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: SHEET_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 300,
        duration: SHEET_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(onDone);
  };

  const open = () => {
    // 현재 선택값이 있으면 해당 시/도로 초기화
    if (selectedRegion) {
      setSelectedProvince(selectedRegion.name);
    } else {
      setSelectedProvince(null);
    }
    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(300);
    setIsOpen(true);
    requestAnimationFrame(animateIn);
  };

  const close = () => {
    animateOut(() => setIsOpen(false));
  };

  const handleSelectDistrict = (region: Region) => {
    onChange?.(region.id);
    close();
  };

  const hasError = errorMessage !== undefined;

  return (
    <View style={styles.wrapper}>
      {label !== undefined && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.trigger, hasError && styles.triggerError, disabled && styles.disabled]}
        onPress={() => !disabled && open()}
        activeOpacity={0.8}
      >
        <Text style={[styles.triggerText, !displayLabel && styles.placeholder]}>
          {displayLabel ?? '시/도 및 지역 선택'}
        </Text>
        <ChevronDownIcon size={18} color={colors.grey500} />
      </TouchableOpacity>
      {hasError && <Text style={styles.errorMessage}>{errorMessage}</Text>}

      <Modal visible={isOpen} transparent animationType="none" onRequestClose={close}>
        <View style={styles.container}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={close} />
          </Animated.View>

          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
            {/* 핸들 + 타이틀 */}
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{label ?? '활동 지역 선택'}</Text>

            {/* 두 컬럼 */}
            <View style={styles.columns}>
              {/* 좌: 시/도 */}
              <FlatList
                style={styles.provinceList}
                data={provinces}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isActive = item === activeProvince;
                  return (
                    <TouchableOpacity
                      style={[styles.provinceItem, isActive && styles.provinceItemActive]}
                      onPress={() => setSelectedProvince(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[styles.provinceText, isActive && styles.provinceTextActive]}
                        numberOfLines={1}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              {/* 구분선 */}
              <View style={styles.divider} />

              {/* 우: 시/군/구 */}
              <FlatList
                style={styles.districtList}
                data={districts}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = item.id === value;
                  return (
                    <TouchableOpacity
                      style={styles.districtItem}
                      onPress={() => handleSelectDistrict(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[styles.districtText, isSelected && styles.districtTextSelected]}
                      >
                        {item.sigungu}
                      </Text>
                      {isSelected && (
                        <View style={styles.selectedDot} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  label: {
    ...typography.body2Bold,
    color: colors.grey700,
    marginBottom: 4,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.grey200,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  triggerError: { borderColor: colors.error },
  disabled: { backgroundColor: colors.grey100, opacity: 0.6 },
  triggerText: { ...typography.body1, flex: 1, color: colors.grey900 },
  placeholder: { color: colors.grey400 },
  errorMessage: { ...typography.caption, color: colors.error, marginTop: 4 },

  // 모달
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    height: '65%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grey200,
    alignSelf: 'center',
    marginVertical: 12,
  },
  sheetTitle: {
    ...typography.heading3,
    color: colors.grey900,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  // 두 컬럼
  columns: { flex: 1, flexDirection: 'row' },

  // 좌: 시/도
  provinceList: { width: 110 },
  provinceItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  provinceItemActive: {
    backgroundColor: colors.blue50,
    borderRightWidth: 2,
    borderRightColor: colors.blue500,
  },
  provinceText: {
    ...typography.body2,
    color: colors.grey600,
  },
  provinceTextActive: {
    ...typography.body2Bold,
    color: colors.blue600,
  },

  // 구분선
  divider: { width: 1, backgroundColor: colors.grey100 },

  // 우: 시/군/구
  districtList: { flex: 1 },
  districtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  districtText: {
    ...typography.body1,
    flex: 1,
    color: colors.grey800,
  },
  districtTextSelected: {
    color: colors.blue500,
    fontWeight: '600',
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.blue500,
  },
});
