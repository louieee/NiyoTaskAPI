import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDTO, ForgotPasswordDTO, LoginDTO, PasswordResetDTO, RetrieveUserDTO, TokenDTO } from '../users.dto';
import { FileSizeAndTypeValidationPipe } from '../../common/pipes/file.pipe';
import { CreateUserValidationPipe, LoginValidationPipe } from '../users.pipe';
import { multerConfig } from '../../common/config/file.configuration';
import { UserService } from '../users.service';
import { JWTTokenDTO } from '../../common/common.dtos';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly service: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  @Post('/signup')
  @ApiOperation({
    summary: 'Signs up a new user',
  })
  @ApiBody({
    type: CreateUserDTO,
    description: 'user details',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    type: RetrieveUserDTO,
  })
  @UseInterceptors(FileInterceptor('profilePic', multerConfig))
  async createUser(
    @Body() body: CreateUserDTO,
    @UploadedFile()
    profilePic: Express.Multer.File,
  ) {
    const fileValidator = new FileSizeAndTypeValidationPipe(100000, [
      'image/jpeg',
    ]);
    const dataValidator = new CreateUserValidationPipe();
    profilePic = await fileValidator.transform(profilePic, null);
    body = await dataValidator.transform(body, null);
    return await this.service.createUser(body, profilePic);
  }

  @Post('/verify')
  @ApiOperation({
    summary: 'Verifies a new user',
  })
  @ApiResponse({
    status: 200,
    type: null,
  })
  @ApiBody({
    type: TokenDTO,
    description: 'token from verification link',
  })
  async verifyAccount(@Body() data: TokenDTO) {
    return await this.service.verifyUserAccount(data.token);
  }

  @Post('/login')
  @ApiOperation({
    summary: 'logs in an existing user',
  })
  @ApiResponse({
    status: 200,
    type: JWTTokenDTO,
  })
  @ApiBody({
    type: LoginDTO,
    description: 'user login details',
  })
  async login(@Body() body: LoginDTO) {
    const dataValidator = new LoginValidationPipe();
    body = await dataValidator.transform(body, null);
    return await this.service.login(body.username, body.password);
  }

  @Post('/forgot-password')
  @ApiOperation({
    summary: 'enables a user to initiate password reset',
  })
  @ApiResponse({
    status: 200,
    type: null,
  })
  @ApiBody({
    type: ForgotPasswordDTO,
    description: 'email address',
  })
  async forgotPassword(@Body() body: ForgotPasswordDTO) {
    body = ForgotPasswordDTO.validate(body);
    return await this.service.forgotPassword(body.emailAddress);
  }

  @Post('/reset-password')
  @ApiOperation({
    summary: 'enables a user to reset their password',
  })
  @ApiResponse({
    status: 200,
    type: null,
  })
  @ApiBody({
    type: PasswordResetDTO,
  })
  async passwordReset(@Body() body: PasswordResetDTO) {
    body = PasswordResetDTO.validate(body);
    return await this.service.resetPassword(body.token, body.newPassword);
  }

  @Post('/get-access-token')
  @ApiOperation({
    summary: 'get access token from refresh token',
  })
  @ApiResponse({
    status: 200,
    type: JWTTokenDTO,
  })
  @ApiBody({
    type: TokenDTO,
  })
  async getAccessToken(@Body() body: TokenDTO) {
    return await this.service.getAccessToken(body.token);
  }
}
