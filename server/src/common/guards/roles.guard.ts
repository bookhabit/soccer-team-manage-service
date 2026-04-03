import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, type Role } from '../decorators/roles.decorator';
import type { JwtPayload } from './jwt-auth.guard';
import type { Request } from 'express';

/**
 * @Roles('CAPTAIN') 데코레이터가 있는 라우트에만 적용.
 * JwtAuthGuard 이후 실행 — request.user가 세팅된 상태에서 roles 검사.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // @Roles 없으면 통과
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<Request & { user: JwtPayload & { roles?: Role[] } }>();

    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('권한이 없습니다.');
    }
    return true;
  }
}
