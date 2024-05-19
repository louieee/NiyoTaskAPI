import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RetrieveUserDTO } from './users.dto';
import { UserEvents } from './users.enums';
import { WebsocketsGateway } from '../common/websockets/websocket.gateway';
import { SocketChannel } from '../common/common.enums';
import { EventDTO } from '../common/common.dtos';

@Injectable()
export class UsersListener {
  constructor(private readonly websocketService: WebsocketsGateway) {}

  @OnEvent(UserEvents.NEW_USER)
  async handleNewUser(user: RetrieveUserDTO) {
    Logger.log(user.username, 'A new user just joined');
    await this.websocketService.handleUserEvent<EventDTO<RetrieveUserDTO>>(
      {
        sender: { Id: user.id, Username: user.username },
        payload: {
          message: 'A new user just joined',
          event: UserEvents.NEW_USER,
          data: user,
        },
      },
      SocketChannel.GENERAL,
    );
  }

  @OnEvent(UserEvents.UPDATE_PROFILE)
  async handleUserProfileUpdate(user: RetrieveUserDTO) {
    Logger.log(user.username, 'User Profile Update');
    await this.websocketService.handleUserEvent<EventDTO<RetrieveUserDTO>>(
      {
        sender: { Id: user.id, Username: user.username },
        payload: {
          event: UserEvents.UPDATE_PROFILE,
          message: 'Profile Update',
          data: user,
        },
      },
      SocketChannel.PRIVATE,
    );
  }
}
