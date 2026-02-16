import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security middleware
  app.use(helmet());

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API documentation (disabled in production if needed)
  const isProduction = process.env.NODE_ENV === 'production';
  const enableSwagger = process.env.ENABLE_SWAGGER !== 'false';

  if (!isProduction || enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Auth API')
      .setDescription(
        'User authentication API with signup, signin, and protected routes.\n\n' +
        '## Authentication\n' +
        'Use the `/auth/signup` endpoint to create a new account, then `/auth/signin` to get a JWT token.\n' +
        'Include the token in the Authorization header as `Bearer <token>` for protected routes.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
        'JWT-auth',
      )
      .addTag('auth', 'Authentication endpoints for signup and signin')
      .addTag('protected', 'Protected endpoints requiring JWT authentication')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    
    // Export OpenAPI JSON
    const outputPath = path.resolve(process.cwd(), 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    logger.log(`OpenAPI spec exported to ${outputPath}`);

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application running on http://localhost:${port}`);
  if (!isProduction || enableSwagger) {
    logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
  }
}

bootstrap();
