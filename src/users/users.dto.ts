import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsNotEmpty, IsString, validateSync } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export class UserDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  testId: string;

  @ApiProperty()
  @IsString()
  date: string;
}
export class RetrieveUserDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  emailAddress: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  profilePic: string | null;

  static map(user: any) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
      username: user.username,
      profilePic: user.profilePic,
    };
  }
}

export class CreateUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;
  @ApiProperty()
  @IsNotEmpty()
  lastName: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;
  @ApiProperty()
  @IsNotEmpty()
  username: string;
  @ApiProperty()
  @IsNotEmpty()
  password: string;
  @ApiProperty({ type: 'string', format: 'binary' })
  profilePic?: any;
}

export class LoginDTO {
  @ApiProperty()
  @IsNotEmpty()
  username: string;
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class TokenDTO {
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}

export class ForgotPasswordDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  static validate(data: any) {
    const dto = new ForgotPasswordDTO();
    dto.emailAddress = data.emailAddress;
    const errors = validateSync(ForgotPasswordDTO.name, dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });
    if (errors.length) throw new BadRequestException(errors[0].constraints);
    dto.emailAddress = dto.emailAddress.toLowerCase();
    return dto;
  }
}

export class PasswordResetDTO {
  @ApiProperty()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  newPassword: string;

  static validate(data: any) {
    const dto = new PasswordResetDTO();
    dto.newPassword = data.newPassword;
    dto.token = data.token;
    const errors = validateSync(PasswordResetDTO.name, dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });
    if (errors.length) throw new BadRequestException(errors[0].constraints);
    return dto;
  }
}

export class ChangePasswordDTO {
  @ApiProperty()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  newPassword: string;

  static validate(data: any) {
    const dto = new ChangePasswordDTO();
    dto.newPassword = data.newPassword;
    dto.oldPassword = data.oldPassword;

    const errors = validateSync(ChangePasswordDTO.name, dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });
    if (errors.length) throw new BadRequestException(errors[0].constraints);
    return dto;
  }
}

export class updateUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;
  @ApiProperty()
  @IsNotEmpty()
  lastName: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;
  @ApiProperty()
  @IsNotEmpty()
  username: string;
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profilePic?: any;
}
