"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ValidationExceptionFilter = void 0;
var common_1 = require("@nestjs/common");
/**
 * Validation Exception Filter
 * Handles class-validator validation errors with detailed field errors
 */
var ValidationExceptionFilter = /** @class */ (function () {
    function ValidationExceptionFilter() {
        this.logger = new common_1.Logger(ValidationExceptionFilter_1.name);
    }
    ValidationExceptionFilter_1 = ValidationExceptionFilter;
    ValidationExceptionFilter.prototype["catch"] = function (exception, host) {
        var ctx = host.switchToHttp();
        var response = ctx.getResponse();
        var request = ctx.getRequest();
        var exceptionResponse = exception.getResponse();
        // Check if this is a validation error
        if (!exceptionResponse.message ||
            !Array.isArray(exceptionResponse.message)) {
            // Not a validation error, let it pass through
            response.status(400).json({
                error: {
                    code: 'BAD_REQUEST',
                    message: exceptionResponse.message || 'Bad request'
                },
                path: request.url,
                method: request.method,
                timestamp: new Date().toISOString()
            });
            return;
        }
        // Format validation errors
        var validationErrors = this.formatValidationErrors(exceptionResponse.message);
        var errorResponse = {
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: validationErrors
            },
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString()
        };
        this.logger.warn("Validation failed: ".concat(request.method, " ").concat(request.url, " - ").concat(JSON.stringify(validationErrors)));
        response.status(400).json(errorResponse);
    };
    /**
     * Format validation errors into a clean structure
     */
    ValidationExceptionFilter.prototype.formatValidationErrors = function (errors) {
        var formatted = {};
        for (var _i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
            var error = errors_1[_i];
            if (typeof error === 'string') {
                // Simple string error
                formatted['_error'] = formatted['_error'] || [];
                formatted['_error'].push(error);
            }
            else if (error.constraints) {
                // Validation error with constraints
                var messages = Object.values(error.constraints);
                formatted[error.property] = messages;
            }
        }
        return formatted;
    };
    var ValidationExceptionFilter_1;
    ValidationExceptionFilter = ValidationExceptionFilter_1 = __decorate([
        (0, common_1.Catch)(common_1.BadRequestException)
    ], ValidationExceptionFilter);
    return ValidationExceptionFilter;
}());
exports.ValidationExceptionFilter = ValidationExceptionFilter;
