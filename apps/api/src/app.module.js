"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var throttler_1 = require("@nestjs/throttler");
var event_emitter_1 = require("@nestjs/event-emitter");
var bull_1 = require("@nestjs/bull");
var schedule_1 = require("@nestjs/schedule");
// Common modules
var database_module_1 = require("./common/database/database.module");
var cache_module_1 = require("./common/cache/cache.module");
// Feature modules
var auth_module_1 = require("./modules/auth/auth.module");
var users_module_1 = require("./modules/users/users.module");
var programs_module_1 = require("./modules/programs/programs.module");
var enrollments_module_1 = require("./modules/enrollments/enrollments.module");
var coaching_module_1 = require("./modules/coaching/coaching.module");
var community_module_1 = require("./modules/community/community.module");
var messaging_module_1 = require("./modules/messaging/messaging.module");
var events_module_1 = require("./modules/events/events.module");
var payments_module_1 = require("./modules/payments/payments.module");
var notifications_module_1 = require("./modules/notifications/notifications.module");
var analytics_module_1 = require("./modules/analytics/analytics.module");
var partners_module_1 = require("./modules/partners/partners.module");
// Configuration validation
var config_schema_1 = require("./common/config/config.schema");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        (0, common_1.Module)({
            imports: [
                // ============================================
                // Configuration
                // ============================================
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: ['.env.local', '.env'],
                    validationSchema: config_schema_1.configValidationSchema,
                    validationOptions: {
                        abortEarly: true
                    }
                }),
                // ============================================
                // Rate Limiting
                // ============================================
                throttler_1.ThrottlerModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (config) { return ([{
                            ttl: config.get('THROTTLE_TTL', 60000),
                            limit: config.get('THROTTLE_LIMIT', 100)
                        }]); }
                }),
                // ============================================
                // Event Emitter (Domain Events)
                // ============================================
                event_emitter_1.EventEmitterModule.forRoot({
                    wildcard: false,
                    delimiter: '.',
                    newListener: false,
                    removeListener: false,
                    maxListeners: 10,
                    verboseMemoryLeak: true,
                    ignoreErrors: false
                }),
                // ============================================
                // Job Queue (BullMQ)
                // ============================================
                bull_1.BullModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (config) { return ({
                        redis: {
                            host: config.get('REDIS_HOST', 'localhost'),
                            port: config.get('REDIS_PORT', 6379)
                        },
                        defaultJobOptions: {
                            removeOnComplete: 100,
                            removeOnFail: 200,
                            attempts: 3,
                            backoff: {
                                type: 'exponential',
                                delay: 1000
                            }
                        }
                    }); }
                }),
                // ============================================
                // Scheduled Tasks
                // ============================================
                schedule_1.ScheduleModule.forRoot(),
                // ============================================
                // Infrastructure Modules
                // ============================================
                database_module_1.DatabaseModule,
                cache_module_1.CacheModule,
                // ============================================
                // Feature Modules
                // ============================================
                auth_module_1.AuthModule,
                users_module_1.UsersModule,
                programs_module_1.ProgramsModule,
                enrollments_module_1.EnrollmentsModule,
                coaching_module_1.CoachingModule,
                community_module_1.CommunityModule,
                messaging_module_1.MessagingModule,
                events_module_1.EventsModule,
                payments_module_1.PaymentsModule,
                notifications_module_1.NotificationsModule,
                analytics_module_1.AnalyticsModule,
                partners_module_1.PartnersModule,
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
