import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Requires the authenticated admin to hold AT LEAST ONE of the listed roles (by name).
 * e.g. @Roles('super_admin', 'admin')
 *
 * Prefer @Permissions() for fine-grained checks; use @Roles() for coarse gates.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
