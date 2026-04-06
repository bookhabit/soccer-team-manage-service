export const FONTS = {
  // Pretendard
  PRETENDARD_REGULAR: 'Pretendard-Regular',
  PRETENDARD_BOLD: 'Pretendard-Bold',
  PRETENDARD_LIGHT: 'Pretendard-Light',

  // Roboto
  ROBOTO_BOLD: 'Roboto-Bold',
  ROBOTO_REGULAR: 'Roboto-Regular',
  ROBOTO_LIGHT: 'Roboto-Light',

  // BMJUA
  BMJUA: 'BMJUA',
} as const;

export type FontKeys = keyof typeof FONTS;
