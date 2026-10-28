import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, ConfigModule, PermissionsModule, RolesModule, AdminModule],
  controllers: [],
  providers: []
})
export class AppModule {}
