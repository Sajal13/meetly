export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.API_PORT ?? '4000', 10),

  database: {
    db: process.env.POSTGRES_DB ?? 'meetly',
    username: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? '',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    // url is what TypeORM actually connects with (see database.module.ts);
    // the fields above are kept around for anything that needs the parts
    // individually (health checks, docker healthchecks, etc).
    url: process.env.DATABASE_URL ?? ''
  },

  redis: {
    url: process.env.REDIS_URL ?? '',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10)
  },

  auth: {
    user: {
      accessSecret: process.env.USER_ACCESS_TOKEN_SECRET ?? '',
      accessTtl: process.env.USER_ACCESS_TOKEN_TTL ?? '15m',
      refreshSecret: process.env.USER_REFRESH_TOKEN_SECRET ?? '',
      refreshTtl: process.env.USER_REFRESH_TOKEN_TTL ?? '30d'
    },
    admin: {
      accessSecret: process.env.ADMIN_ACCESS_TOKEN_SECRET ?? '',
      accessTtl: process.env.ADMIN_ACCESS_TOKEN_TTL ?? '30m',
      refreshSecret: process.env.ADMIN_REFRESH_TOKEN_SECRET ?? '',
      refreshTtl: process.env.ADMIN_REFRESH_TOKEN_TTL ?? '7d',
      mfaSecret: process.env.ADMIN_MFA_SECRET_TOKEN ?? '',
      mfaTtl: process.env.ADMIN_MFA_SECRET_TOKEN_TTL ?? '7d'
    },
    otp: {
      gmailUser: process.env.GMAIL_USER ?? '',
      gmailAppPassword: process.env.GMAIL_APP_PASSWORD ?? '',
      hmacSecret: process.env.OTP_HMAC_SECRET ?? '',
      ttlSeconds: parseInt(process.env.OTP_TTL_SECONDS ?? '300', 10),
      resendCooldownSeconds: parseInt(
        process.env.OTP_RESEND_COOLDOWN_SECONDS ?? '60',
        10
      ),
      maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10)
    }
  },

  // MinIO-specific connection details (root user/password, ports, bucket
  // name) as MinIO sees them. Kept separate from `storage` below because
  // that one is shaped for the generic S3 client (works against AWS S3
  // too, just by changing env vars) — this one is MinIO's own admin-ish
  // surface, e.g. useful for building a console URL or talking to `mc`.
  minio: {
    rootUser: process.env.MINIO_ROOT_USER ?? 'meetly',
    rootPassword: process.env.MINIO_ROOT_PASSWORD ?? '',
    apiPort: parseInt(process.env.MINIO_API_PORT ?? '9000', 10),
    consolePort: parseInt(process.env.MINIO_CONSOLE_PORT ?? '9001', 10),
    bucket: process.env.MINIO_BUCKET ?? 'meetly'
  },

  storage: {
    endpoint: process.env.S3_ENDPOINT ?? '',
    region: process.env.S3_REGION ?? 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
    bucket: process.env.MINIO_BUCKET ?? 'meetly',
    forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true',
    publicBaseUrl:
      process.env.S3_PUBLIC_BASE_URL ??
      `${process.env.S3_ENDPOINT}/${process.env.MINIO_BUCKET}`
  },

  security: {
    // Env var is CORS_ORIGIN (singular, your .env's naming) but the config
    // key and getter are plural (corsOrigins) since it's a list — the two
    // don't need to match 1:1. undefined (not []) in dev means "reflect
    // any origin"; see AppConfigService.corsOrigins / main.ts.
    corsOrigins: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : undefined,
    trustProxyHops: parseInt(process.env.TRUST_PROXY_HOPS ?? '1', 10),
    bodySizeLimit: process.env.BODY_SIZE_LIMIT ?? '1mb',
    rateLimit: {
      ttlMs: parseInt(process.env.RATE_LIMIT_TTL_MS ?? '60000', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10)
    }
  }
});
