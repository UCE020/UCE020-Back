import {
  Injectable, NestInterceptor,
  ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

interface ResponseShape<T> {
  data: T;
  statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseShape<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ResponseShape<T>> {
    const statusCode = context.switchToHttp().getResponse<Response>().statusCode;
    return next.handle().pipe(
      map(data => ({ data, statusCode })),
    );
  }
}