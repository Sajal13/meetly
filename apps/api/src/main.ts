import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true
  });
  const config = app.get(ConfigService);
  const isProduction = config.get<string>('NODE_ENV') === 'production';

  // Trust the first proxy hop (nginx / load balancer / Cloudflare) so
  // req.ip resolves to the real client — required for ThrottlerGuard
  // below to rate-limit by actual client IP, not the proxy's.
  app.set('trust proxy', 1);
  app.set('query parser', 'extended');
  app.disable('x-powered-by');

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });

  // ---- Security headers ----
  app.use(
    helmet({
      // This is a JSON API, not a page server — a browser CSP does nothing
      // for API responses and only risks breaking Swagger UI's inline JS.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' } // media/object-storage URLs get read cross-origin by web/admin/mobile
    })
  );

  // ---- CORS: exact allow-list, never '*' — required once credentials:true ----
  const allowedOrigins = (config.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // No Origin header = curl, server-to-server, or the mobile app — allow it.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  });

  // ---- Reject any field not declared on the DTO, not just strip it ----
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );

  // ---- Enforce @Exclude() on entities — password/OTP/token hashes never serialize out ----
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ---- Normalize every error response; never leak stack traces to clients ----
  app.useGlobalFilters(new HttpExceptionFilter());

  // ---- Close DB/Redis cleanly on SIGTERM (matters once this runs in Docker/k8s) ----
  app.enableShutdownHooks();

  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Meetly API')
      .setDescription('API documentation for Meetly backend')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { tagsSorter: 'alpha', operationsSorter: 'alpha' }
    });
  }

  const port = config.get<number>('API_PORT') ?? 4000;
  await app.listen(port);

  console.log(`App running on http://localhost:${port}`);
  if (!isProduction) {
    console.log(`Swagger docs at http://localhost:${port}/api/docs`);
  }
}
bootstrap();
