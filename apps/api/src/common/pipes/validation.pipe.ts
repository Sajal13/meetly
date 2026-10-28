import {
  BadRequestException,
  Injectable,
  ValidationError,
  ValidationPipe
} from '@nestjs/common';

export interface FieldError {
  field: string; // dotted path, e.g. "tickets.0.price"
  messages: string[];
}

/** Flattens nested class-validator errors into [{ field, messages }]. */
function flattenErrors(
  errors: ValidationError[],
  parentPath = ''
): FieldError[] {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const current: FieldError[] = error.constraints
      ? [{ field, messages: Object.values(error.constraints) }]
      : [];
    const nested = error.children?.length
      ? flattenErrors(error.children, field)
      : [];
    return [...current, ...nested];
  });
}

/**
 * Global validation pipe.
 *  - whitelist: strips properties without a class-validator decorator
 *  - forbidNonWhitelisted: rejects requests that send unknown properties
 *  - transform: turns payloads into DTO instances and converts primitives
 *    (e.g. "5" -> 5 for @Query() page) using the DTO's declared types
 *
 * Failures return 400 with { code: 'VALIDATION_ERROR', message, details: FieldError[] };
 * http-exception.filter.ts should pass `code` and `details` through to ApiErrorResponse.
 */
@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: flattenErrors(errors)
        })
    });
  }
}
