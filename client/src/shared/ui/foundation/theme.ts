import { colors } from './colors';
import { spacing } from './spacing';

export const theme = {
  colors,
  spacing,
} as const;

export type Theme = typeof theme;
