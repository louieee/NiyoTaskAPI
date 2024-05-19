import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserModule } from './users/users.module';
import { TaskModule } from './tasks/tasks.module';
import { envConfig } from './common/config/env.configuration';
import { configValidation } from './common/config/config.validator';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonCronServices } from './common/common.cron';
import { JWTService } from './common/security/jwt.security';
import { InvalidHostMiddleware, JWTMiddleware } from './common/middlewares/security.middlewares';
import { WebsocketsGateway } from './common/websockets/websocket.gateway';

@Module({
  imports: [
    UserModule,
    TaskModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(envConfig.CONNECTION_STRING),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: false,
      validationSchema: configValidation,
      envFilePath: ['.env'],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      ignoreErrors: false,
    }),
    MulterModule.register(),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'uploads'), // Path to the uploads directory
      serveRoot: '/uploads', // The URL path to access the uploads
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [CommonCronServices, JWTService, WebsocketsGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    return consumer
      .apply(InvalidHostMiddleware)
      .forRoutes('*')
      .apply(JWTMiddleware)
      .exclude('/auth')
      .forRoutes('/users', '/tasks');
  }
}
