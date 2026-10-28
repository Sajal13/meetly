import { DataSource } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { ALL_PERMISSION_KEYS } from './permission.seed';

interface RoleDefinition {
  name: string;
  description: string;
  /** exact keys, "resource:*" wildcard, or "*" for everything */
  permissions: string[];
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    name: 'super_admin',
    description: 'Full access to everything',
    permissions: ['*']
  },
  {
    name: 'admin',
    description:
      'Manages platform content and operations (no admin/role management)',
    permissions: [
      'users:*',
      'categories:*',
      'organizers:*',
      'locations:*',
      'event-requests:*',
      'events:*',
      'tickets:*',
      'reservations:*',
      'orders:read',
      'orders:update',
      'payments:read',
      'reviews:*',
      'notifications:*',
      'uploads:*',
      'audit-logs:read'
    ]
  },
  {
    name: 'moderator',
    description: 'Reviews event requests, events and reviews',
    permissions: [
      'event-requests:read',
      'event-requests:approve',
      'event-requests:reject',
      'events:read',
      'events:update',
      'events:cancel',
      'reviews:*',
      'users:read',
      'organizers:read'
    ]
  },
  {
    name: 'support',
    description: 'Read-mostly access for customer support',
    permissions: [
      'users:read',
      'events:read',
      'tickets:read',
      'orders:read',
      'payments:read',
      'reservations:read',
      'reviews:read'
    ]
  }
];

function resolvePermissionKeys(patterns: string[]): string[] {
  const keys = new Set<string>();
  for (const pattern of patterns) {
    if (pattern === '*') ALL_PERMISSION_KEYS.forEach((k) => keys.add(k));
    else if (pattern.endsWith(':*')) {
      const prefix = pattern.slice(0, -1); // "users:"
      ALL_PERMISSION_KEYS.filter((k) => k.startsWith(prefix)).forEach((k) =>
        keys.add(k)
      );
    } else if (ALL_PERMISSION_KEYS.includes(pattern)) keys.add(pattern);
    else throw new Error(`Unknown permission in role seed: "${pattern}"`);
  }
  return [...keys];
}

export async function seedRoles(
  ds: DataSource,
  permissions: Permission[]
): Promise<Role[]> {
  const roleRepo = ds.getRepository(Role);
  const byKey = new Map(permissions.map((p) => [p.key, p]));

  for (const def of ROLE_DEFINITIONS) {
    let role = await roleRepo.findOne({
      where: { name: def.name },
      relations: { permissions: true }
    });
    if (!role) role = roleRepo.create({ name: def.name });

    role.description = def.description;
    role.permissions = resolvePermissionKeys(def.permissions).map((k) =>
      byKey.get(k)!
    );

    await roleRepo.save(role); // re-syncs permissions on every run
    console.log(
      `[seed] role "${def.name}" -> ${role.permissions.length} permissions`
    );
  }

  return roleRepo.find({ relations: { permissions: true } });
}
