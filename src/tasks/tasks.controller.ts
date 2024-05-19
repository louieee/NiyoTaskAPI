import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TaskService } from './tasks.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/config/file.configuration';
import { AuthRequest } from '../common/middlewares/security.middlewares';
import { DeleteTaskDTO, TaskDetailDTO, TaskDTO, TaskListQueryDTO, TaskListResponseDTO } from './tasks.dto';

@ApiBearerAuth('Bearer')
@Controller('tasks')
@ApiTags('Task')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Post('/')
  @ApiOperation({
    summary: 'Creates a new Task',
  })
  @ApiResponse({
    status: 200,
    type: TaskDetailDTO,
  })
  @ApiBody({
    type: TaskDTO,
  })
  async createTask(@Req() req: AuthRequest, @Body() body: TaskDTO) {
    body = TaskDTO.validate(body);
    return await this.service.createTask(req.user, body);
  }

  @Put('/:taskId')
  @ApiOperation({
    summary: 'Updates an existing Task',
  })
  @ApiParam({
    name: 'taskId',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    type: TaskDetailDTO,
  })
  @ApiBody({
    type: TaskDTO,
  })
  async updatesTask(
    @Req() req: AuthRequest,
    @Param('taskId') taskId: string,
    @Body() body: TaskDTO,
  ) {
    body = TaskDTO.validate(body);
    return await this.service.updateTask(req.user, taskId, body);
  }

  @Delete('/')
  @ApiOperation({
    summary: 'Deletes Tasks',
  })
  @ApiResponse({
    status: 204,
    type: null,
  })
  @ApiBody({
    type: DeleteTaskDTO,
  })
  async deleteTask(@Req() req: AuthRequest, @Body() body: DeleteTaskDTO) {
    body = DeleteTaskDTO.validate(body);
    return await this.service.deleteTasks(req.user, body.taskIds);
  }
  @Patch('/:taskId')
  @ApiOperation({
    summary: 'toggles a task done',
  })
  @ApiParam({
    name: 'taskId',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    type: TaskDetailDTO,
  })
  @ApiQuery({
    name: 'done',
    type: 'boolean',
    description: 'true or false',
    required: false,
  })
  async toggleTaskDone(
    @Req() req: AuthRequest,
    @Query('done') done: string | null = null,
    @Param('taskId') taskId: string,
  ) {
    let doneValue: boolean;
    if (done) doneValue = done === 'true';
    return await this.service.toggleTaskDone(req.user, taskId, doneValue);
  }

  @Get('/:taskId')
  @ApiOperation({
    summary: 'Retrieves a task',
  })
  @ApiResponse({
    status: 200,
    type: TaskDetailDTO,
  })
  @ApiParam({
    name: 'taskId',
    type: 'string',
  })
  async getTask(@Req() req: AuthRequest, @Param('taskId') taskId: string) {
    return await this.service.retrieveTask(req.user.Id, taskId);
  }

  @Get('/')
  @ApiOperation({
    summary: 'Retrieves all tasks',
  })
  @ApiResponse({
    status: 200,
    type: TaskListResponseDTO,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profilePic', multerConfig))
  async getTasks(@Req() req: AuthRequest, @Query() query: TaskListQueryDTO) {
    query = TaskListQueryDTO.validate(query);
    return await this.service.retrieveTasks(req.user.Id, 0, 10, query);
  }
}
