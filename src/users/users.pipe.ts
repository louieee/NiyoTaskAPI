import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validateSync } from 'class-validator';
import { CreateUserDTO, LoginDTO, updateUserDTO } from './users.dto';

@Injectable()
export class CreateUserValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(
    value: CreateUserDTO,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata,
  ): Promise<any> {
    value = <CreateUserDTO>value;
    if (!value) {
      throw new BadRequestException('No data was passed');
    }
    const dto = new CreateUserDTO();
    dto.username = value.username;
    dto.emailAddress = value.emailAddress;
    dto.firstName = value.firstName;
    dto.lastName = value.lastName;
    dto.password = value.password;
    const errors = validateSync(CreateUserDTO.name, dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });
    if (errors.length) throw new BadRequestException(errors[0].constraints);
    dto.username = dto.username.toLowerCase();
    dto.emailAddress = dto.emailAddress.toLowerCase();
    return dto;
  }
}


@Injectable()
export class LoginValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(
    value: LoginDTO,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata,
  ): Promise<any> {
    value = <LoginDTO>value;
    if (!value) {
      throw new BadRequestException('No data was passed');
    }
    const dto = new LoginDTO();
    dto.username = value.username;
    dto.password = value.password;
    const errors = validateSync(LoginDTO.name, dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });
    if (errors.length) throw new BadRequestException(errors[0].constraints);
    dto.username = dto.username.toLowerCase();
    return dto;
  }
}

export class updateUserValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(
    value: updateUserDTO,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata,
  ): Promise<any> {
    value = <updateUserDTO>value;
    if (!value) {
      throw new BadRequestException('No data was passed');
    }
    const dto = new updateUserDTO();
    dto.username = value.username;
    dto.emailAddress = value.emailAddress;
    dto.firstName = value.firstName;
    dto.lastName = value.lastName;
    const errors = validateSync(updateUserDTO.name, dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });
    if (errors.length) throw new BadRequestException(errors[0].constraints);
    dto.username = dto.username.toLowerCase();
    dto.emailAddress = dto.emailAddress.toLowerCase();
    return dto;
  }
}

