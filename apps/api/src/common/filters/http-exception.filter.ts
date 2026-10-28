import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../exceptions/error-codes';
import { ApiErrorResponse } from '../dto/api-response.dto';

interface RequestWithId extends Request {
  id?: string;
}

/**
 * Converts every thrown error into the standard ApiErrorResponse envelope:
 * { success: false, statusCode, code, message, details?, timestamp, path, requestId? }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      code = this.codeForStatus(status);

      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, unknown>;

        if (typeof b.code === 'string') {
          code = b.code;
        }

        if (Array.isArray(b.message)) {
          // class-validator / ValidationPipe errors
          message = 'Validation failed';
          details = b.details ?? b.message;
        } else if (typeof b.message === 'string') {
          message = b.message;
          details = b.details;
        } else {
          details = b.details;
        }
      }
    }

    const requestId =
      request.id ??
      (typeof request.headers['x-request-id'] === 'string'
        ? request.headers['x-request-id']
        : undefined);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${requestId ?? 'no-request-id'}] ${request.method} ${request.originalUrl ?? request.url}`,
        exception instanceof Error ? exception.stack : String(exception)
      );
    }

    const errorBody: ApiErrorResponse = {
      success: false,
      statusCode: status,
      code,
      message,
      ...(details !== undefined && details !== null ? { details } : {}),
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
      ...(requestId ? { requestId } : {})
    };

    response.status(status).json(errorBody);
  }

  private codeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_FAILED;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
}
