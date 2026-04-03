import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 전역 JwtAuthGuard를 우회합니다.
 * 인증 불필요 엔드포인트에만 명시적으로 붙입니다.
 * 기본값은 "인증 필요" — 누락 사고 방지.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
