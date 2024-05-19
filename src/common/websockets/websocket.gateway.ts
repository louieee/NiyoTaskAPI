import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JWTService } from '../security/jwt.security';
import { SocketChannel, TokenType } from '../common.enums';
import { JwtAuthGuard } from '../guards/jwt.guards';
import { Logger, UseGuards } from '@nestjs/common';
import { WebsocketPayload } from '../common.dtos';

@WebSocketGateway()
export class WebsocketsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly jwtService: JWTService) {}

  private users: Map<string, Socket> = new Map();
  private userChannel: string;
  generalChannel = 'general';

  async afterInit(server: Server) {
    Logger.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      let token = client.handshake.query.token;
      if (typeof token !== 'string') token = token[0];
      const { payload: user } = await this.jwtService.verifyJWTToken(
        token,
        TokenType.ACCESS,
      );
      this.users.set(user.Id, client);
      this.userChannel = `user-${user.Id}`;
      client.emit('connected', 'Successfully connected to WebSocket server');
      this.server.emit(this.generalChannel, `${user.Username} has joined`);
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    let disconnectedUser = null;
    this.users.forEach((value, key) => {
      if (value === client) {
        disconnectedUser = key;
        this.users.delete(key);
      }
    });

    if (disconnectedUser) {
      this.server.emit(this.generalChannel, `${disconnectedUser} has left`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('taskEvent')
  async handleTaskEvent<T>(dto: WebsocketPayload<T>): Promise<void> {
    const { sender } = dto;
    if (!this.users.has(sender.Id)) return;
    const userSocket = this.users.get(sender.Id);
    userSocket.emit(this.userChannel, dto);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('userEvent')
  async handleUserEvent<T>(
    dto: WebsocketPayload<T>,
    channel: SocketChannel,
  ): Promise<void> {
    const { sender } = dto;
    if (!this.users.has(sender.Id)) return;
    const userSocket = this.users.get(sender.Id);
    if (channel == SocketChannel.PRIVATE || SocketChannel.BOTH)
      userSocket.emit(this.userChannel, dto);
    if (channel == SocketChannel.GENERAL || SocketChannel.BOTH)
      userSocket.emit(this.generalChannel, dto);
  }
}
