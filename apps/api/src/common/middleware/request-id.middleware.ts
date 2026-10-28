import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

interface RequestWithId extends Request {
  id?: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction) {
    const incoming = req.headers['x-request-id'];
    req.id = (Array.isArray(incoming) ? incoming[0] : incoming) ?? randomUUID();
    res.setHeader('x-request-id', req.id);
    next();
  }
}
