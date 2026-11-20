import {
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ErrorCode } from './error-codes';

export const Unauthorized = (
  message: string,
  details?: Record<string, unknown>
) =>
  new UnauthorizedException({ code: ErrorCode.UNAUTHORIZED, message, details });

export const TooManyRequests = (
  message: string,
  details?: Record<string, unknown>
) =>
  new HttpException(
    {
      code: ErrorCode.TOO_MANY_REQUEST,
      message,
      details
    },
    HttpStatus.TOO_MANY_REQUESTS
  );

export const NotFound = (message: string, details?: Record<string, unknown>) =>
  new NotFoundException({
    code: ErrorCode.NOT_FOUND,
    message,
    details
  });
