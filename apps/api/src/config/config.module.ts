import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { join } from 'path';
import configuration from './configuration';
import { validate } from './env.validation';
import { AppConfigService } from './config.service';

// Nest CLI compiles this file to <apps/api>/dist/config/config.module.js,
// preserving the src/ folder structure 1:1 — in both `nest start --watch`
// (dev) and the built output (prod), __dirname at runtime is always
// apps/api/dist/config. So walking up from there is a fixed, known depth:
//   dist/config -> dist -> apps/api -> apps -> <repo root>  (4 levels)
//
// This is deliberately anchored to __dirname rather than a relative path
// like '../../.env', because a relative path is resolved against
// process.cwd() — and cwd depends entirely on how the process was
// launched. `pnpm --filter @meetly/api dev` (what the root package.json
// scripts use) sets cwd to apps/api, so '../../.env' happens to work
// there — but `node apps/api/dist/main.js` run from the repo root does
// NOT, because cwd is then the repo root itself. __dirname never changes
// with invocation style, so this is correct either way. Verified by
// actually running the built app from both locations.
const ROOT_ENV_PATH = join(__dirname, '..', '..', '..', '..', '.env');

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      // Order matters: dotenv does NOT overwrite a key already present in
      // process.env, so the first file in this list to define a given key
      // wins. '.env.local' is an optional per-developer override (gitignored,
      // resolved via cwd — fine since it's only ever used for local `pnpm dev`
      // runs, where cwd is reliably apps/api); ROOT_ENV_PATH is the repo's
      // actual source of truth (see infrastructure/docker/docker-compose.yml,
      // which does `env_file: ../../.env` for the api/worker containers).
      //
      // Inside Docker, none of this matters: docker-compose injects every
      // variable directly into process.env before Node starts, so these
      // file lookups simply fail silently (file not present in the image)
      // and the already-populated process.env is used as-is.
      envFilePath: ['.env.local', ROOT_ENV_PATH]
    })
  ],
  providers: [AppConfigService],
  exports: [AppConfigService]
})
export class ConfigModule {}
