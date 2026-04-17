import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { TextBox, Switch, colors, spacing, useToast } from '@ui';
import { useRegions } from '@/src/shared/hooks/useRegions';
import type { MatchFeedFilter } from '../../data/schemas/matchFeed.schema';
import type { Region } from '@/src/shared/services/region.service';

interface MatchFeedFilterBarProps {
  filter: MatchFeedFilter;
  isClubMember: boolean;
  onChange: (filter: MatchFeedFilter) => void;
}

type MatchType = 'ALL' | 'LEAGUE' | 'SELF';

const SHEET_DURATION = 250;

export function MatchFeedFilterBar({ filter, isClubMember, onChange }: MatchFeedFilterBarProps) {
  const { toast } = useToast();
  const { data: regions = [] } = useRegions();
  const [regionDrawerOpen, setRegionDrawerOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;

  // 시/도 목록
  const provinces = useMemo(() => {
    const unique = [...new Set(regions.map((r: Region) => r.name))];
    return unique.sort((a, b) => a.localeCompare(b, 'ko'));
  }, [regions]);

  // 선택된 시/도의 구/군 목록
  const activeProvince = selectedProvince ?? provinces[0] ?? '';
  const districts = useMemo(
    () =>
      regions
        .filter((r: Region) => r.name === activeProvince)
        .sort((a, b) => a.sigungu.localeCompare(b.sigungu, 'ko')),
    [regions, activeProvince],
  );

  const currentRegionLabel =
    filter.province && filter.district
      ? `${filter.province} ${filter.district}`
      : filter.province
        ? filter.province
        : '지역';

  const isRegionActive = !!(filter.province);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: SHEET_DURATION, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 0, duration: SHEET_DURATION, useNativeDriver: true }),
    ]).start();
  };

  const animateOut = (onDone: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: SHEET_DURATION, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 300, duration: SHEET_DURATION, useNativeDriver: true }),
    ]).start(onDone);
  };

  const openRegionDrawer = () => {
    // 현재 province가 있으면 그걸로 초기화
    if (filter.province) {
      setSelectedProvince(filter.province);
    } else {
      setSelectedProvince(null);
    }
    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(300);
    setRegionDrawerOpen(true);
    requestAnimationFrame(animateIn);
  };

  const closeRegionDrawer = () => {
    animateOut(() => setRegionDrawerOpen(false));
  };

  const handleSelectDistrict = (region: Region) => {
    onChange({ ...filter, province: region.name, district: region.sigungu });
    closeRegionDrawer();
  };

  const clearRegion = () => {
    const { province: _p, district: _d, ...rest } = filter;
    onChange(rest);
  };

  const handleTypeChange = (type: MatchType) => {
    if (type === 'ALL') {
      const { type: _t, ...rest } = filter;
      onChange(rest);
    } else {
      onChange({ ...filter, type });
    }
  };

  const activeType: MatchType = filter.type ?? 'ALL';

  const handleMyClubToggle = () => {
    if (!isClubMember) {
      toast.info('클럽에 가입하면 사용할 수 있어요');
      return;
    }
    onChange({ ...filter, myClub: !filter.myClub });
  };

  const handleMyMatchesToggle = () => {
    onChange({ ...filter, myMatches: !filter.myMatches });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 지역 필터 버튼 */}
        <TouchableOpacity
          style={[styles.chip, isRegionActive && styles.chipActive]}
          onPress={isRegionActive ? clearRegion : openRegionDrawer}
          activeOpacity={0.75}
        >
          <TextBox
            variant="captionBold"
            color={isRegionActive ? colors.primary : colors.grey600}
          >
            {currentRegionLabel}
            {isRegionActive ? ' ✕' : ''}
          </TextBox>
        </TouchableOpacity>

        {/* 유형 필터 칩 */}
        {(['ALL', 'LEAGUE', 'SELF'] as MatchType[]).map((type) => {
          const label = type === 'ALL' ? '전체' : type === 'LEAGUE' ? '매칭전' : '자체전';
          const isActive = activeType === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => handleTypeChange(type)}
              activeOpacity={0.75}
            >
              <TextBox
                variant="captionBold"
                color={isActive ? colors.primary : colors.grey600}
              >
                {label}
              </TextBox>
            </TouchableOpacity>
          );
        })}

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 내 클럽만 토글 */}
        <View style={[styles.toggleRow, !isClubMember && styles.toggleDisabled]}>
          <TextBox variant="caption" color={isClubMember ? colors.grey700 : colors.grey400}>
            내 클럽만
          </TextBox>
          <Switch
            checked={!!filter.myClub && isClubMember}
            onChange={handleMyClubToggle}
            disabled={!isClubMember}
          />
        </View>

        {/* 내가 뛴 경기 토글 */}
        <View style={styles.toggleRow}>
          <TextBox variant="caption" color={colors.grey700}>
            내가 뛴 경기
          </TextBox>
          <Switch checked={!!filter.myMatches} onChange={handleMyMatchesToggle} />
        </View>
      </ScrollView>

      {/* 지역 선택 Drawer */}
      <Modal
        visible={regionDrawerOpen}
        transparent
        animationType="none"
        onRequestClose={closeRegionDrawer}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <TouchableOpacity
              style={styles.backdropTouch}
              activeOpacity={1}
              onPress={closeRegionDrawer}
            />
          </Animated.View>

          <Animated.View
            style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}
          >
            <View style={styles.handle} />
            <TextBox variant="heading3" color={colors.grey900} style={styles.sheetTitle}>
              지역 선택
            </TextBox>

            <View style={styles.columns}>
              {/* 좌: 시/도 */}
              <FlatList
                style={styles.provinceList}
                data={provinces}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: province }) => {
                  const isActive = province === activeProvince;
                  return (
                    <TouchableOpacity
                      style={[styles.provinceItem, isActive && styles.provinceItemActive]}
                      onPress={() => setSelectedProvince(province)}
                      activeOpacity={0.7}
                    >
                      <TextBox
                        variant={isActive ? 'body2Bold' : 'body2'}
                        color={isActive ? colors.blue600 : colors.grey600}
                        numberOfLines={1}
                      >
                        {province}
                      </TextBox>
                    </TouchableOpacity>
                  );
                }}
              />

              <View style={styles.columnDivider} />

              {/* 우: 시/군/구 */}
              <FlatList
                style={styles.districtList}
                data={districts}
                keyExtractor={(region) => region.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: region }) => {
                  const isSelected =
                    filter.province === region.name && filter.district === region.sigungu;
                  return (
                    <TouchableOpacity
                      style={styles.districtItem}
                      onPress={() => handleSelectDistrict(region)}
                      activeOpacity={0.7}
                    >
                      <TextBox
                        variant="body1"
                        color={isSelected ? colors.primary : colors.grey800}
                      >
                        {region.sigungu}
                      </TextBox>
                      {isSelected && <View style={styles.selectedDot} />}
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
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.grey200,
    backgroundColor: colors.background,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.blue50,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.grey200,
    marginHorizontal: spacing[1],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[2],
  },
  toggleDisabled: {
    opacity: 0.5,
  },

  // 모달
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
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
    paddingHorizontal: spacing[5],
    marginBottom: spacing[3],
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
  },
  provinceList: {
    width: 110,
  },
  provinceItem: {
    paddingHorizontal: spacing[4],
    paddingVertical: 14,
  },
  provinceItemActive: {
    backgroundColor: colors.blue50,
    borderRightWidth: 2,
    borderRightColor: colors.blue500,
  },
  columnDivider: {
    width: 1,
    backgroundColor: colors.grey100,
  },
  districtList: {
    flex: 1,
  },
  districtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: 14,
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginLeft: spacing[2],
  },
});
