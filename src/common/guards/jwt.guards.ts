import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JWTService } from '../security/jwt.security';
import { TokenType } from '../common.enums';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JWTService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.query.token;
    try {
      this.jwtService
        .verifyJWTToken(token, TokenType.ACCESS)
        .then(({ payload: user }) => {
          context.switchToWs().getData().user = user;
          return true;
        });
    } catch (err) {
      return false;
    }
  }
}
