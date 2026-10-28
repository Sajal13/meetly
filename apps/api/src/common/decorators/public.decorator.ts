import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as not requiring authentication.
 * Used because auth guards are applied globally by default (secure-by-default).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
