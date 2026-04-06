import type { TextStyle } from 'react-native';

export const typography = {
  heading1: { fontSize: 22, fontWeight: '700', lineHeight: 31 } as TextStyle,
  heading2: { fontSize: 20, fontWeight: '700', lineHeight: 29 } as TextStyle,
  heading3: { fontSize: 18, fontWeight: '700', lineHeight: 27 } as TextStyle,
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 } as TextStyle,
  body1Bold: { fontSize: 16, fontWeight: '600', lineHeight: 24 } as TextStyle,
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 21 } as TextStyle,
  body2Bold: { fontSize: 14, fontWeight: '600', lineHeight: 21 } as TextStyle,
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 18 } as TextStyle,
  captionBold: { fontSize: 12, fontWeight: '600', lineHeight: 18 } as TextStyle,
  label: { fontSize: 13, fontWeight: '500', lineHeight: 20 } as TextStyle,
} as const;

export type TypographyToken = keyof typeof typography;
