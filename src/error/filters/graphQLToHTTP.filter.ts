import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { BaseError } from '../errors/Base.error';

type ContextType = 'http' | 'ws' | 'rpc' | 'graphql';

@Catch()
export class GraphQLToHTTPFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (host.getType<ContextType>() === 'graphql') {
      return;
    }

    if (exception instanceof BaseError) {
      response.status(exception.statusCode).json({
        name: exception.name,
        message: exception.message,
        statusCode: exception.statusCode,
        extensions: exception.extensions,
      });
    } else if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        name: exception.name,
        message: exception.message,
        statusCode: exception.getStatus(),
      });
    } else {
      response.status(500).json({
        name: 'InternalServerError',
        statusCode: 500,
      });
    }
  }
}
