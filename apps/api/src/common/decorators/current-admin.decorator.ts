import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedAdminRequest } from '../types/request.types';

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedAdminRequest>();
    return request.admin;
  }
);
