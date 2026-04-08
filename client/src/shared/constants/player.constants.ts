import type { SelectOption } from '../ui/components/general/Select/Select.types';

// ─── Select 옵션 (폼 드롭다운용) ─────────────────────────────────────────────

export const POSITION_OPTIONS: SelectOption[] = [
  { value: 'FW', label: '공격수 (FW)' },
  { value: 'MF', label: '미드필더 (MF)' },
  { value: 'DF', label: '수비수 (DF)' },
  { value: 'GK', label: '골키퍼 (GK)' },
];

export const FOOT_OPTIONS: SelectOption[] = [
  { value: 'RIGHT', label: '오른발' },
  { value: 'LEFT', label: '왼발' },
  { value: 'BOTH', label: '양발' },
];

export const LEVEL_OPTIONS: SelectOption[] = [
  { value: 'BEGINNER', label: '입문 (풋살 입문자)' },
  { value: 'AMATEUR', label: '아마추어 (동호회 수준)' },
  { value: 'SEMI_PRO', label: '세미프로 (실업팀 수준)' },
  { value: 'PRO', label: '프로 (선수 출신)' },
];

export const GENDER_OPTIONS: SelectOption[] = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

// ─── 표시용 Label 맵 (읽기 전용 텍스트 렌더링용) ─────────────────────────────

export const POSITION_LABEL: Record<string, string> = {
  FW: '공격수',
  MF: '미드필더',
  DF: '수비수',
  GK: '골키퍼',
};

export const FOOT_LABEL: Record<string, string> = {
  LEFT: '왼발',
  RIGHT: '오른발',
  BOTH: '양발',
};

export const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: '입문',
  AMATEUR: '아마추어',
  SEMI_PRO: '세미프로',
  PRO: '프로',
};
