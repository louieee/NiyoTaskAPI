import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JWTService } from '../security/jwt.security';
import { TokenType } from '../common.enums';
import { UserJWTPayloadDTO } from '../common.dtos';
import { UserService } from '../../users/users.service';

export interface AuthRequest extends Request {
  user: UserJWTPayloadDTO | undefined;
}

export class InvalidHostMiddleware implements NestMiddleware {
  async use(req: Request, res: Request, next: NextFunction) {
    const host = req.headers.host;
    const allowedHosts = ['localhost:3000', 'size.com'];
    if (!allowedHosts.includes(host)) {
      throw new UnauthorizedException('Invalid host');
    }
    next();
  }
}

@Injectable()
export class JWTMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JWTService,
    private readonly userService: UserService,
  ) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    // const url = req.originalUrl;
    // if (url.startsWith('/api/v1/auth')) {
    //   return next();
    // }
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const { payload: user } = await this.jwtService.verifyJWTToken(
        token,
        TokenType.ACCESS,
      );
      const userExist = await this.userService.userExist(user.Id);
      if (!userExist)
        throw new UnauthorizedException('You have no account with us');
      req.user = user;
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
