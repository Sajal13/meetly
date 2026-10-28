import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';
import { buildDatabaseOptions } from './database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // must export AppConfigService
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        ...buildDatabaseOptions({
          url: config.databaseUrl,
          isProdLike: config.isProdLike,
          ssl: config.isProdLike && process.env.DB_SSL === 'true',
          migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true'
        }),
        autoLoadEntities: true
      })
    })
  ]
})
export class DatabaseModule {}
