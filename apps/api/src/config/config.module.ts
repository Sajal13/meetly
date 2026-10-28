import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validate } from './env.validation';
import { AppConfigService } from './config.service';
import { findRootEnv } from './find-root-env';

// Walk up from this file until we hit the monorepo root (the folder that
// contains pnpm-workspace.yaml) and use the .env sitting there.
//
// Why not a fixed number of `..`? The depth between this file and the repo
// root changes with the compiled layout (dist/config vs dist/src/config),
// so counting levels silently points at the wrong folder. Walking up to a
// marker file works for `nest start --watch`, `node dist/main.js` from any
// cwd, and jest. __dirname is anchored to the file, never to process.cwd().
//
// Inside Docker the final image has no pnpm-workspace.yaml and no .env, so
// this returns undefined and only the variables injected by
// docker-compose.yml (see `x-api-environment`) are used. `validate` still
// runs against them.

const ROOT_ENV_PATH = findRootEnv();

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      // Order matters: dotenv does NOT overwrite a key already present in
      // process.env, so the first file that defines a key wins.
      // '.env.local' is an optional per-developer override (gitignored,
      // resolved via cwd, only meaningful for local `pnpm dev` runs where
      // cwd is apps/api). The root .env is the single local source of truth.
      // Missing files are skipped silently.
      envFilePath: ['.env.local', ...(ROOT_ENV_PATH ? [ROOT_ENV_PATH] : [])]
    })
  ],
  providers: [AppConfigService],
  exports: [AppConfigService]
})
export class ConfigModule {}
