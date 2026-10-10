import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

interface AuthBlock {
  accessSecret: string;
  accessTtl: string;
  refreshSecret: string;
  refreshTtl: string;
}

/**
 * Thin typed wrapper around @nestjs/config so the rest of the app
 * never touches process.env or raw string paths directly.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: NestConfigService) {}

  get env(): string {
    return this.config.get<string>('env')!;
  }

  get isProduction(): boolean {
    return this.env === 'production';
  }

  get isStaging(): boolean {
    return this.env === 'staging';
  }

  /** True for anything that isn't a developer's own machine running the app directly. */
  get isProdLike(): boolean {
    return this.isProduction || this.isStaging;
  }

  get port(): number {
    return this.config.get<number>('port')!;
  }

  /** Full Postgres config (individual parts + the connection URL TypeORM actually uses). */
  get database(): {
    db: string;
    username: string;
    password: string;
    port: number;
    url: string;
  } {
    return this.config.get('database')!;
  }

  /** Convenience accessor — this is what DatabaseModule actually connects with. */
  get databaseUrl(): string {
    return this.database.url;
  }

  get redis(): { url: string; port: number } {
    return this.config.get('redis')!;
  }

  get redisUrl(): string {
    return this.redis.url;
  }

  get userAuth(): AuthBlock {
    return this.config.get('auth.user')!;
  }

  get adminAuth(): AuthBlock {
    return this.config.get('auth.admin')!;
  }

  get otp(): { gmailUser: string; gmailAppPassword: string } {
    return this.config.get('auth.otp')!;
  }

  /** MinIO's own admin-ish config (root creds, ports, bucket) — see configuration.ts for why this is separate from `storage`. */
  get minio(): {
    rootUser: string;
    rootPassword: string;
    apiPort: number;
    consolePort: number;
    bucket: string;
  } {
    return this.config.get('minio')!;
  }

  /** Generic S3-compatible client config — points at MinIO locally, real AWS S3 in prod. */
  get storage(): {
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    forcePathStyle: boolean;
    publicBaseUrl: string;
  } {
    return this.config.get('storage')!;
  }

  /** Explicit origin allowlist, or undefined meaning "reflect any origin" (dev only — see env.validation.ts). */
  get corsOrigins(): string[] | undefined {
    return this.config.get<string[] | undefined>('security.corsOrigins');
  }

  get trustProxyHops(): number {
    return this.config.get<number>('security.trustProxyHops')!;
  }

  get bodySizeLimit(): string {
    return this.config.get<string>('security.bodySizeLimit')!;
  }

  get rateLimit(): { ttlMs: number; max: number } {
    return this.config.get('security.rateLimit')!;
  }
}
