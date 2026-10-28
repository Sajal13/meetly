import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { USER_ACCESS_STRATEGY } from '../../config/constants/auth.constants';

/**
 * Validates the end-user access token (see auth/user/strategies).
 * Applied globally in AppModule so every route is authenticated by
 * default unless explicitly marked @Public().
 */
@Injectable()
export class UserAuthGuard extends AuthGuard(USER_ACCESS_STRATEGY) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
