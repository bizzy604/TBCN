"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AllExceptionsFilter = void 0;
var common_1 = require("@nestjs/common");
/**
 * Global All Exceptions Filter
 * Catches ALL exceptions including non-HTTP errors
 * Use as fallback for unexpected errors
 */
var AllExceptionsFilter = /** @class */ (function () {
    function AllExceptionsFilter() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    AllExceptionsFilter_1 = AllExceptionsFilter;
    AllExceptionsFilter.prototype["catch"] = function (exception, host) {
        var ctx = host.switchToHttp();
        var response = ctx.getResponse();
        var request = ctx.getRequest();
        // Determine status and message
        var status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        var message = 'Internal server error';
        var code = 'INTERNAL_ERROR';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            var exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : exceptionResponse.message || message;
            code = exceptionResponse.code || this.getCodeFromStatus(status);
        }
        else if (exception instanceof Error) {
            message = exception.message;
            // Log full stack trace for non-HTTP errors
            this.logger.error("Unhandled exception: ".concat(exception.message), exception.stack);
        }
        // Never expose internal error details in production
        if (process.env.NODE_ENV === 'production' &&
            status === common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            message = 'An unexpected error occurred. Please try again later.';
        }
        var errorResponse = {
            error: {
                code: code,
                message: message
            },
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
            correlationId: request.headers['x-correlation-id'] || null
        };
        this.logger.error("".concat(request.method, " ").concat(request.url, " - ").concat(status, " - ").concat(message));
        response.status(status).json(errorResponse);
    };
    AllExceptionsFilter.prototype.getCodeFromStatus = function (status) {
        var codes = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'VALIDATION_ERROR',
            429: 'RATE_LIMIT_EXCEEDED',
            500: 'INTERNAL_ERROR'
        };
        return codes[status] || 'UNKNOWN_ERROR';
    };
    var AllExceptionsFilter_1;
    AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
        (0, common_1.Catch)()
    ], AllExceptionsFilter);
    return AllExceptionsFilter;
}());
exports.AllExceptionsFilter = AllExceptionsFilter;
