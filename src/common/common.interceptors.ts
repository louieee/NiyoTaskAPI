import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseStatusInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        const ctx = context.switchToHttp();
        const res = ctx.getResponse();
        const statusCode = response.status;
        res.status(statusCode);
        delete response.status;
        return response;
      }),
    );
  }
}
