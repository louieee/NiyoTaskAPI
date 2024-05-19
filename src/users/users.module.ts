import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './users.service';
import { User, UserSchema } from './users.schema';
import { UserEmailService } from '../common/emails/user.emails';
import { JWTService } from '../common/security/jwt.security';
import { MailService } from '../common/services/email.services';
import { UserController } from './controllers/users.controller';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { WebsocketsGateway } from '../common/websockets/websocket.gateway';
import { UsersListener } from './users.listener';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController, AuthController],
  providers: [
    UserService,
    JWTService,
    MailService,
    UserEmailService,
    ConfigService,
    WebsocketsGateway,
    UsersListener,
  ],
  exports: [UserService],
})
export class UserModule {}
