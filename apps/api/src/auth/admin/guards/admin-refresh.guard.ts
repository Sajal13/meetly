import { ADMIN_REFRESH_STRATEGY } from '@config/constants/auth.constants';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminRefreshGuard extends AuthGuard(ADMIN_REFRESH_STRATEGY) {}
