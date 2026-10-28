import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse, PaginatedResult } from '../dto/api-response.dto';

function isPaginated(value: unknown): value is PaginatedResult<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as PaginatedResult<unknown>).items) &&
    typeof (value as PaginatedResult<unknown>).meta === 'object'
  );
}

function isAlreadyEnveloped(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'statusCode' in value
  );
}

/**
 * Wraps every successful response in a uniform envelope:
 *   { success: true, statusCode, data, meta?, timestamp, path, requestId? }
 *
 * - Paged results ({ items, meta }) become { data: items, meta }.
 * - Files/streams and already-enveloped responses pass through untouched.
 * - Errors are NOT handled here; see http-exception.filter.ts.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<unknown> | unknown
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<ApiSuccessResponse<unknown> | unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<Request & { id?: string }>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      map((value) => {
        if (value instanceof StreamableFile || Buffer.isBuffer(value)) {
          return value;
        }
        if (isAlreadyEnveloped(value)) return value;

        const base = {
          success: true as const,
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
          path: request.originalUrl ?? request.url,
          requestId:
            request.id ??
            (request.headers['x-request-id'] as string | undefined)
        };

        if (isPaginated(value)) {
          return { ...base, data: value.items, meta: value.meta };
        }

        return { ...base, data: value ?? null };
      })
    );
  }
}
