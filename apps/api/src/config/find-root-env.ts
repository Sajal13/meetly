import { existsSync } from 'node:fs';
import path from 'node:path';

export function findRootEnv(): string | undefined {
  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      const file = path.join(dir, '.env');
      return existsSync(file) ? file : undefined;
    }
    dir = path.dirname(dir);
  }
  return undefined;
}
