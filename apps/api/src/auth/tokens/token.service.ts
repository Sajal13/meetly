import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import type { AccessTokenPayload } from '@common/types/auth.types';
import { Unauthorized } from '@common/exceptions/auth.errors';
import { TokenRepository } from './token.repository';
import type {
  AdminMfaPayload,
  AuthTokens,
  RefreshTokenPayload,
  SessionMeta,
  SubjectType
} from '@common/types/auth.types';
import { AppConfigService } from '@config/config.service';
import { ttlToMs, ttlToSeconds } from '@common/utils/ttl.util';
import { ErrorCode } from '@common/exceptions/error-codes';

interface Subject {
  id: string;
  type: SubjectType;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
    private readonly repo: TokenRepository
  ) {}

  private settings(type: SubjectType) {
    return type === 'admin' ? this.config.adminAuth : this.config.userAuth;
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async issueTokens(
    subject: Subject,
    meta: SessionMeta = {}
  ): Promise<AuthTokens> {
    const { id, type } = subject;

    const { accessSecret, refreshSecret, accessTtl, refreshTtl } =
      this.settings(type);

    const refreshId = randomUUID();

    const accessPayload: AccessTokenPayload = { sub: id, type };
    const refreshPayload: RefreshTokenPayload = {
      sub: id,
      type,
      jti: refreshId
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: accessTtl
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshTtl
      })
    ]);

    await this.repo.create({
      id: refreshId,
      subjectId: id,
      subjectType: type,
      tokenHash: this.hash(refreshToken),
      expiresAt: new Date(Date.now() + ttlToMs(refreshTtl)),
      userAgent: meta.userAgent?.slice(0, 512) ?? null,
      ip: meta?.ip ?? null
    });

    return {
      accessToken,
      refreshToken,
      accessExpiresIn: ttlToSeconds(accessTtl),
      refreshExpiresIn: ttlToSeconds(refreshTtl)
    };
  }

  async consumeRefresh(
    payload: RefreshTokenPayload,
    rawToken: string
  ): Promise<void> {
    const row = await this.repo.findById(payload.jti);

    if (
      !row ||
      row.subjectId !== payload.sub ||
      row.subjectType !== payload.type ||
      row.tokenHash !== this.hash(rawToken)
    ) {
      throw Unauthorized('Invalid refresh token.');
    }

    if (row.expiresAt.getTime() < Date.now()) {
      throw Unauthorized('Refresh token expired.');
    }

    const revoked = await this.repo.revokeIfActive(row.id);

    if (!revoked) {
      await this.repo.revokeAllForSubject(row.subjectId, row.subjectType);
      throw Unauthorized('Refresh token reuse detected.');
    }
  }

  async revokeRefresh(payload: RefreshTokenPayload): Promise<void> {
    await this.repo.revokeIfActive(payload.jti);
  }

  async revokeAll(subjectId: string, type: SubjectType): Promise<void> {
    await this.repo.revokeAllForSubject(subjectId, type);
  }

  signMfaToken(adminId: string): Promise<string> {
    const { mfaSecret, mfaTtl } = this.config.adminAuth;

    const payload: AdminMfaPayload = { sub: adminId, purpose: 'admin-mfa' };

    return this.jwt.signAsync(payload, {
      secret: mfaSecret,
      expiresIn: mfaTtl
    });
  }

  async verifyMfaToken(token: string): Promise<string> {
    try {
      const payload = await this.jwt.verifyAsync<AdminMfaPayload>(token, {
        secret: this.config.adminAuth.mfaSecret
      });

      if (payload.purpose !== 'admin-mfa')
        throw new BadRequestException({
          message: 'Bad Purpose',
          code: ErrorCode.BAD_REQUEST
        });

      return payload.sub;
    } catch {
      throw Unauthorized('Invalid or expired MFA token.');
    }
  }
}
