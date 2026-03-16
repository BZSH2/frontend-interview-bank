import { CallHandler, ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'ok',
        requestId: request.requestId,
        data,
      })),
    );
  }
}
