export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** What controllers/services return for paged lists; the interceptor unwraps it. */
export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/** Envelope for every successful response. */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  data: T;
  meta?: PaginationMeta;
  timestamp: string; // ISO-8601, UTC
  path: string;
  requestId?: string;
}

/** Envelope for every error response (produced by http-exception.filter.ts). */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  code: string; // from error-codes.ts
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
  requestId?: string;
}
