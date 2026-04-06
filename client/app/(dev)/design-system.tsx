import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import {
  colors,
  typography,
  spacing,
  Button,
  TextBox,
  TextField,
  Select,
  Checkbox,
  Switch,
  ListRow,
  Flex,
  Spacing,
  Skeleton,
  Modal,
  Drawer,
  AlertDialog,
  ConfirmDialog,
  ToastProvider,
  useToast,
  DfImage,
  AvatarImage,
  ThumbnailImage,
  CoverImage,
  type TypographyToken,
  // Icons
  HomeIcon,
  ProfileIcon,
  SearchIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SettingsIcon,
  NotificationIcon,
  MenuIcon,
  HistoryIcon,
} from '@ui';

// ─── Section Header ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <TextBox style={s.sectionTitle}>{title}</TextBox>
      <View style={s.sectionBody}>{children}</View>
    </View>
  );
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <View style={s.row}>
      {label && <TextBox style={s.rowLabel}>{label}</TextBox>}
      <View style={s.rowContent}>{children}</View>
    </View>
  );
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const colorGroups = [
  {
    name: 'Grey',
    items: [
      { token: 'grey50', hex: colors.grey50 },
      { token: 'grey100', hex: colors.grey100 },
      { token: 'grey200', hex: colors.grey200 },
      { token: 'grey400', hex: colors.grey400 },
      { token: 'grey500', hex: colors.grey500 },
      { token: 'grey700', hex: colors.grey700 },
      { token: 'grey900', hex: colors.grey900 },
    ],
  },
  {
    name: 'Blue (Primary)',
    items: [
      { token: 'blue50', hex: colors.blue50 },
      { token: 'blue300', hex: colors.blue300 },
      { token: 'blue500', hex: colors.blue500 },
      { token: 'blue600', hex: colors.blue600 },
      { token: 'blue700', hex: colors.blue700 },
    ],
  },
  {
    name: 'Semantic',
    items: [
      { token: 'primary', hex: colors.primary },
      { token: 'success', hex: colors.success },
      { token: 'warning', hex: colors.warning },
      { token: 'error', hex: colors.error },
    ],
  },
];

function ColorsSection() {
  return (
    <Section title="🎨 Colors">
      {colorGroups.map((group) => (
        <View key={group.name} style={{ marginBottom: 16 }}>
          <TextBox style={s.groupLabel}>{group.name}</TextBox>
          <View style={s.colorRow}>
            {group.items.map((c) => (
              <View key={c.token} style={s.colorItem}>
                <View style={[s.colorSwatch, { backgroundColor: c.hex }]} />
                <TextBox style={s.colorToken}>{c.token}</TextBox>
                <TextBox style={s.colorHex}>{c.hex}</TextBox>
              </View>
            ))}
          </View>
        </View>
      ))}
    </Section>
  );
}

// ─── Typography ───────────────────────────────────────────────────────────────
const typoItems: { token: TypographyToken; label: string }[] = [
  { token: 'heading1', label: 'Heading 1 — 22px Bold' },
  { token: 'heading2', label: 'Heading 2 — 20px Bold' },
  { token: 'heading3', label: 'Heading 3 — 18px Bold' },
  { token: 'body1', label: 'Body 1 — 16px Regular' },
  { token: 'body1Bold', label: 'Body 1 Bold — 16px SemiBold' },
  { token: 'body2', label: 'Body 2 — 14px Regular' },
  { token: 'body2Bold', label: 'Body 2 Bold — 14px SemiBold' },
  { token: 'caption', label: 'Caption — 12px Regular' },
  { token: 'captionBold', label: 'Caption Bold — 12px SemiBold' },
  { token: 'label', label: 'Label — 13px Medium' },
];

function TypographySection() {
  return (
    <Section title="✏️ Typography">
      {typoItems.map((t) => (
        <View key={t.token} style={s.typoItem}>
          <TextBox variant={t.token} color={colors.grey900}>{t.label}</TextBox>
          <TextBox style={s.tokenBadge}>{t.token}</TextBox>
        </View>
      ))}
    </Section>
  );
}

