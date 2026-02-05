"use strict";
exports.__esModule = true;
exports.CurrentUser = void 0;
var common_1 = require("@nestjs/common");
/**
 * Current User Decorator
 * Extracts the authenticated user from the request
 *
 * Usage:
 * @CurrentUser() user: User - Get full user object
 * @CurrentUser('id') userId: string - Get specific property
 */
exports.CurrentUser = (0, common_1.createParamDecorator)(function (property, ctx) {
    var request = ctx.switchToHttp().getRequest();
    var user = request.user;
    if (!user) {
        return null;
    }
    return property ? user[property] : user;
});
