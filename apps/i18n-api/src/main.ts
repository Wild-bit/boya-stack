import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import type { AppConfig } from './config/env';
import cookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );
  await app.register(cookie);

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app')!;

  app.setGlobalPrefix(appConfig.apiPrefix);
  app.getHttpAdapter().getInstance().decorateRequest('user', null);

  // 全局管道：参数校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    })
  );

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应转换拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS
  app.enableCors({
    origin: appConfig.corsOrigin,
    credentials: true,
  });

  // Swagger 配置
  const swaggerConfig = new DocumentBuilder()
    .setTitle('i18n API')
    .setDescription('国际化管理平台 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(appConfig.port, '0.0.0.0');
  console.log(`Server running on: http://localhost:${appConfig.port}${appConfig.apiPrefix}`);
  console.log(`Swagger docs: http://localhost:${appConfig.port}/docs`);
}

bootstrap();