// ─── TextBox ──────────────────────────────────────────────────────────────────
function TextBoxSection() {
  return (
    <Section title="🔤 TextBox">
      <Row label="variant">
        <Flex direction="column" gap={2}>
          {typoItems.map((t) => (
            <TextBox key={t.token} variant={t.token} color={colors.grey900}>
              {t.token} — {t.label}
            </TextBox>
          ))}
        </Flex>
      </Row>

      <Row label="color">
        <Flex direction="column" gap={2}>
          <TextBox variant="body1" color={colors.primary}>primary 색상</TextBox>
          <TextBox variant="body1" color={colors.error}>error 색상</TextBox>
          <TextBox variant="body1" color={colors.success}>success 색상</TextBox>
          <TextBox variant="body1" color={colors.grey500}>secondary 텍스트</TextBox>
        </Flex>
      </Row>

      <Row label="numberOfLines">
        <TextBox variant="body2" color={colors.grey700} numberOfLines={1}>
          한 줄로 제한된 텍스트 — 길게 작성해도 말줄임표(…)로 잘립니다. 아주 긴 문장을 넣어도 한 줄만 표시됩니다.
        </TextBox>
      </Row>
    </Section>
  );
}

// ─── Spacing ──────────────────────────────────────────────────────────────────
function SpacingSection() {
  const items = [1, 2, 3, 4, 5, 6, 8, 10, 12, 14] as const;
  return (
    <Section title="📐 Spacing">
      {items.map((n) => (
        <View key={n} style={s.spacingItem}>
          <TextBox style={s.spacingLabel}>
            spacing[{n}] = {spacing[n]}px
          </TextBox>
          <View
            style={{
              width: spacing[n],
              height: 16,
              backgroundColor: colors.blue300,
              borderRadius: 2,
            }}
          />
        </View>
      ))}
    </Section>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────────
function ButtonSection() {
  const [loading, setLoading] = useState(false);
  const handleLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Section title="🔘 Button">
      <Row label="variant">
        <Flex direction="column" gap={2}>
          <Button variant="primary" size="medium" onPress={() => {}}>Primary</Button>
          <Button variant="secondary" size="medium" onPress={() => {}}>Secondary</Button>
          <Button variant="ghost" size="medium" onPress={() => {}}>Ghost</Button>
          <Button variant="danger" size="medium" onPress={() => {}}>Danger</Button>
        </Flex>
      </Row>

      <Row label="size">
        <Flex direction="column" gap={2}>
          <Button variant="primary" size="small" onPress={() => {}}>Small (36px)</Button>
          <Button variant="primary" size="medium" onPress={() => {}}>Medium (48px)</Button>
          <Button variant="primary" size="large" onPress={() => {}}>Large (56px)</Button>
        </Flex>
      </Row>

      <Row label="상태">
        <Flex direction="column" gap={2}>
          <Button variant="primary" size="medium" disabled onPress={() => {}}>Disabled</Button>
          <Button variant="primary" size="medium" loading={loading} onPress={handleLoad}>
            Loading (탭하면 2초)
          </Button>
          <Button variant="primary" size="large" fullWidth onPress={() => {}}>Full Width</Button>
        </Flex>
      </Row>
    </Section>
  );
}

// ─── TextField ────────────────────────────────────────────────────────────────
function TextFieldSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState('');

  return (
    <Section title="📝 TextField">
      <Row>
        <TextField
          title="이메일"
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </Row>
      <Row>
        <TextField
          title="닉네임"
          placeholder="닉네임 입력"
          value={name}
          onChangeText={setName}
          clearButton
          onClear={() => setName('')}
          maxLength={20}
          description="팀원에게 표시되는 이름"
        />
      </Row>
      <Row>
        <TextField
          title="비밀번호"
          placeholder="8자 이상"
          secureTextEntry
          value={pass}
          onChangeText={setPass}
          errorMessage={
            pass.length > 0 && pass.length < 8 ? '비밀번호는 8자 이상이어야 합니다' : undefined
          }
        />
      </Row>
      <Row>
        <TextField
          title="에러 상태"
          placeholder="에러 예시"
          value={msg}
          onChangeText={setMsg}
          errorMessage="필수 항목입니다"
        />
      </Row>
    </Section>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
function SelectSection() {
  const [position, setPosition] = useState('');
  return (
    <Section title="🔽 Select">
      <Row>
        <Select
          label="포지션"
          placeholder="포지션 선택"
          options={[
            { value: 'FW', label: '공격수 (FW)' },
            { value: 'MF', label: '미드필더 (MF)' },
            { value: 'DF', label: '수비수 (DF)' },
            { value: 'GK', label: '골키퍼 (GK)' },
          ]}
          value={position}
          onChange={setPosition}
        />
      </Row>
      {position !== '' && (
        <TextBox variant="body2" color={colors.grey700} style={{ marginTop: 8 }}>
          선택됨: {position}
        </TextBox>
      )}
    </Section>
  );
}

// ─── Checkbox & Switch ────────────────────────────────────────────────────────
function CheckboxSwitchSection() {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(true);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(true);

  return (
    <Section title="☑️ Checkbox / Switch">
      <Row label="Checkbox">
        <Flex direction="column" gap={3}>
          <Checkbox label="미체크 상태" checked={c1} onChange={setC1} />
          <Checkbox label="체크된 상태" checked={c2} onChange={setC2} />
          <Checkbox label="비활성화" checked disabled />
          <Checkbox label="Indeterminate" checked={false} indeterminate />
        </Flex>
      </Row>
      <Row label="Switch">
        <Flex direction="column" gap={3}>
          <Switch label="꺼진 상태" checked={s1} onChange={setS1} />
          <Switch label="켜진 상태" checked={s2} onChange={setS2} />
          <Switch label="비활성화" checked disabled />
        </Flex>
      </Row>
    </Section>
  );
}

// ─── ListRow ──────────────────────────────────────────────────────────────────
function ListRowSection() {
  return (
    <Section title="📋 ListRow">
      <View style={s.listContainer}>
        <ListRow
          left={<ProfileIcon size={20} color={colors.blue500} />}
          title="홍길동"
          description="미드필더 · 레벨 4"
          right={<ChevronRightIcon size={16} color={colors.grey400} />}
          onClick={() => {}}
        />
        <View style={s.divider} />
        <ListRow
          left={<SettingsIcon size={20} color={colors.grey500} />}
          title="설정"
          right={<ChevronRightIcon size={16} color={colors.grey400} />}
          onClick={() => {}}
        />
        <View style={s.divider} />
        <ListRow
          left={<NotificationIcon size={20} color={colors.grey500} />}
          title="알림 (클릭 없음)"
          description="클릭 핸들러 없는 정적 행"
        />
      </View>
    </Section>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonSection() {
  return (
    <Section title="💀 Skeleton">
      <Flex direction="column" gap={3}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="100%" height={16} />
        <Skeleton width="40%" height={16} />
        <Skeleton width="100%" height={120} borderRadius={12} />
        <Flex direction="row" gap={3} align="center">
          <Skeleton width={48} height={48} borderRadius={24} />
          <Flex direction="column" gap={2} flex={1}>
            <Skeleton width="70%" height={14} />
            <Skeleton width="50%" height={12} />
          </Flex>
        </Flex>
      </Flex>
    </Section>
  );
}

// ─── DfImage ──────────────────────────────────────────────────────────────────
const DEMO_URL = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80';
const BROKEN_URL = 'https://this-url-does-not-exist.invalid/broken.jpg';

function DfImageSection() {
  return (
    <Section title="🖼 DfImage">
      <Row label="AvatarImage">
        <Flex direction="row" gap={4} align="center">
          <Flex direction="column" gap={1} align="center">
            <AvatarImage source={{ uri: DEMO_URL }} />
            <TextBox style={s.colorToken}>서버 URL</TextBox>
          </Flex>
          <Flex direction="column" gap={1} align="center">
            <AvatarImage source={{ uri: BROKEN_URL }} />
            <TextBox style={s.colorToken}>에러</TextBox>
          </Flex>
          <Flex direction="column" gap={1} align="center">
            <AvatarImage source={null} />
            <TextBox style={s.colorToken}>null</TextBox>
          </Flex>
        </Flex>
      </Row>

      <Row label="ThumbnailImage (16:9)">
        <ThumbnailImage source={{ uri: DEMO_URL }} />
      </Row>

      <Row label="ThumbnailImage — 에러">
        <ThumbnailImage source={{ uri: BROKEN_URL }} />
      </Row>

      <Row label="CoverImage (2:1)">
        <CoverImage source={{ uri: DEMO_URL }} />
      </Row>

      <Row label="DfImage — aspectRatio 커스텀 (1:1)">
        <DfImage source={{ uri: DEMO_URL }} aspectRatio={1} />
      </Row>
    </Section>
  );
}

// ─── Modal / Drawer / Dialog ──────────────────────────────────────────────────
function FeedbackSection() {
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [alert, setAlert] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [confirmDestructive, setConfirmDestructive] = useState(false);
  const { toast } = useToast();

  return (
    <Section title="💬 Feedback (Modal / Drawer / Dialog / Toast)">
      <Flex direction="column" gap={2}>
        <Button variant="secondary" size="medium" onPress={() => setModal(true)}>Modal 열기</Button>
        <Button variant="secondary" size="medium" onPress={() => setDrawer(true)}>Drawer 열기</Button>
        <Button variant="secondary" size="medium" onPress={() => setAlert(true)}>AlertDialog 열기</Button>
        <Button variant="secondary" size="medium" onPress={() => setConfirm(true)}>ConfirmDialog 열기</Button>
        <Button variant="danger" size="medium" onPress={() => setConfirmDestructive(true)}>
          ConfirmDialog (파괴적 액션)
        </Button>
      </Flex>

      <Spacing size={2} />

      <TextBox style={s.groupLabel}>Toast</TextBox>
      <Flex direction="row" gap={2} wrap="wrap">
        <Button variant="secondary" size="small" onPress={() => toast.success('저장되었습니다 ✓')}>Success</Button>
        <Button variant="secondary" size="small" onPress={() => toast.error('오류가 발생했습니다')}>Error</Button>
        <Button variant="secondary" size="small" onPress={() => toast.warning('주의가 필요합니다')}>Warning</Button>
        <Button variant="secondary" size="small" onPress={() => toast.info('알림입니다')}>Info</Button>
      </Flex>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="모달 제목">
        <TextBox variant="body2" color={colors.grey700}>
          모달 내용입니다. 여기에 폼이나 정보를 표시할 수 있습니다.
        </TextBox>
        <Spacing size={4} />
        <Button variant="primary" size="medium" fullWidth onPress={() => setModal(false)}>확인</Button>
      </Modal>

      <Drawer isOpen={drawer} onClose={() => setDrawer(false)} title="필터">
        <TextBox variant="body2" color={colors.grey700}>
          드로어 내용입니다. 하단에서 슬라이드 업 됩니다.
        </TextBox>
        <Spacing size={4} />
        <Button variant="primary" size="large" fullWidth onPress={() => setDrawer(false)}>적용</Button>
      </Drawer>

      <AlertDialog
        isOpen={alert}
        onClose={() => setAlert(false)}
        title="알림"
        description="저장이 완료되었습니다."
      />

      <ConfirmDialog
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); toast.success('확인 클릭됨'); }}
        onCancel={() => setConfirm(false)}
        title="확인"
        description="이 작업을 진행하시겠습니까?"
      />

      <ConfirmDialog
        isOpen={confirmDestructive}
        onClose={() => setConfirmDestructive(false)}
        onConfirm={() => { setConfirmDestructive(false); toast.error('삭제됨'); }}
        onCancel={() => setConfirmDestructive(false)}
        title="삭제 확인"
        description="이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        destructive
      />
    </Section>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const iconList = [
  { name: 'Home', Icon: HomeIcon },
  { name: 'Profile', Icon: ProfileIcon },
  { name: 'Search', Icon: SearchIcon },
  { name: 'Settings', Icon: SettingsIcon },
  { name: 'Notification', Icon: NotificationIcon },
  { name: 'Menu', Icon: MenuIcon },
  { name: 'History', Icon: HistoryIcon },
  { name: 'ChevronUp', Icon: ChevronUpIcon },
  { name: 'ChevronDown', Icon: ChevronDownIcon },
  { name: 'ChevronLeft', Icon: ChevronLeftIcon },
  { name: 'ChevronRight', Icon: ChevronRightIcon },
  { name: 'ArrowLeft', Icon: ArrowLeftIcon },
  { name: 'ArrowRight', Icon: ArrowRightIcon },
] as const;

function IconsSection() {
  return (
    <Section title={`🔣 Icons (${iconList.length}개)`}>
      <View style={s.iconGrid}>
        {iconList.map(({ name, Icon }) => (
          <View key={name} style={s.iconItem}>
            <Icon size={24} color={colors.grey700} />
            <TextBox style={s.iconName}>{name}</TextBox>
          </View>
        ))}
      </View>
    </Section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function DesignSystemContent() {
  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={s.header}>
        <Button variant="ghost" size="small" onPress={() => router.back()}>← 뒤로</Button>
        <TextBox style={s.headerTitle}>Design System</TextBox>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ColorsSection />
        <TypographySection />
        <TextBoxSection />
        <SpacingSection />
        <ButtonSection />
        <TextFieldSection />
        <SelectSection />
        <CheckboxSwitchSection />
        <ListRowSection />
        <SkeletonSection />
        <DfImageSection />
        <FeedbackSection />
        <IconsSection />

        <Spacing size={10} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function DesignSystemPage() {
  return (
    <ToastProvider>
      <DesignSystemContent />
    </ToastProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.grey50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  headerTitle: {
    ...typography.body1Bold,
    color: colors.grey900,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },

  // Section
  section: {
    marginBottom: spacing[6],
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.grey100,
  },
  sectionTitle: {
    ...typography.body1Bold,
    color: colors.grey900,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
    backgroundColor: colors.grey50,
  },
  sectionBody: { padding: spacing[4] },

  // Row
  row: { marginBottom: spacing[4] },
  rowLabel: {
    ...typography.captionBold,
    color: colors.grey500,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowContent: {},

  // Group label
  groupLabel: {
    ...typography.captionBold,
    color: colors.grey500,
    marginBottom: spacing[2],
  },

  // Colors
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorItem: { alignItems: 'center', width: 60, marginBottom: 4 },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey200,
    marginBottom: 4,
  },
  colorToken: { ...typography.caption, color: colors.grey700, textAlign: 'center' },
  colorHex: { fontSize: 9, color: colors.grey400, textAlign: 'center' },

  // Typography
  typoItem: {
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenBadge: {
    ...typography.caption,
    color: colors.blue500,
    backgroundColor: colors.blue50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 0,
  },

  // Spacing
  spacingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  spacingLabel: { ...typography.caption, color: colors.grey600, width: 140, flexShrink: 0 },

  // ListRow container
  listContainer: {
    borderWidth: 1,
    borderColor: colors.grey100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: colors.grey100, marginLeft: 52 },

  // Icons
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  iconItem: { width: '18%', alignItems: 'center', paddingVertical: spacing[3], gap: 6 },
  iconName: { fontSize: 9, color: colors.grey500, textAlign: 'center' },
});
