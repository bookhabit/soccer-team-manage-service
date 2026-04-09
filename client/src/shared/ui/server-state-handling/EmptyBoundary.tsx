import { ReactNode } from 'react';

interface EmptyBoundaryProps {
  data: unknown;
  fallback: ReactNode;
  children: ReactNode;
}

function isEmpty(data: unknown): boolean {
  if (data == null) return true;
  if (Array.isArray(data) && data.length === 0) return true;
  return false;
}

/**
 * data가 null / undefined / 빈 배열이면 fallback을 렌더링한다.
 * 로딩·에러는 AsyncBoundary가 처리하므로 이 컴포넌트는 데이터 존재 여부만 담당한다.
 *
 * @example
 * <EmptyBoundary data={club} fallback={<NoClubView />}>
 *   <ClubTabView club={club!} />
 * </EmptyBoundary>
 */
export function EmptyBoundary({ data, fallback, children }: EmptyBoundaryProps) {
  return isEmpty(data) ? <>{fallback}</> : <>{children}</>;
}
