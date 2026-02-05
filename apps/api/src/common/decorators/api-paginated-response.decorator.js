"use strict";
exports.__esModule = true;
exports.ApiPaginatedResponse = exports.PaginatedResponseDto = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
/**
 * Paginated Response DTO for Swagger
 */
var PaginatedResponseDto = /** @class */ (function () {
    function PaginatedResponseDto() {
    }
    return PaginatedResponseDto;
}());
exports.PaginatedResponseDto = PaginatedResponseDto;
/**
 * API Paginated Response Decorator
 * Documents paginated endpoints in Swagger
 *
 * Usage:
 * @ApiPaginatedResponse(UserDto)
 */
var ApiPaginatedResponse = function (model) {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiExtraModels)(model), (0, swagger_1.ApiOkResponse)({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: (0, swagger_1.getSchemaPath)(model) }
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                page: { type: 'number', example: 1 },
                                limit: { type: 'number', example: 20 },
                                total: { type: 'number', example: 100 },
                                totalPages: { type: 'number', example: 5 },
                                hasNextPage: { type: 'boolean', example: true },
                                hasPreviousPage: { type: 'boolean', example: false }
                            }
                        },
                        timestamp: { type: 'string', example: '2025-02-04T10:30:00Z' }
                    }
                },
            ]
        }
    }));
};
exports.ApiPaginatedResponse = ApiPaginatedResponse;
