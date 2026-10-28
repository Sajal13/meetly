import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUserRequest } from '../types/request.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedUserRequest>();
    return request.user;
  }
);
