import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../../admin/entities/admin.entity';
import { Role } from '../../roles/entities/role.entity';

/**
 * Creates the first super admin. Credentials come from env:
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME (optional)
 * Existing admins are never overwritten.
 */
export async function seedAdmin(ds: DataSource, roles: Role[]): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@meetly.local';
  const password = process.env.SEED_ADMIN_PASSWORD;
  const isProd = ['production', 'staging'].includes(process.env.NODE_ENV ?? '');

  if (!password) {
    if (isProd)
      throw new Error('SEED_ADMIN_PASSWORD is required in production/staging');
    console.warn(
      '[seed] SEED_ADMIN_PASSWORD not set; using a DEV-ONLY default password'
    );
  }

  const repo = ds.getRepository(Admin);
  const normalizedEmail = email.trim().toLowerCase();

  if (await repo.findOne({ where: { email: normalizedEmail } })) {
    console.log(`[seed] admin ${normalizedEmail} already exists, skipping`);
    return;
  }

  const superAdminRole = roles.find((r) => r.name === 'super_admin');
  if (!superAdminRole)
    throw new Error('super_admin role missing; run role seed first');

  const admin = repo.create({
    email: normalizedEmail,
    fullName: process.env.SEED_ADMIN_NAME ?? 'Super Admin',
    passwordHash: await bcrypt.hash(password ?? 'ChangeMe!12345', 12),
    roles: [superAdminRole],
    isActive: true
  });

  await repo.save(admin);
  console.log(`[seed] admin created: ${normalizedEmail}`);
}
