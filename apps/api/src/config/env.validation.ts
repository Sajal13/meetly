import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  validateSync
} from 'class-validator';

enum Environment {
  Development = 'development',
  Test = 'test',
  Staging = 'staging',
  Production = 'production'
}

/**
 * Typed environment contract for the API.
 * Mirrors docs/14-operations/env-contract.md and the root .env /
 * infrastructure/docker/docker-compose.yml naming.
 * Anything required to boot the app must be validated here —
 * fail fast at startup rather than at first use.
 */
class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  API_PORT: number = 4000;

  // --- Database ---
  // DATABASE_URL is what the app actually connects with; the POSTGRES_*
  // parts are validated too so a typo/missing one is caught at boot even
  // though only docker-compose's healthcheck currently reads them directly.
  @IsString()
  POSTGRES_DB: string;

  @IsString()
  POSTGRES_USER: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsOptional()
  @IsInt()
  POSTGRES_PORT: number = 5432;

  @IsString()
  DATABASE_URL: string;

  // --- Redis / BullMQ ---
  @IsString()
  REDIS_URL: string;

  @IsOptional()
  @IsInt()
  REDIS_PORT: number = 6379;

  // --- Authentication ---
  @IsString()
  USER_ACCESS_TOKEN_SECRET: string;

  @IsString()
  USER_ACCESS_TOKEN_TTL: string = '15m';

  @IsString()
  USER_REFRESH_TOKEN_SECRET: string;

  @IsString()
  USER_REFRESH_TOKEN_TTL: string = '30d';

  @IsString()
  ADMIN_ACCESS_TOKEN_SECRET: string;

  @IsString()
  ADMIN_ACCESS_TOKEN_TTL: string = '30m';

  @IsString()
  ADMIN_REFRESH_TOKEN_SECRET: string;

  @IsString()
  ADMIN_REFRESH_TOKEN_TTL: string = '7d';

  // --- OTP delivery (Gmail SMTP) ---
  @IsOptional()
  @IsString()
  GMAIL_USER?: string;

  @IsOptional()
  @IsString()
  GMAIL_APP_PASSWORD?: string;

  // --- MinIO ---
  @IsString()
  MINIO_ROOT_USER: string;

  @IsString()
  MINIO_ROOT_PASSWORD: string;

  @IsOptional()
  @IsInt()
  MINIO_API_PORT: number = 9000;

  @IsOptional()
  @IsInt()
  MINIO_CONSOLE_PORT: number = 9001;

  @IsString()
  MINIO_BUCKET: string;

  // --- Object storage (generic S3-compatible client config) ---
  @IsString()
  S3_ENDPOINT: string;

  @IsString()
  S3_REGION: string = 'us-east-1';

  @IsString()
  S3_ACCESS_KEY_ID: string;

  @IsString()
  S3_SECRET_ACCESS_KEY: string;

  @IsOptional()
  @IsBooleanString()
  S3_FORCE_PATH_STYLE?: string = 'true';

  /** Public base URL for reading objects back (CDN in prod, MinIO console/API in dev). */
  @IsOptional()
  @IsString()
  S3_PUBLIC_BASE_URL?: string;

  // --- Security / hardening ---

  /**
   * Comma-separated allowlist of origins allowed to call the API with
   * credentials (e.g. "https://meetly.app,https://admin.meetly.app").
   * Left unset in development, where all origins are reflected so the
   * web/mobile/admin apps can hit a local API without extra config.
   * MUST be set explicitly in staging/production — see the `validate()`
   * check below, which refuses to boot without it.
   */
  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  /**
   * Number of reverse-proxy hops in front of the API (nginx, ALB,
   * Cloudflare, etc). Passed to Express's `trust proxy` setting so
   * X-Forwarded-For is parsed for exactly that many trusted hops —
   * setting this too high (or to `true`/unbounded) lets a client spoof
   * their own IP by forging X-Forwarded-For.
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  TRUST_PROXY_HOPS: number = 1;

  /** Max JSON/urlencoded request body size, e.g. "1mb". */
  @IsOptional()
  @IsString()
  BODY_SIZE_LIMIT: string = '1mb';

  /** Global rate-limit window, in milliseconds. */
  @IsOptional()
  @IsInt()
  @Min(1000)
  RATE_LIMIT_TTL_MS: number = 60_000;

  /** Max requests per window per client, applied globally (endpoint-specific @Throttle() overrides can be stricter). */
  @IsOptional()
  @IsInt()
  @Min(1)
  RATE_LIMIT_MAX: number = 100;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('\n')}`
    );
  }

  // Fail fast in prod/staging rather than silently reflecting every
  // Origin header — see CORS_ORIGIN doc comment above.
  const isProdLike =
    validatedConfig.NODE_ENV === Environment.Production ||
    validatedConfig.NODE_ENV === Environment.Staging;
  if (isProdLike && !validatedConfig.CORS_ORIGIN) {
    throw new Error(
      'CORS_ORIGIN must be set to an explicit comma-separated allowlist in staging/production.'
    );
  }

  return validatedConfig;
}
