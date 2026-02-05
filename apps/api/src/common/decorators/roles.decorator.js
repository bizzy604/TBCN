"use strict";
exports.__esModule = true;
exports.Roles = exports.Role = exports.ROLES_KEY = void 0;
var common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
/**
 * User roles enum
 */
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "super_admin";
    Role["ADMIN"] = "admin";
    Role["COACH"] = "coach";
    Role["PARTNER"] = "partner";
    Role["MEMBER"] = "member";
    Role["VISITOR"] = "visitor";
})(Role = exports.Role || (exports.Role = {}));
/**
 * Roles Decorator
 * Specifies which roles can access a route
 *
 * Usage:
 * @Roles(Role.ADMIN, Role.COACH)
 */
var Roles = function () {
    var roles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        roles[_i] = arguments[_i];
    }
    return (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
};
exports.Roles = Roles;
