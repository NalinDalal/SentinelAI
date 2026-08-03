import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const requestId = uuid();
    const req = context.switchToHttp().getRequest();
    const start = Date.now();

    const { method, url, ip, body } = req;

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const duration = Date.now() - start;
          console.log(
            `[${requestId}] ${method} ${url} ${res.statusCode} ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - start;
          console.error(
            `[${requestId}] ${method} ${url} ERROR ${error.message} ${duration}ms`,
          );
        },
      }),
    );
  }
}