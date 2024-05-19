import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, validateSync } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export class TaskDTO {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  static validate(data: any) {
    const dto = new TaskDTO();
    dto.description = data.description;
    dto.title = data.title;
    const errors = validateSync(TaskDTO.name, dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });
    if (errors.length) throw new BadRequestException(errors[0].constraints);
    return dto;
  }
}

export class TaskDetailDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  done: boolean;

  @ApiProperty()
  dateAdded: Date;

  @ApiProperty()
  dateUpdated: Date;

  static map(task: any) {
    return {
      id: task.id,
      title: task.title,
      done: task.done,
      dateUpdated: task.dateUpdated,
      dateAdded: task.dateAdded,
      description: task.description,
    };
  }
}

export class TaskListQueryDTO {
  @ApiProperty({ required: false })
  search: string | null = null;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  done: boolean | null = null;

  @ApiProperty({
    required: false,
    format: 'YYYY-MM-DD',
    description: 'filter by date updated',
    type: Date,
  })
  @IsNotEmpty()
  startDate: Date | null = null;

  @ApiProperty({
    required: false,
    format: 'YYYY-MM-DD',
    description: 'filter by date updated',
    type: Date,
  })
  @IsNotEmpty()
  endDate: Date | null = null;

  static validate(data: any) {
    const dto = new TaskListQueryDTO();
    dto.search = data.search;
    dto.done = data.done === 'true';
    dto.startDate = new Date(data.startDate);
    dto.endDate = new Date(data.endDate);
    const errors = validateSync(TaskListQueryDTO.name, dto, {
      skipMissingProperties: true,
    });
    if (errors.length) throw new BadRequestException(errors[0].constraints);
    return dto;
  }
}

export class TaskListDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  done: boolean;
}

export class TaskListResponseDTO {
  @ApiProperty()
  count: number;
  @ApiProperty({ type: () => [TaskListDTO] }) // Function syntax for generic type
  result: any[];
}

export class DeleteTaskDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  taskIds: string[];

  static validate(data: any) {
    const dto = new DeleteTaskDTO();
    dto.taskIds = data.taskIds;
    const errors = validateSync(DeleteTaskDTO.name, dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
      skipMissingProperties: true,
    });
    if (errors.length) throw new BadRequestException(errors[0].constraints);
    return dto;
  }
}
