import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParserModule from 'cookie-parser';
import { AppModule } from './app.module';

const cookieParser =
  (cookieParserModule as unknown as { default?: typeof cookieParserModule }).default ??
  cookieParserModule;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const corsRaw =
    process.env.CORS_ORIGINS?.trim() || process.env.FRONTEND_ORIGIN?.trim() || 'http://localhost:6040';
  const origins = corsRaw.split(',').map((s) => s.trim()).filter(Boolean);
  app.enableCors({
    origin: origins.length === 1 ? origins[0] : origins,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`백엔드 실행 중: http://localhost:${port}`);
}

bootstrap();
