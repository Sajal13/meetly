import { AppConfigService } from '@config/config.service';
import { ADMIN_REFRESH_STRATEGY } from '@config/constants/auth.constants';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { RefreshContext, RefreshTokenPayload } from '@common/types/auth.types';
import { Unauthorized } from '@common/exceptions/auth.errors';

@Injectable()
export class AdminRefreshStrategy extends PassportStrategy(
  Strategy,
  ADMIN_REFRESH_STRATEGY
) {
  constructor(config: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.adminAuth.refreshSecret,
      passReqToCallback: true
    });
  }

  validate(req: Request, payload: RefreshTokenPayload): RefreshContext {
    if (payload.type !== 'admin' || !payload.jti) {
      throw Unauthorized('Invalid token type', {
        expected: 'admin',
        received: payload.type
      });
    }

    return { ...payload, refreshToken: req.body.refreshToken };
  }
}
