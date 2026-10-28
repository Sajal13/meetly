import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ADMIN_ACCESS_STRATEGY } from '../../config/constants/auth.constants';

/**
 * Validates the admin access token (see auth/admin/strategies).
 * Admin auth is intentionally a completely separate guard/strategy/
 * token pair from user auth — never share tokens between the two.
 * Applied explicitly per-controller on the admin app's routes,
 * not globally, since apps/api serves both the user and admin apps.
 */
@Injectable()
export class AdminAuthGuard extends AuthGuard(ADMIN_ACCESS_STRATEGY) {}
