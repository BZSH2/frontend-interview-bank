import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export class RequestIdMiddleware {
  use(req: Request & { requestId?: string }, res: Response, next: NextFunction) {
    const requestId = randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
