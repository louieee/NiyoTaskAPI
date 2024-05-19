import { FileValidator } from '@nestjs/common';

export class SizeValidator extends FileValidator {
  constructor(protected readonly maxSize: number) {
    super({});
  }

  isValid(file: any): boolean {
    return file.size <= this.maxSize;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildErrorMessage(file: any): string {
    return `File size exceeds the limit of ${this.maxSize} bytes.`;
  }
}

export class TypeValidator extends FileValidator {
  constructor(protected readonly allowedTypes: string[]) {
    super({});
  }

  isValid(file: any): boolean {
    return this.allowedTypes.includes(file.mimetype);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildErrorMessage(file: any): string {
    return `Invalid file type. Allowed types are: ${this.allowedTypes.join(', ')}.`;
  }
}
