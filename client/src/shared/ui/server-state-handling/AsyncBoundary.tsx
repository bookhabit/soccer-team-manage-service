import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ReactNode, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingFallback from './LoadingFallback';

interface Props {
  children: ReactNode;
  loadingFallback?: ReactNode;
}

export default function AsyncBoundary({ children, loadingFallback }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset}>
          <Suspense fallback={loadingFallback ?? <LoadingFallback />}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
