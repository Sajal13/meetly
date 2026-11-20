import { ADMIN_ACCESS_STRATEGY } from '@config/constants/auth.constants';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminAccessGuard extends AuthGuard(ADMIN_ACCESS_STRATEGY) {}
