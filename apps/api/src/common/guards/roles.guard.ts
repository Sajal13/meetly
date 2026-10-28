import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedAdminRequest } from '../types/request.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedAdminRequest>();
    const roleIds = new Set(request.admin?.roleIds ?? []);
    const hasAny = requiredRoles.some((r) => roleIds.has(r));

    if (!hasAny) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_ROLE',
        message: 'You do not have the required role for this action'
      });
    }

    return true;
  }
}
