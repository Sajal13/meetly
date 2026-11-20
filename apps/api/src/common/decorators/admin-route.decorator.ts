import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '@common/guards/admin-auth.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Public } from './public.decorator';

export const AdminRoute = () =>
  applyDecorators(
    Public(),
    UseGuards(AdminAuthGuard, RolesGuard, PermissionsGuard)
  );
