import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();
    const status   = exception.getStatus();
    const body     = exception.getResponse();

    // class-validator devolve um objeto com array de messages
    const message =
      typeof body === 'object' && 'message' in body
        ? (body as any).message
        : exception.message;

    response.status(status).json({
      error:      message,
      statusCode: status,
      path:       request.url,
      timestamp:  new Date().toISOString(),
    });
  }
}