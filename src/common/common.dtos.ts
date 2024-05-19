import { ApiProperty } from '@nestjs/swagger';

export class APIResponse<T> {
  @ApiProperty()
  message: string;
  data: T;
  @ApiProperty()
  status: number;
}

export interface UserJWTPayloadDTO {
  Id: string;
  Username: string;
}

export interface WebsocketPayload<T> {
  sender: UserJWTPayloadDTO;
  payload: T;
}

export interface EventDTO<T> {
  event: string;
  message: string;
  data: T;
}

export class JWTTokenDTO {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}
