import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ResponseStatusInterceptor } from './common/common.interceptors';
import { appConfig } from './common/config/app.configuration';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: appConfig.corsOrigins,
    methods: appConfig.corsAllowedMethods,
    allowedHeaders: appConfig.corsAllowedHeaders, // Allowed headers
    credentials: appConfig.corsAllowCredentials, // Allow cookies
  });
  app.useGlobalInterceptors(new ResponseStatusInterceptor());
  app.setGlobalPrefix('api/v1');
  const config = new DocumentBuilder()
    .setTitle('Niyo API') // Replace with your API title
    .setDescription('The API for Niyo Company') // Replace with your API description
    .setVersion('1.0') // Replace with your API version
    .addBearerAuth(
      {
        type: 'http',
        schema: 'Bearer',
        bearerFormat: 'Token',
      } as SecuritySchemeObject,
      'Bearer',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT);
}
bootstrap();
