import type { ReactNode } from 'react';

export type ListRowProps = {
  left?: ReactNode;
  title: string;
  description?: string;
  right?: ReactNode;
  onClick?: () => void;
};
