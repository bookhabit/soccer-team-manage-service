import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { ToastContainer } from './Toast';
import type { ToastItem, ToastType } from './Toast.types';

type ToastContextValue = {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 3000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return {
    toast: {
      success: (msg: string, duration?: number) => ctx.addToast('success', msg, duration),
      error: (msg: string, duration?: number) => ctx.addToast('error', msg, duration),
      warning: (msg: string, duration?: number) => ctx.addToast('warning', msg, duration),
      info: (msg: string, duration?: number) => ctx.addToast('info', msg, duration),
    },
  };
}
