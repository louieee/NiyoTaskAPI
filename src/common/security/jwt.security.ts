import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { envConfig } from '../config/env.configuration';
import { UserJWTPayloadDTO } from '../common.dtos';
import { TokenType } from '../common.enums';

@Injectable()
export class JWTService {
  constructor(private config: ConfigService) {}
  getHello(): string {
    return 'Im Auth Service';
  }

  private createToken(
    data: any,
    expiresIn: string | null,
    secret: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const jwtOptions = { issuer: this.config.get(envConfig.JWT_ISSUER) };
      if (expiresIn) jwtOptions['expiresIn'] = expiresIn;
      jwt.sign({ payload: data }, secret, jwtOptions, (err, encoded) => {
        if (err) {
          Logger.log('JWT Error: ', err.message);
          reject(new InternalServerErrorException(err));
        }
        resolve(encoded);
      });
    });
  }

  private verifyToken<T>(
    token: string,
    secret: string,
  ): Promise<{ payload: T }> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        secret,
        { issuer: this.config.get(envConfig.JWT_ISSUER) },
        (err: any, decoded: { payload: T }) => {
          if (!err) resolve(decoded);
          if (err.name === 'TokenExpiredError') {
            throw new UnauthorizedException('Token has expired');
          }
          reject(new UnauthorizedException('This token is invalid'));
        },
      );
    });
  }

  async createAccessToken(payload: UserJWTPayloadDTO) {
    return await this.createToken(
      payload,
      this.config.get(envConfig.JWT_ACCESS_LIFESPAN),
      this.config.get(envConfig.JWT_SECRET),
    );
  }

  async createRefreshToken(payload: UserJWTPayloadDTO) {
    return await this.createToken(
      payload,
      this.config.get(envConfig.JWT_REFRESH_LIFESPAN),
      this.config.get(envConfig.JWT_REFRESH_SECRET),
    );
  }
  async verifyJWTToken(token: string, tokenType: TokenType) {
    return await this.verifyToken<UserJWTPayloadDTO>(
      token,
      this.config.get(
        tokenType === TokenType.ACCESS
          ? envConfig.JWT_SECRET
          : envConfig.JWT_REFRESH_SECRET,
      ),
    );
  }

  async generateLinkToken(id: string, expiresIn: string | null) {
    return await this.createToken(
      id,
      expiresIn,
      this.config.get(envConfig.APP_SECRET),
    );
  }

  async verifyLinkToken(token: string) {
    return await this.verifyToken<string>(
      token,
      this.config.get(envConfig.APP_SECRET),
    );
  }
}
