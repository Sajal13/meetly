import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from '@config/config.service';
import { ADMIN_ACCESS_STRATEGY } from '@config/constants/auth.constants';
import { AccessTokenPayload, AdminAuthContext } from '@common/types/auth.types';
import { ErrorCode } from '@common/exceptions/error-codes';
import { AdminService } from '@admin/admin.service';

@Injectable()
export class AdminAccessStrategy extends PassportStrategy(
  Strategy,
  ADMIN_ACCESS_STRATEGY
) {
  constructor(
    config: AppConfigService,
    private readonly adminService: AdminService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.adminAuth.accessSecret
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AdminAuthContext> {
    if (payload.type !== 'admin') {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Invalid token type',
        details: { expected: 'admin', received: payload.type }
      });
    }

    const admin = await this.adminService.findAdmin(payload.sub);

    if (!admin?.isActive) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Admin is not active.',
        details: { expected: 'admin', received: payload.type }
      });
    }

    const permissions = new Set<string>();

    for (const role of admin.roles) {
      for (const permission of role.permissions ?? []) {
        permissions.add(permission.key);
      }
    }

    return {
      id: admin.id,
      email: admin.email,
      roleIds: admin.roles.map((r) => r.id),
      roles: admin.roles.map((r) => r.name),
      permissions: [...permissions]
    };
  }
}
