import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { SizeValidator, TypeValidator } from '../validators/file.validator';

@Injectable()
export class FileSizeAndTypeValidationPipe implements PipeTransform {
  constructor(
    private readonly maxSize?: number,
    private readonly allowedTypes?: string[],
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (!value) {
      throw new BadRequestException('No file was passed');
    }
    if (this.maxSize) {
      const sizeValidator = new SizeValidator(this.maxSize);
      if (!sizeValidator.isValid(value)) {
        throw new BadRequestException(sizeValidator.buildErrorMessage(value));
      }
    }

    if (this.allowedTypes) {
      const typeValidator = new TypeValidator(this.allowedTypes);
      if (!typeValidator.isValid(value)) {
        throw new BadRequestException(typeValidator.buildErrorMessage(value));
      }
    }

    return value;
  }
}

