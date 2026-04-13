// 포메이션 슬롯 — 서버 FormationSlot enum과 1:1 대응
export type FormationSlot =
  | 'GK'
  // 수비
  | 'LB' | 'LCB' | 'CB' | 'RCB' | 'RB'
  | 'LWB' | 'RWB'
  // 수비형 미드필더
  | 'LDM' | 'CDM' | 'RDM'
  // 중앙 미드필더
  | 'LM' | 'LCM' | 'CM' | 'RCM' | 'RM'
  // 공격형 미드필더
  | 'LAM' | 'CAM' | 'RAM'
  // 공격
  | 'LW' | 'RW' | 'LF' | 'RF' | 'LS' | 'RS' | 'ST';

export interface FormationConfig {
  forward?: FormationSlot[];
  attacking?: FormationSlot[];
  midfield?: FormationSlot[];
  defensive?: FormationSlot[];
  defense: FormationSlot[];
}

export const FORMATION_CONFIG: Record<string, FormationConfig> = {
  '4-4-2': {
    forward: ['LS', 'RS'],
    midfield: ['LM', 'LCM', 'RCM', 'RM'],
    defense: ['LB', 'LCB', 'RCB', 'RB'],
  },
  '4-3-3': {
    forward: ['LW', 'ST', 'RW'],
    midfield: ['LCM', 'CM', 'RCM'],
    defense: ['LB', 'LCB', 'RCB', 'RB'],
  },
  '4-2-3-1': {
    forward: ['ST'],
    attacking: ['LAM', 'CAM', 'RAM'],
    defensive: ['LDM', 'RDM'],
    defense: ['LB', 'LCB', 'RCB', 'RB'],
  },
  '4-1-4-1': {
    forward: ['ST'],
    midfield: ['LM', 'LCM', 'RCM', 'RM'],
    defensive: ['CDM'],
    defense: ['LB', 'LCB', 'RCB', 'RB'],
  },
  '4-5-1': {
    forward: ['ST'],
    midfield: ['LM', 'LCM', 'CM', 'RCM', 'RM'],
    defense: ['LB', 'LCB', 'RCB', 'RB'],
  },
  '3-5-2': {
    forward: ['LS', 'RS'],
    midfield: ['LWB', 'LCM', 'CM', 'RCM', 'RWB'],
    defense: ['LCB', 'CB', 'RCB'],
  },
  '3-4-3': {
    forward: ['LW', 'ST', 'RW'],
    midfield: ['LM', 'LCM', 'RCM', 'RM'],
    defense: ['LCB', 'CB', 'RCB'],
  },
  '3-4-2-1': {
    forward: ['ST'],
    attacking: ['LAM', 'RAM'],
    midfield: ['LM', 'LCM', 'RCM', 'RM'],
    defense: ['LCB', 'CB', 'RCB'],
  },
  '3-4-1-2': {
    forward: ['LS', 'RS'],
    attacking: ['CAM'],
    midfield: ['LM', 'LCM', 'RCM', 'RM'],
    defense: ['LCB', 'CB', 'RCB'],
  },
  '5-3-2': {
    forward: ['LS', 'RS'],
    midfield: ['LCM', 'CM', 'RCM'],
    defense: ['LWB', 'LCB', 'CB', 'RCB', 'RWB'],
  },
  '5-4-1': {
    forward: ['ST'],
    midfield: ['LM', 'LCM', 'RCM', 'RM'],
    defense: ['LWB', 'LCB', 'CB', 'RCB', 'RWB'],
  },
  '5-2-3': {
    forward: ['LW', 'ST', 'RW'],
    midfield: ['LCM', 'RCM'],
    defense: ['LWB', 'LCB', 'CB', 'RCB', 'RWB'],
  },
  '4-3-1-2': {
    forward: ['LS', 'RS'],
    attacking: ['CAM'],
    midfield: ['LCM', 'CM', 'RCM'],
    defense: ['LB', 'LCB', 'RCB', 'RB'],
  },
  '4-2-2-2': {
    forward: ['LS', 'RS'],
    attacking: ['LAM', 'RAM'],
    defensive: ['LDM', 'RDM'],
    defense: ['LB', 'LCB', 'RCB', 'RB'],
  },
  '4-1-2-1-2': {
    forward: ['LS', 'RS'],
    attacking: ['CAM'],
    midfield: ['LCM', 'RCM'],
    defensive: ['CDM'],
    defense: ['LB', 'LCB', 'RCB', 'RB'],
  },
  '4-6-0': {
    midfield: ['LW', 'LAM', 'LCM', 'RCM', 'RAM', 'RW'],
    defense: ['LB', 'LCB', 'RCB', 'RB'],
  },
  '3-6-1': {
    forward: ['ST'],
    midfield: ['LW', 'LWB', 'LCM', 'RCM', 'RWB', 'RW'],
    defense: ['LCB', 'CB', 'RCB'],
  },
  '2-3-5': {
    forward: ['LW', 'LF', 'ST', 'RF', 'RW'],
    midfield: ['LCM', 'CM', 'RCM'],
    defense: ['LCB', 'RCB'],
  },
  '2-3-2-3': {
    forward: ['LW', 'ST', 'RW'],
    attacking: ['LAM', 'RAM'],
    midfield: ['LCM', 'CM', 'RCM'],
    defense: ['LCB', 'RCB'],
  },
  '4-1-3-2': {
    forward: ['LS', 'RS'],
    attacking: ['LAM', 'CAM', 'RAM'],
    defensive: ['CDM'],
    defense: ['LB', 'LCB', 'RCB', 'RB'],
  },
};

// 포메이션 선택 목록 (UI용)
export const FORMATION_LIST = Object.keys(FORMATION_CONFIG);

// 포메이션 → 슬롯 목록 반환 (GK 자동 포함)
export function getFormationSlots(formation: string): FormationSlot[] {
  const config = FORMATION_CONFIG[formation] ?? FORMATION_CONFIG['4-3-3']!;
  return [
    'GK',
    ...(config.defense ?? []),
    ...(config.defensive ?? []),
    ...(config.midfield ?? []),
    ...(config.attacking ?? []),
    ...(config.forward ?? []),
  ];
}

// 슬롯의 라인 구분 (피치 렌더링용)
export function getSlotLine(slot: FormationSlot): keyof FormationConfig | 'gk' {
  if (slot === 'GK') return 'gk';
  if (['LB', 'LCB', 'CB', 'RCB', 'RB', 'LWB', 'RWB'].includes(slot)) return 'defense';
  if (['LDM', 'CDM', 'RDM'].includes(slot)) return 'defensive';
  if (['LM', 'LCM', 'CM', 'RCM', 'RM'].includes(slot)) return 'midfield';
  if (['LAM', 'CAM', 'RAM'].includes(slot)) return 'attacking';
  return 'forward';
}
