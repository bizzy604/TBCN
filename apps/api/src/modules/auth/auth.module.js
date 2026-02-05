"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AuthModule = void 0;
var common_1 = require("@nestjs/common");
var jwt_1 = require("@nestjs/jwt");
var config_1 = require("@nestjs/config");
var passport_1 = require("@nestjs/passport");
var auth_controller_1 = require("./auth.controller");
var auth_service_1 = require("./auth.service");
var strategies_1 = require("./strategies");
var users_module_1 = require("../users/users.module");
/**
 * Auth Module
 * Handles authentication and authorization
 * - JWT token generation and validation
 * - OAuth social login (Google, LinkedIn, Facebook)
 * - Password hashing and verification
 * - Refresh token management
 */
var AuthModule = /** @class */ (function () {
    function AuthModule() {
    }
    AuthModule = __decorate([
        (0, common_1.Module)({
            imports: [
                passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
                jwt_1.JwtModule.registerAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (configService) { return ({
                        secret: configService.get('JWT_SECRET'),
                        signOptions: {
                            expiresIn: configService.get('JWT_ACCESS_EXPIRATION', '15m'),
                            issuer: configService.get('JWT_ISSUER', 'brandcoachnetwork.com')
                        }
                    }); }
                }),
                (0, common_1.forwardRef)(function () { return users_module_1.UsersModule; }),
            ],
            controllers: [auth_controller_1.AuthController],
            providers: [auth_service_1.AuthService, strategies_1.JwtStrategy],
            exports: [jwt_1.JwtModule, auth_service_1.AuthService]
        })
    ], AuthModule);
    return AuthModule;
}());
exports.AuthModule = AuthModule;
