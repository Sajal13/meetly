import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

/**
 * Throw this (or a subclass) for domain/business-rule failures so the
 * global exception filter can shape a consistent { success:false, error }
 * response with a stable, documented code.
 */
export class BusinessException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details?: unknown
  ) {
    super({ code, message, details }, status);
  }
}
