"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.LoggingInterceptor = void 0;
var common_1 = require("@nestjs/common");
var operators_1 = require("rxjs/operators");
/**
 * Logging Interceptor
 * Logs all incoming requests and outgoing responses with timing
 */
var LoggingInterceptor = /** @class */ (function () {
    function LoggingInterceptor() {
        this.logger = new common_1.Logger('HTTP');
    }
    LoggingInterceptor.prototype.intercept = function (context, next) {
        var _this = this;
        var ctx = context.switchToHttp();
        var request = ctx.getRequest();
        var response = ctx.getResponse();
        var method = request.method, url = request.url, body = request.body, headers = request.headers;
        var correlationId = headers['x-correlation-id'] || this.generateCorrelationId();
        var userAgent = headers['user-agent'] || 'Unknown';
        var ip = request.ip || request.socket.remoteAddress;
        // Set correlation ID in response headers
        response.setHeader('X-Correlation-ID', correlationId);
        var startTime = Date.now();
        // Log incoming request
        this.logger.log("[".concat(correlationId, "] --> ").concat(method, " ").concat(url, " - IP: ").concat(ip, " - UA: ").concat(userAgent.substring(0, 50)));
        // Log request body in development (exclude sensitive data)
        if (process.env.NODE_ENV === 'development' && body && Object.keys(body).length > 0) {
            var sanitizedBody = this.sanitizeBody(body);
            this.logger.debug("[".concat(correlationId, "] Body: ").concat(JSON.stringify(sanitizedBody)));
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: function () {
                var duration = Date.now() - startTime;
                var statusCode = response.statusCode;
                _this.logger.log("[".concat(correlationId, "] <-- ").concat(method, " ").concat(url, " - ").concat(statusCode, " - ").concat(duration, "ms"));
            },
            error: function (error) {
                var duration = Date.now() - startTime;
                var statusCode = error.status || 500;
                _this.logger.error("[".concat(correlationId, "] <-- ").concat(method, " ").concat(url, " - ").concat(statusCode, " - ").concat(duration, "ms - ").concat(error.message));
            }
        }));
    };
    /**
     * Generate a unique correlation ID
     */
    LoggingInterceptor.prototype.generateCorrelationId = function () {
        return "".concat(Date.now().toString(36), "-").concat(Math.random().toString(36).substring(2, 9));
    };
    /**
     * Remove sensitive fields from request body
     */
    LoggingInterceptor.prototype.sanitizeBody = function (body) {
        var sensitiveFields = ['password', 'confirmPassword', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey'];
        var sanitized = __assign({}, body);
        for (var _i = 0, sensitiveFields_1 = sensitiveFields; _i < sensitiveFields_1.length; _i++) {
            var field = sensitiveFields_1[_i];
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        }
        return sanitized;
    };
    LoggingInterceptor = __decorate([
        (0, common_1.Injectable)()
    ], LoggingInterceptor);
    return LoggingInterceptor;
}());
exports.LoggingInterceptor = LoggingInterceptor;
