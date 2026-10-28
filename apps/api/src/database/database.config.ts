import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as path from 'path';

export interface DatabaseOptionsInput {
  /** Full Postgres connection URL, e.g. postgres://user:pass@host:5432/meetly */
  url: string;
  /** production or staging */
  isProdLike: boolean;
  ssl?: boolean;
  logAll?: boolean;
  poolMax?: number;
  migrationsRun?: boolean;
}

/**
 * Single source of truth for TypeORM options. Used by
 *  - DatabaseModule at runtime (values come from AppConfigService)
 *  - the TypeORM CLI and seeds (values come from process.env, see createDataSource)
 */
export function buildDatabaseOptions(
  input: DatabaseOptionsInput
): DataSourceOptions {
  const {
    url,
    isProdLike,
    ssl = false,
    logAll = false,
    poolMax = 10,
    migrationsRun = false
  } = input;

  return {
    type: 'postgres',
    url,

    // snake_case columns (user_id, event_id, created_at ...) from camelCase properties
    namingStrategy: new SnakeNamingStrategy(),

    // Uses gen_random_uuid() for @PrimaryGeneratedColumn('uuid')
    uuidExtension: 'pgcrypto',

    // Every *.entity.ts under src/ (users/, admin/, roles/, auth/otp/, ...)
    entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
    migrationsTableName: 'typeorm_migrations',

    // Schema changes ONLY through migrations. Never use synchronize.
    synchronize: false,
    migrationsRun,

    logging: isProdLike
      ? ['error', 'warn', 'migration']
      : logAll
        ? 'all'
        : ['error', 'warn'],

    ssl: ssl ? { rejectUnauthorized: true } : false,
    extra: {
      max: poolMax,
      options: '-c timezone=UTC' // store/compare everything in UTC
    }
  };
}

/** Used by the TypeORM CLI and seeds, which run outside Nest and read process.env directly. */
export function createDataSource(): DataSource {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const env = process.env.NODE_ENV ?? 'development';
  return new DataSource(
    buildDatabaseOptions({
      url,
      isProdLike: env === 'production' || env === 'staging',
      ssl: process.env.DB_SSL === 'true',
      logAll: process.env.DB_LOGGING === 'true'
    })
  );
}

// The TypeORM CLI needs a default export of a DataSource instance.
export default createDataSource();
