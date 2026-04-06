import type { ReactNode } from 'react';

export type BottomCTASingleProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  safeArea?: boolean;
};

export type BottomCTADoubleProps = {
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
};

export type FixedBottomCTAProps = {
  children: ReactNode;
  safeArea?: boolean;
};
