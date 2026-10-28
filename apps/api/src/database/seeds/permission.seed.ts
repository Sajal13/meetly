import { DataSource } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';

/**
 * Permission keys follow "<resource>:<action>".
 * Use the same strings in @Permissions('events:approve') on controllers.
 */
export const PERMISSIONS: Record<string, string[]> = {
  users: ['read', 'update', 'suspend'],
  admins: ['create', 'read', 'update', 'delete'],
  roles: ['create', 'read', 'update', 'delete'],
  permissions: ['read', 'assign'],
  categories: ['create', 'read', 'update', 'delete'],
  organizers: ['create', 'read', 'update', 'delete', 'verify'],
  locations: ['create', 'read', 'update', 'delete'],
  'event-requests': ['read', 'approve', 'reject'],
  events: ['create', 'read', 'update', 'delete', 'publish', 'cancel'],
  tickets: ['read', 'update', 'check-in'],
  reservations: ['read', 'release'],
  orders: ['read', 'update', 'refund'],
  payments: ['read', 'refund'],
  reviews: ['read', 'moderate', 'delete'],
  notifications: ['read', 'send'],
  uploads: ['read', 'delete'],
  'audit-logs': ['read']
};

export const ALL_PERMISSION_KEYS: string[] = Object.entries(
  PERMISSIONS
).flatMap(([resource, actions]) =>
  actions.map((action) => `${resource}:${action}`)
);

export async function seedPermissions(ds: DataSource): Promise<Permission[]> {
  const repo = ds.getRepository(Permission);
  const existing = await repo.find();
  const existingKeys = new Set(existing.map((p) => p.key));

  const toCreate = ALL_PERMISSION_KEYS.filter(
    (key) => !existingKeys.has(key)
  ).map((key) =>
    repo.create({ key, description: `Allows ${key.replace(':', ' ')}` })
  );

  if (toCreate.length) await repo.save(toCreate);
  console.log(
    `[seed] permissions: ${toCreate.length} created, ${existing.length} already existed`
  );

  return repo.find();
}
