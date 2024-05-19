import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebsocketsGateway } from '../common/websockets/websocket.gateway';
import { EventDTO, UserJWTPayloadDTO } from '../common/common.dtos';
import { TaskEvents } from './tasks.enums';
import { TaskDetailDTO } from './tasks.dto';

@Injectable()
export class TasksListener {
  constructor(private readonly websocketService: WebsocketsGateway) {}

  @OnEvent(TaskEvents.NEW_TASK)
  async handleNewTask(task: TaskDetailDTO, sender: UserJWTPayloadDTO) {
    Logger.log(task.title, 'A new task was added');
    await this.websocketService.handleTaskEvent<EventDTO<TaskDetailDTO>>({
      sender: sender,
      payload: {
        message: 'A new task was added',
        event: TaskEvents.NEW_TASK,
        data: task,
      },
    });
  }

  @OnEvent(TaskEvents.UPDATE_TASK)
  async handleTaskUpdate(task: TaskDetailDTO, sender: UserJWTPayloadDTO) {
    Logger.log(task.title, 'A task was updated');
    await this.websocketService.handleTaskEvent<EventDTO<TaskDetailDTO>>({
      sender: sender,
      payload: {
        event: TaskEvents.UPDATE_TASK,
        message: 'A task was updated',
        data: task,
      },
    });
  }

  @OnEvent(TaskEvents.DELETE_TASKS)
  async handleTaskDeletion(taskIds: string[], sender: UserJWTPayloadDTO) {
    Logger.log(`${taskIds.length} tasks were deleted`);
    await this.websocketService.handleTaskEvent<EventDTO<string[]>>({
      sender: sender,
      payload: {
        event: TaskEvents.DELETE_TASKS,
        message: `${taskIds.length} tasks were deleted `,
        data: taskIds,
      },
    });
  }
}
