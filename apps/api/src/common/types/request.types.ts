import { Request } from 'express';
import { AdminAuthContext, UserAuthContext } from './auth.types';

export interface AuthenticatedUserRequest extends Request {
  user: UserAuthContext;
}

export interface AuthenticatedAdminRequest extends Request {
  admin: AdminAuthContext;
}
