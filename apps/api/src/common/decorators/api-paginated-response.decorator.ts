import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

/**
 * Paginated Response DTO for Swagger
 */
export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  timestamp: string;
}

/**
 * API Paginated Response Decorator
 * Documents paginated endpoints in Swagger
 * 
 * Usage:
 * @ApiPaginatedResponse(UserDto)
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                type: 'object',
                properties: {
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 20 },
                  total: { type: 'number', example: 100 },
                  totalPages: { type: 'number', example: 5 },
                  hasNextPage: { type: 'boolean', example: true },
                  hasPreviousPage: { type: 'boolean', example: false },
                },
              },
              timestamp: { type: 'string', example: '2025-02-04T10:30:00Z' },
            },
          },
        ],
      },
    }),
  );
};
