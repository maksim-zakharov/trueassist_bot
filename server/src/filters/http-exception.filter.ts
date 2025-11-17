import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = 500;
        let message = 'Internal server error';
        let errors = [];

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse();
            message = response['message'] || exception.message;
            errors = response['errors'] || [];
        }
        else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            status = 400;
            message = 'Database error';
            errors = [{
                code: exception.code,
                meta: exception.meta,
            }];
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
            errors,
        });
    }
}