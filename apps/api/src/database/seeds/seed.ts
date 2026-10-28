import dataSource from '../database.config';
import { seedPermissions } from './permission.seed';
import { seedRoles } from './role.seed';
import { seedAdmin } from './admin.seed';

async function run() {
  await dataSource.initialize();
  try {
    // Order matters: permissions -> roles -> admin. Every step is idempotent.
    const permissions = await seedPermissions(dataSource);
    const roles = await seedRoles(dataSource, permissions);
    await seedAdmin(dataSource, roles);
    console.log('[seed] done');
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
