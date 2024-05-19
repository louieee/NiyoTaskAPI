import { Body, Controller, Get, Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserService } from '../users.service';
import { AuthRequest } from '../../common/middlewares/security.middlewares';
import { ChangePasswordDTO, RetrieveUserDTO, updateUserDTO } from '../users.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../common/config/file.configuration';
import { FileSizeAndTypeValidationPipe } from '../../common/pipes/file.pipe';
import { updateUserValidationPipe } from '../users.pipe';

@ApiBearerAuth('Bearer')
@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(
    private readonly service: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get('/profile')
  @ApiOperation({
    summary: 'enables a logged in user to view their profile',
  })
  @ApiResponse({
    status: 200,
    type: RetrieveUserDTO,
  })
  async viewProfile(@Req() req: AuthRequest) {
    return await this.service.viewProfile(req.user.Id);
  }

  @Put('/profile')
  @ApiOperation({
    summary: "Updates a logged in user's profile",
  })
  @ApiResponse({
    status: 200,
    type: RetrieveUserDTO,
  })
  @ApiBody({
    type: updateUserDTO,
    description: 'user details',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profilePic', multerConfig))
  async updateProfile(
    @Req() req: AuthRequest,
    @Body() body: updateUserDTO,
    @UploadedFile()
    profilePic: Express.Multer.File | null = null,
  ) {
    const fileValidator = new FileSizeAndTypeValidationPipe(100000, [
      'image/jpeg',
    ]);
    const dataValidator = new updateUserValidationPipe();
    profilePic = await fileValidator.transform(profilePic, null);
    body = await dataValidator.transform(body, null);
    return await this.service.updateProfile(req.user.Id, body, profilePic);
  }

  @Post('/change-password')
  @ApiOperation({
    summary: "Changes a logged in user's password",
  })
  @ApiResponse({
    status: 200,
    type: RetrieveUserDTO,
  })
  @ApiBody({
    type: ChangePasswordDTO,
  })
  async changePassword(
    @Req() req: AuthRequest,
    @Body() body: ChangePasswordDTO,
  ) {
    body = ChangePasswordDTO.validate(body);
    return await this.service.changePassword(
      req.user.Id,
      body.oldPassword,
      body.newPassword,
    );
  }
}
