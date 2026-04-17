import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '../enums/admin-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface AuthInfo {
  id: number;
  role?: AdminRole;
  type: 'admin' | 'customer';
}

interface RequestUser {
  _info?: AuthInfo;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;
    const userInfo = user?._info;

    if (!userInfo) {
      throw new ForbiddenException('User not authenticated');
    }

    if (userInfo.type !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    if (!userInfo.role) {
      throw new ForbiddenException('User role not found');
    }

    const hasRole = requiredRoles.some(
      (requiredRole) => userInfo.role?.toUpperCase() === requiredRole.toUpperCase(),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `This endpoint requires one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
