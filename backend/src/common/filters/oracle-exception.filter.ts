import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class OracleExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    const message = exception?.message || exception?.response?.message || 'Internal Server Error';
    const status = exception?.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Bắt lỗi ORA-20403 từ Trigger Lương hoặc ORA-12496/12498 từ OLS
    if (message.includes('ORA-20403') || message.includes('ORA-12496') || message.includes('ORA-12498') || message.includes('ORA-28115')) {
      return response.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Lỗi bảo mật Oracle (HTTP 403): Bạn không có đặc quyền để thực hiện thao tác này.',
        error: message,
      });
    }

    // Default Error Handling
    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
