import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;
      const latency = Date.now() - startTime;
      const userId = (req as any).user?.id || 'anonymous';

      this.logger.log(
        JSON.stringify({
          method,
          path: originalUrl,
          statusCode,
          contentLength,
          latency: `${latency}ms`,
          userId,
          ip,
          userAgent,
        }),
      );
    });

    next();
  }
}
