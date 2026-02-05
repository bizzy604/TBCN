"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.createPaginatedResult = exports.createPaginationMeta = exports.PaginationDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
/**
 * Pagination DTO
 * Standard pagination parameters for list endpoints
 */
var PaginationDto = /** @class */ (function () {
    function PaginationDto() {
        this.page = 1;
        this.limit = 20;
        this.sortOrder = 'desc';
    }
    Object.defineProperty(PaginationDto.prototype, "offset", {
        /**
         * Calculate offset for database query
         */
        get: function () {
            return (this.page - 1) * this.limit;
        },
        enumerable: false,
        configurable: true
    });
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Page number (1-indexed)',
            minimum: 1,
            "default": 1,
            example: 1
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(1),
        (0, class_transformer_1.Transform)(function (_a) {
            var value = _a.value;
            return parseInt(value, 10);
        })
    ], PaginationDto.prototype, "page");
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Number of items per page',
            minimum: 1,
            maximum: 100,
            "default": 20,
            example: 20
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(1),
        (0, class_validator_1.Max)(100),
        (0, class_transformer_1.Transform)(function (_a) {
            var value = _a.value;
            return parseInt(value, 10);
        })
    ], PaginationDto.prototype, "limit");
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Field to sort by',
            example: 'createdAt'
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], PaginationDto.prototype, "sortBy");
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Sort order',
            "enum": ['asc', 'desc'],
            "default": 'desc',
            example: 'desc'
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsIn)(['asc', 'desc'])
    ], PaginationDto.prototype, "sortOrder");
    return PaginationDto;
}());
exports.PaginationDto = PaginationDto;
/**
 * Create pagination meta from query results
 */
function createPaginationMeta(page, limit, total) {
    var totalPages = Math.ceil(total / limit);
    return {
        page: page,
        limit: limit,
        total: total,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
    };
}
exports.createPaginationMeta = createPaginationMeta;
/**
 * Create paginated result
 */
function createPaginatedResult(items, page, limit, total) {
    return {
        items: items,
        meta: createPaginationMeta(page, limit, total)
    };
}
exports.createPaginatedResult = createPaginatedResult;
