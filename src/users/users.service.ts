import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { deleteFile, handleFileUpload, hashPassword, verifyPassword } from '../common/common.helpers';
import { UserEmailService } from '../common/emails/user.emails';
import { JWTService } from '../common/security/jwt.security';
import { CreateUserDTO, RetrieveUserDTO, updateUserDTO } from './users.dto';
import { APIResponse, JWTTokenDTO } from '../common/common.dtos';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserEvents } from './users.enums';
import { TokenType } from '../common/common.enums';
import { appConfig } from '../common/config/app.configuration';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private UserModel: Model<UserDocument>,
    private mailService: UserEmailService,
    private jwtService: JWTService,
    private eventEmitter: EventEmitter2,
  ) {}
  profilePicDir = 'profilePics';
  async createUser(
    data: CreateUserDTO,
    file: Express.Multer.File,
  ): Promise<APIResponse<RetrieveUserDTO | null>> {
    let userExists = await this.UserModel.findOne({
      emailAddress: data.emailAddress,
    });
    if (userExists)
      throw new BadRequestException('A user with this email already exists');
    userExists = await this.UserModel.findOne({
      username: data.username,
    });
    if (userExists)
      throw new BadRequestException('A user with this username already exists');
    const hashedPassword = await hashPassword(data.password);
    const fileName = await handleFileUpload(this.profilePicDir, file);

    let newUser = new this.UserModel({
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      emailAddress: data.emailAddress,
      passwordHash: hashedPassword,
      profilePic: fileName,
      isActive: false,
      emailVerified: false,
    });
    await this.mailService.sendAccountVerificationMail(
      newUser.id,
      `${newUser.firstName} ${newUser.lastName}`,
      newUser.emailAddress,
    );
    newUser = await newUser.save();
    const retData = RetrieveUserDTO.map(newUser);
    await this.eventEmitter.emitAsync(UserEvents.NEW_USER, retData);
    return {
      message: 'User Created Successfully',
      data: retData,
      status: 201,
    };
  }
  async verifyUserAccount(token: string): Promise<APIResponse<null>> {
    const { payload: userId } = await this.jwtService.verifyLinkToken(token);
    const user = await this.UserModel.findById(userId);
    if (!user) throw new BadRequestException('This link is invalid');
    user.set({ isActive: true, emailVerified: true });
    user.save();
    await this.mailService.sendAccountVerificationSuccessMail(
      `${user.firstName} ${user.lastName}`,
      user.emailAddress,
    );
    return { message: 'Verification is successful', data: null, status: 200 };
  }

  async login(
    username: string,
    password: string,
  ): Promise<APIResponse<JWTTokenDTO>> {
    const user = await this.UserModel.findOne({
      username: username,
    });
    if (!user) throw new BadRequestException('You have no account with us');
    const correctPassword = await verifyPassword(password, user.passwordHash);
    if (!correctPassword)
      throw new BadRequestException('Incorrect credentials');
    if (!user.isActive && user.emailVerified)
      throw new BadRequestException('You have been blocked');
    if (!user.emailVerified) {
      await this.mailService.sendAccountVerificationMail(
        user.id,
        `${user.firstName} ${user.lastName}`,
        user.emailAddress,
      );
      return {
        message: 'Your account is not verified, Please check your email',
        data: null,
        status: 200,
      };
    }
    const accessToken = await this.jwtService.createAccessToken({
      Id: user.id,
      Username: user.username,
    });
    const refreshToken = await this.jwtService.createRefreshToken({
      Id: user.id,
      Username: user.username,
    });
    const retData = RetrieveUserDTO.map(user);
    await this.eventEmitter.emitAsync(UserEvents.LOGIN, retData);
    return {
      message: 'Login is Successful',
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      status: 200,
    };
  }

  async getAccessToken(
    refreshToken: string,
  ): Promise<APIResponse<JWTTokenDTO>> {
    const { payload: user } = await this.jwtService.verifyJWTToken(
      refreshToken,
      TokenType.REFRESH,
    );
    return {
      message: 'Access Token has been refreshed successfully',
      data: {
        accessToken: await this.jwtService.createAccessToken(user),
        refreshToken: await this.jwtService.createRefreshToken(user),
      },
      status: 200,
    };
  }

  async forgotPassword(email: string): Promise<APIResponse<null>> {
    const user = await this.UserModel.findOne({ emailAddress: email });
    if (!user) throw new BadRequestException('You have no account with us');
    await this.mailService.sendForgotPasswordMail(
      user.id,
      `${user.firstName} ${user.lastName}`,
      user.emailAddress,
    );
    return {
      message: 'A reset password link has been sent to your email',
      data: null,
      status: 200,
    };
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<APIResponse<null>> {
    const { payload: userId } = await this.jwtService.verifyLinkToken(token);
    const user = await this.UserModel.findById(userId);
    if (!user) throw new BadRequestException('You have no account with us');
    const passwordHash = await hashPassword(password);
    user.set({ passwordHash: passwordHash });
    user.save();
    return {
      message: 'Your password reset is successful. Proceed to login',
      data: null,
      status: 200,
    };
  }

  async viewProfile(userId: string): Promise<APIResponse<RetrieveUserDTO>> {
    const user = await this.UserModel.findById(userId);
    if (!user) throw new HttpException('This User does not exist', 404);

    return {
      message: 'success',
      data: RetrieveUserDTO.map(user),
      status: 200,
    };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<APIResponse<RetrieveUserDTO>> {
    const user = await this.UserModel.findById(userId);
    if (!user) throw new HttpException('This User does not exist', 404);
    const correctPassword = await verifyPassword(
      oldPassword,
      user.passwordHash,
    );
    if (!correctPassword) throw new BadRequestException('incorrect Password');
    const passwordHash = await hashPassword(newPassword);
    user.set({ passwordHash: passwordHash });
    user.save();

    return {
      message: 'Password successfully changed',
      data: RetrieveUserDTO.map(user),
      status: 200,
    };
  }

  async updateProfile(
    userId: string,
    userData: updateUserDTO,
    profilePic: Express.Multer.File | null,
  ): Promise<APIResponse<RetrieveUserDTO>> {
    const user = await this.UserModel.findById(userId);
    if (!user) throw new HttpException('This User does not exist', 404);
    if (userData.username != user.username) {
      const usernameExist = await this.UserModel.exists({
        username: userData.username,
        _id: { $ne: userId },
      });
      if (usernameExist)
        throw new BadRequestException('This username is taken');
    }
    let changedEmail = false;
    if (userData.emailAddress != user.emailAddress) {
      changedEmail = true;
      const emailExist = await this.UserModel.exists({
        emailAddress: userData.emailAddress,
        _id: { $ne: userId },
      });
      if (emailExist) throw new BadRequestException('This email is taken');
    }
    if (userData.profilePic != user.profilePic) {
      await deleteFile(
        `${appConfig.mediaDir}/${this.profilePicDir}`,
        user.profilePic.split('/').pop(),
      );
      user.profilePic = await handleFileUpload(this.profilePicDir, profilePic);
    }

    user.set({ ...userData, emailVerified: !changedEmail });
    user.save();
    if (changedEmail) {
      await this.mailService.sendAccountVerificationMail(
        user.id,
        `${user.firstName} ${user.lastName}`,
        user.emailAddress,
      );
    }
    const retData = RetrieveUserDTO.map(user);
    await this.eventEmitter.emitAsync(UserEvents.UPDATE_PROFILE, retData);
    return {
      message: 'profile update is successful',
      data: retData,
      status: 200,
    };
  }
}
