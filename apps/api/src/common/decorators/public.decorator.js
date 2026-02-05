"use strict";
exports.__esModule = true;
exports.Public = exports.IS_PUBLIC_KEY = void 0;
var common_1 = require("@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
/**
 * Public Decorator
 * Marks a route as publicly accessible (no auth required)
 *
 * Usage:
 * @Public()
 * @Get('catalog')
 * getCatalog() {}
 */
var Public = function () { return (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true); };
exports.Public = Public;
