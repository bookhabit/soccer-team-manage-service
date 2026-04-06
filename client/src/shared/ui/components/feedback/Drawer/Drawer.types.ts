import type { ReactNode } from 'react';

export type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};
