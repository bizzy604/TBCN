"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.HttpExceptionFilter = void 0;
var common_1 = require("@nestjs/common");
/**
 * Global HTTP Exception Filter
 * Catches all HTTP exceptions and returns consistent error responses
 */
var HttpExceptionFilter = /** @class */ (function () {
    function HttpExceptionFilter() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    HttpExceptionFilter_1 = HttpExceptionFilter;
    HttpExceptionFilter.prototype["catch"] = function (exception, host) {
        var ctx = host.switchToHttp();
        var response = ctx.getResponse();
        var request = ctx.getRequest();
        var status = exception.getStatus();
        var exceptionResponse = exception.getResponse();
        // Extract error details
        var error = typeof exceptionResponse === 'string'
            ? { message: exceptionResponse }
            : exceptionResponse;
        // Build error response
        var errorResponse = {
            error: {
                code: this.getErrorCode(status, error),
                message: error.message || 'An error occurred',
                details: error.errors || null
            },
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
            correlationId: request.headers['x-correlation-id'] || null
        };
        // Log the error
        this.logger.error("".concat(request.method, " ").concat(request.url, " - ").concat(status, " - ").concat(JSON.stringify(errorResponse.error)));
        response.status(status).json(errorResponse);
    };
    /**
     * Get error code from status or custom error
     */
    HttpExceptionFilter.prototype.getErrorCode = function (status, error) {
        var _a;
        if (error.code) {
            return String(error.code);
        }
        var statusCodes = (_a = {},
            _a[common_1.HttpStatus.BAD_REQUEST] = 'BAD_REQUEST',
            _a[common_1.HttpStatus.UNAUTHORIZED] = 'UNAUTHORIZED',
            _a[common_1.HttpStatus.FORBIDDEN] = 'FORBIDDEN',
            _a[common_1.HttpStatus.NOT_FOUND] = 'NOT_FOUND',
            _a[common_1.HttpStatus.CONFLICT] = 'CONFLICT',
            _a[common_1.HttpStatus.UNPROCESSABLE_ENTITY] = 'VALIDATION_ERROR',
            _a[common_1.HttpStatus.TOO_MANY_REQUESTS] = 'RATE_LIMIT_EXCEEDED',
            _a[common_1.HttpStatus.INTERNAL_SERVER_ERROR] = 'INTERNAL_ERROR',
            _a);
        return statusCodes[status] || 'UNKNOWN_ERROR';
    };
    var HttpExceptionFilter_1;
    HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
        (0, common_1.Catch)(common_1.HttpException)
    ], HttpExceptionFilter);
    return HttpExceptionFilter;
}());
exports.HttpExceptionFilter = HttpExceptionFilter;
