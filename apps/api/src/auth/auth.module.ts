import { Admin } from '@admin/entities/admin.entity';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([Admin])],
  providers: []
})
export class AuthModule {}
