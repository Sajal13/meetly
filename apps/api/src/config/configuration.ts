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
    // NOTE: both user and admin blocks intentionally share the exact same
    // shape (accessSecret / accessTtl / refreshSecret / refreshTtl). This
    // isn't just style — TokenService, both passport strategies, and
    // AdminAuthService all destructure whichever one applies through the
    // same code path (`type === 'user' ? config.userAuth : config.adminAuth`),
    // so a renamed or miscased key in only one block (e.g. "refreshToken"
    // instead of "refreshSecret") fails *silently*: it signs/verifies with
    // `undefined` as the secret rather than throwing, until a token refuses
    // to validate in a very confusing way. Keep these two in sync.
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
      refreshTtl: process.env.ADMIN_REFRESH_TOKEN_TTL ?? '7d'
    },
    // Consumed once OtpService is wired to a real transport (Gmail SMTP
    // via nodemailer, most likely, given these var names). Currently
    // OtpService just logs the code — see otp/otp.service.ts.
    otp: {
      gmailUser: process.env.GMAIL_USER ?? '',
      gmailAppPassword: process.env.GMAIL_APP_PASSWORD ?? ''
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

  // Generic S3-compatible client config (MinIO locally, real AWS S3 in
  // prod — same shape, just different env values). The bucket name is
  // intentionally read from MINIO_BUCKET rather than a separate S3_BUCKET
  // var, since there's only ever one bucket in play right now; see
  // env.validation.ts.
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
