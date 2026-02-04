// ============================================
// API Types - Common request/response shapes
// ============================================

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

// API Error
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

// Query state
export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
}
