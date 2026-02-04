import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Database Module
 * Configures TypeORM with PostgreSQL
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: configService.get<string>('DATABASE_NAME', 'brandcoach'),
        
        // Entity auto-loading
        autoLoadEntities: true,
        
        // Synchronize schema in development (NEVER in production!)
        synchronize: configService.get<boolean>('DATABASE_SYNC', false),
        
        // Logging configuration
        logging: configService.get<boolean>('DATABASE_LOGGING', false),
        logger: 'advanced-console',
        
        // Connection pool
        extra: {
          max: 20, // Maximum connections in pool
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
        
        // SSL for production
        ssl: configService.get<string>('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
        
        // Migrations
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: false,
        migrationsTableName: '_migrations',
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
