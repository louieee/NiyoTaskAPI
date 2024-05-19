import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskController } from './tasks.controller';
import { Task, TaskSchema } from './tasks.schema';
import { TaskService } from './tasks.service';
import { TasksListener } from './tasks.listeners';
import { WebsocketsGateway } from '../common/websockets/websocket.gateway';
import { JWTService } from '../common/security/jwt.security';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [TaskController],
  providers: [TaskService, JWTService, WebsocketsGateway, TasksListener],
})
export class TaskModule {}
