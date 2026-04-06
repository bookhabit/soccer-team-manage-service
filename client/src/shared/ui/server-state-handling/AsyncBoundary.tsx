import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ReactNode, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingFallback from './LoadingFallback';

interface Props {
  children: ReactNode;
}

export default function AsyncBoundary({ children }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset}>
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
