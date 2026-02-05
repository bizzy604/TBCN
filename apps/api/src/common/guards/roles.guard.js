"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.RolesGuard = void 0;
var common_1 = require("@nestjs/common");
var roles_decorator_1 = require("../decorators/roles.decorator");
/**
 * Roles Guard
 * Checks if the authenticated user has required roles
 */
var RolesGuard = /** @class */ (function () {
    function RolesGuard(reflector) {
        this.reflector = reflector;
    }
    RolesGuard.prototype.canActivate = function (context) {
        // Get required roles from decorator
        var requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        // If no roles specified, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        var request = context.switchToHttp().getRequest();
        var user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        var hasRole = requiredRoles.some(function (role) { return user.role === role; });
        if (!hasRole) {
            throw new common_1.ForbiddenException("Access denied. Required roles: ".concat(requiredRoles.join(', ')));
        }
        return true;
    };
    RolesGuard = __decorate([
        (0, common_1.Injectable)()
    ], RolesGuard);
    return RolesGuard;
}());
exports.RolesGuard = RolesGuard;
