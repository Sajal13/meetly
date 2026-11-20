import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { verify as verifyTotp } from 'otplib';
import { Repository } from 'typeorm';
import { Admin } from '@admin/entities/admin.entity';
import { AdminService } from '@admin/admin.service';
import { Unauthorized } from '@common/exceptions/auth.errors';
import { TokenService } from '@auth/tokens/token.service';
import {
  AuthTokens,
  RefreshContext,
  SessionMeta
} from '@common/types/auth.types';

export type AdminLoginResult =
  | ({ mfaRequired: false } & AuthTokens)
  | { mfaRequired: true; mfaToken: string };

const DUMMY_HASH = bcrypt.hashSync(
  'ac5bb629d064b3dea48e03585501e0e67d7464b70c06f61bbc15c4ad1dc0d958',
  12
);

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly admin: Repository<Admin>,
    private readonly adminService: AdminService,
    private readonly tokens: TokenService
  ) {}

  async login(
    email: string,
    password: string,
    meta: SessionMeta
  ): Promise<AdminLoginResult> {
    const admin = await this.admin.findOne({ where: { email } });
    const valid = await bcrypt.compare(
      password,
      admin?.passwordHash ?? DUMMY_HASH
    );

    if (!admin || !valid || !admin.isActive) {
      throw Unauthorized('Invalid Credentials.');
    }

    if (admin.mfaEnabled) {
      return {
        mfaRequired: true,
        mfaToken: await this.tokens.signMfaToken(admin.id)
      };
    }

    return { mfaRequired: false, ...(await this.issue(admin.id, meta)) };
  }

  async verifyMfa(
    mfaToken: string,
    code: string,
    meta: SessionMeta
  ): Promise<AuthTokens> {
    const adminId = await this.tokens.verifyMfaToken(mfaToken);
    const admin = await this.admin.findOne({ where: { id: adminId } });

    if (!admin || !admin.isActive || !admin.mfaEnabled || !admin.mfaSecret) {
      throw Unauthorized('Invalid MFA request.');
    }

    const result = await verifyTotp({
      secret: admin.mfaSecret,
      token: code,
      epochTolerance: 30
    });

    if (!result.valid) {
      throw Unauthorized('Invalid MFA request.');
    }

    return this.issue(admin.id, meta);
  }

  async refresh(ctx: RefreshContext, meta: SessionMeta): Promise<AuthTokens> {
    await this.tokens.consumeRefresh(ctx, ctx.refreshToken);

    const admin = await this.adminService.findAdmin(ctx.sub);
    if (!admin?.isActive) {
      throw Unauthorized('Admin is not active.');
    }

    return this.issue(admin.id, meta);
  }

  async logout(ctx: RefreshContext, allDevices = false): Promise<void> {
    if (allDevices) return this.tokens.revokeAll(ctx.sub, 'admin');

    return this.tokens.revokeRefresh(ctx);
  }

  private issue(adminId: string, meta: SessionMeta) {
    return this.tokens.issueTokens({ id: adminId, type: 'admin' }, meta);
  }
}
