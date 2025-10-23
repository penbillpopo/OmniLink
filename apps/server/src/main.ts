import { wss } from '@ay-nestjs/share-server';
import { str } from '@ay/env';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { loadModules } from './router-loader';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  setupStaticAssets(app);
  setupSwagger(app);
  const http = app.getHttpServer();
  loadModules();
  wss.jwtPublicKey = str('SERVER_JWT_KEY');
  wss.app = app;
  wss.listen(6455, http);
  await app.listen(3000);
}
bootstrap();

function setupSwagger(app: INestApplication) {
  const builder = new DocumentBuilder();
  const config = builder
    .setTitle('後台管理')
    .setDescription('後台管理 API 文件')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

function setupStaticAssets(app: NestExpressApplication) {
  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });
}
