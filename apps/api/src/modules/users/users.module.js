"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UsersModule = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var users_controller_1 = require("./users.controller");
var users_service_1 = require("./users.service");
var entities_1 = require("./entities");
var auth_module_1 = require("../auth/auth.module");
/**
 * Users Module
 * Manages user accounts and profiles
 * - User CRUD operations
 * - Profile management
 * - Avatar uploads
 * - Role assignments
 */
var UsersModule = /** @class */ (function () {
    function UsersModule() {
    }
    UsersModule = __decorate([
        (0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forFeature([entities_1.User, entities_1.UserProfile]),
                (0, common_1.forwardRef)(function () { return auth_module_1.AuthModule; }),
            ],
            controllers: [users_controller_1.UsersController],
            providers: [users_service_1.UsersService],
            exports: [users_service_1.UsersService, typeorm_1.TypeOrmModule]
        })
    ], UsersModule);
    return UsersModule;
}());
exports.UsersModule = UsersModule;
