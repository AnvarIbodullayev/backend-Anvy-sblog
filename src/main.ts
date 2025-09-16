import * as express from 'express';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // PORT env bor bo'lsa number ga o'tkaz, yo'q bo'lsa 3333
  const port = Number(process.env.PORT) || 3333;

  await app.listen(port, '0.0.0.0');
  console.log(`Server running on port ${port}`);
}
bootstrap();
