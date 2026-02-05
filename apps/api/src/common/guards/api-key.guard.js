"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ApiKeyGuard = void 0;
var common_1 = require("@nestjs/common");
/**
 * API Key Guard
 * Validates API key for external integrations
 */
var ApiKeyGuard = /** @class */ (function () {
    function ApiKeyGuard(configService) {
        this.configService = configService;
    }
    ApiKeyGuard.prototype.canActivate = function (context) {
        var request = context.switchToHttp().getRequest();
        var apiKey = this.extractApiKey(request);
        if (!apiKey) {
            throw new common_1.UnauthorizedException('API key is required');
        }
        var validApiKey = this.configService.get('API_KEY');
        if (!validApiKey || apiKey !== validApiKey) {
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        return true;
    };
    /**
     * Extract API key from X-API-Key header or query param
     */
    ApiKeyGuard.prototype.extractApiKey = function (request) {
        return (request.headers['x-api-key'] ||
            request.query['api_key']);
    };
    ApiKeyGuard = __decorate([
        (0, common_1.Injectable)()
    ], ApiKeyGuard);
    return ApiKeyGuard;
}());
exports.ApiKeyGuard = ApiKeyGuard;
