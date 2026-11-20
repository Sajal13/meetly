import { AppConfigService } from '@config/config.service';
import { Injectable, Logger } from '@nestjs/common';
import { OtpRepository } from './otp.repository';
import { TooManyRequests, Unauthorized } from '@common/exceptions/auth.errors';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly ttlMs: number;
  private readonly cooldownMs: number;
  private readonly maxAttempts: number;
  private readonly secret: string;
  private readonly logCodes: boolean;

  constructor(
    config: AppConfigService,
    private readonly repo: OtpRepository
  ) {
    const otp = config.otp;
    this.logCodes = !config.isProdLike;
    this.ttlMs = otp.ttlSeconds * 1000;
    this.cooldownMs = otp.resendCooldownSeconds * 1000;
    this.maxAttempts = otp.maxAttempts;
    this.secret = otp.hmacSecret;
  }

  async request(identifier: string): Promise<{ expiresInSeconds: number }> {
    const latest = await this.repo.findLatest(identifier);

    if (latest && Date.now() - latest.createdAt.getTime() < this.cooldownMs) {
      throw TooManyRequests('Please wait before requesting another code.');
    }

    await this.repo.invalidateAll(identifier);

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');

    await this.repo.create({
      identifier,
      codeHash: this.hash(identifier, code),
      expiresAt: new Date(Date.now() + this.ttlMs)
    });

    await this.deliver(identifier, code);
    return { expiresInSeconds: Math.floor(this.ttlMs / 1000) };
  }

  async verify(identifier: string, code: string): Promise<void> {
    const otp = await this.repo.findActive(identifier);

    if (!otp || otp.expiresAt.getTime() < Date.now()) {
      throw Unauthorized('Invalid or expired code');
    }

    if (otp.attempts >= this.maxAttempts) {
      throw TooManyRequests('Too many attempts, request a new code.');
    }

    const expected = Buffer.from(otp.codeHash);
    const actual = Buffer.from(this.hash(identifier, code));

    const ok =
      expected.length === actual.length && timingSafeEqual(expected, actual);

    if (!ok) {
      await this.repo.incrementAttempts(otp.id);
      throw Unauthorized('Invalid or expired code.');
    }

    const consumed = await this.repo.consume(otp.id);
    if (!consumed) throw Unauthorized('Invalid or expired code.');
  }

  private hash(identifier: string, code: string): string {
    return createHmac('sha256', this.secret)
      .update(`${identifier}: ${code}`)
      .digest('hex');
  }

  private async deliver(identifier: string, code: string): Promise<void> {
    if (this.logCodes) {
      this.logger.debug(`OTP for ${identifier}: ${code}`);
    }
  }
}
