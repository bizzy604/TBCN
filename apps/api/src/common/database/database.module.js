"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DatabaseModule = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var config_1 = require("@nestjs/config");
/**
 * Database Module
 * Configures TypeORM with PostgreSQL
 */
var DatabaseModule = /** @class */ (function () {
    function DatabaseModule() {
    }
    DatabaseModule = __decorate([
        (0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (configService) { return ({
                        type: 'postgres',
                        host: configService.get('DATABASE_HOST', 'localhost'),
                        port: configService.get('DATABASE_PORT', 5432),
                        username: configService.get('DATABASE_USERNAME', 'postgres'),
                        password: configService.get('DATABASE_PASSWORD', 'postgres'),
                        database: configService.get('DATABASE_NAME', 'brandcoach'),
                        // Entity auto-loading
                        autoLoadEntities: true,
                        // Synchronize schema in development (NEVER in production!)
                        synchronize: configService.get('DATABASE_SYNC', false),
                        // Logging configuration
                        logging: configService.get('DATABASE_LOGGING', false),
                        logger: 'advanced-console',
                        // Connection pool
                        extra: {
                            max: 20,
                            idleTimeoutMillis: 30000,
                            connectionTimeoutMillis: 2000
                        },
                        // SSL for production
                        ssl: configService.get('NODE_ENV') === 'production'
                            ? { rejectUnauthorized: false }
                            : false,
                        // Migrations
                        migrations: [__dirname + '/migrations/*{.ts,.js}'],
                        migrationsRun: false,
                        migrationsTableName: '_migrations'
                    }); }
                }),
            ],
            exports: [typeorm_1.TypeOrmModule]
        })
    ], DatabaseModule);
    return DatabaseModule;
}());
exports.DatabaseModule = DatabaseModule;
