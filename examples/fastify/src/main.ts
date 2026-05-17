import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { setupDocs } from '@insantoshmahto/oas-ui';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const document = {
    openapi: '3.0.0',
    info: { title: 'Example API', version: '0.1.0' },
    paths: {},
  };

  // Mount docs at /docs (Swagger UI)
  setupDocs('/docs', app, document, { uiRenderer: 'swagger' });

  await app.listen(3000, '0.0.0.0');
  console.log('Listening on http://localhost:3000');
}

bootstrap();
